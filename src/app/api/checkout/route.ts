import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkoutSchema } from '@/lib/validations';
import { checkRateLimit, checkoutRateLimiter, invalidateCache } from '@/lib/redis';
import { getClientIP } from '@/lib/utils';
import {
  createMercadoPagoPreference,
  isMercadoPagoConfigured,
} from '@/lib/mercadopago';

export async function POST(request: Request) {
  try {
    // ── Rate limit ────────────────────────────────────────────────────────────
    const ip = getClientIP(request);
    const rl = await checkRateLimit(checkoutRateLimiter, `checkout:${ip}`);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde antes de tentar novamente.' },
        { status: 429 }
      );
    }

    // ── Validate payload ──────────────────────────────────────────────────────
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Dados de checkout inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, paymentMethod, clientPhone, clientName, shippingCost, shippingMethod } =
      parsed.data;

    // ── Upsert client (lead capture obrigatório) ──────────────────────────────
    const cliente = await db.cliente.upsert({
      where: { phone: clientPhone },
      update: clientName ? { name: clientName } : {},
      create: { name: clientName || 'Cliente E-commerce', phone: clientPhone },
    });

    // ── Resolve products, validar preço e estoque a partir do BANCO ──────────
    // SEGURANÇA: o preço NUNCA vem do cliente. Sempre usamos o preço do banco.
    const itemCreates: { produtoId: string; quantity: number; price: number; name: string }[] = [];
    const now = new Date();
    let total = 0;

    for (const item of items) {
      const dbProd = await db.produto.findUnique({
        where: { id: item.id },
        select: {
          id: true,
          stock: true,
          name: true,
          price: true,
          promoPrice: true,
          promoUntil: true,
          isActive: true,
        },
      });

      // Rejeita item inexistente/inativo — nunca cria produto órfão.
      if (!dbProd || !dbProd.isActive) {
        return NextResponse.json(
          { success: false, error: `Produto indisponível: ${item.name}` },
          { status: 400 }
        );
      }

      if (dbProd.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Produto "${dbProd.name}" sem estoque suficiente.` },
          { status: 409 }
        );
      }

      // Preço efetivo definido pelo servidor (respeita promoção válida).
      const promoValida =
        dbProd.promoPrice != null &&
        (!dbProd.promoUntil || new Date(dbProd.promoUntil) > now);
      const unitPrice = promoValida ? dbProd.promoPrice! : dbProd.price;

      await db.produto.update({
        where: { id: dbProd.id },
        data: { stock: { decrement: item.quantity } },
      });

      total += unitPrice * item.quantity;
      itemCreates.push({
        produtoId: dbProd.id,
        quantity: item.quantity,
        price: unitPrice,
        name: dbProd.name,
      });
    }

    const finalTotal = total + (shippingCost || 0);

    // Invalidate product cache after stock change
    await invalidateCache('products:list:*');

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';

    // ── Criar pedido PENDENTE no banco ────────────────────────────────────────
    const pedido = await db.pedido.create({
      data: {
        clienteId: cliente.id,
        total: finalTotal,
        paymentMethod,
        shippingMethod: shippingMethod || 'CORREIOS',
        shippingCost: shippingCost || 0,
        status: 'PENDENTE',
        itens: {
          create: itemCreates.map((it) => ({
            produtoId: it.produtoId,
            quantity: it.quantity,
            price: it.price,
          })),
        },
      },
    });

    // ════════════════════════════════════════════════════════════════════════
    // Mercado Pago Checkout Pro — PIX, Cartão e Boleto num único checkout.
    // O cliente escolhe o método dentro do ambiente seguro do Mercado Pago.
    // ════════════════════════════════════════════════════════════════════════
    if (isMercadoPagoConfigured()) {
      try {
        const mpItems = itemCreates.map((it) => ({
          title: it.name,
          quantity: it.quantity,
          unit_price: it.price,
          currency_id: 'BRL',
        }));

        // Frete como item adicional (se houver).
        if (shippingCost && shippingCost > 0) {
          mpItems.push({
            title: 'Frete',
            quantity: 1,
            unit_price: shippingCost,
            currency_id: 'BRL',
          });
        }

        const preference = await createMercadoPagoPreference({
          orderId: pedido.id,
          items: mpItems,
          payerName: clientName,
          successUrl: `${origin}/?checkout_success=true&order_id=${pedido.id}`,
          failureUrl: `${origin}/?checkout_failure=true&order_id=${pedido.id}`,
          pendingUrl: `${origin}/?checkout_pending=true&order_id=${pedido.id}`,
          notificationUrl: `${origin}/api/webhooks/mercadopago`,
        });

        return NextResponse.json({
          success: true,
          method: 'MERCADOPAGO',
          pedidoId: pedido.id,
          checkoutUrl: preference.init_point,
          total: finalTotal,
        });
      } catch (err) {
        console.error('[MercadoPago] Falha ao criar preferência:', err);
        // cai para o tratamento abaixo
      }
    }

    // ── SEGURANÇA: em produção nunca marcamos como PAGO sem pagamento real ────
    if (process.env.NODE_ENV === 'production') {
      // Reverte estoque e cancela o pedido que não pôde iniciar pagamento.
      await Promise.all(
        itemCreates.map((it) =>
          db.produto.update({
            where: { id: it.produtoId },
            data: { stock: { increment: it.quantity } },
          })
        )
      );
      await db.pedido.update({ where: { id: pedido.id }, data: { status: 'CANCELADO' } });
      await invalidateCache('products:list:*');
      return NextResponse.json(
        {
          success: false,
          error: 'Não foi possível iniciar o pagamento. Tente novamente em instantes.',
        },
        { status: 502 }
      );
    }

    // ── Dev fallback — SOMENTE fora de produção ───────────────────────────────
    // Marca como pago para permitir testar o fluxo sem credenciais do MP.
    await db.pedido.update({ where: { id: pedido.id }, data: { status: 'PAGO' } });
    await db.venda.create({
      data: { total: finalTotal, paymentMethod, isPresencial: false },
    });

    return NextResponse.json({
      success: true,
      method: 'DEV_SIMULADO',
      pedidoId: pedido.id,
      url: `${origin}/?checkout_success=true&order_id=${pedido.id}`,
      message: 'Modo de desenvolvimento: configure MERCADOPAGO_ACCESS_TOKEN para pagamento real.',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
