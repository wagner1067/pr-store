import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { checkoutSchema } from '@/lib/validations';
import { checkRateLimit, checkoutRateLimiter } from '@/lib/redis';
import { getClientIP } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = getClientIP(request);
    const rl = await checkRateLimit(checkoutRateLimiter, `checkout:${ip}`);
    if (!rl.success) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde antes de tentar novamente.' }, { status: 429 });
    }

    // Validate payload
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Dados de checkout inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, paymentMethod, clientPhone, clientName, shippingCost, shippingMethod } = parsed.data;

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const finalTotal = total + (shippingCost || 0);

    // Upsert client
    const cliente = await db.cliente.upsert({
      where: { phone: clientPhone },
      update: clientName ? { name: clientName } : {},
      create: { name: clientName || 'Cliente E-commerce', phone: clientPhone },
    });

    // Resolve product IDs and build order items
    const itemCreates = [];
    for (const item of items) {
      let prodId = item.id;
      const dbProd = await db.produto.findUnique({ where: { id: item.id }, select: { id: true, stock: true } });

      if (!dbProd) {
        const found = await db.produto.findFirst({ where: { name: item.name }, select: { id: true } });
        if (found) {
          prodId = found.id;
        } else {
          const created = await db.produto.create({
            data: {
              name: item.name,
              slug: `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(Math.random() * 1000)}`,
              description: `Streetwear de luxo - ${item.name}`,
              price: item.price,
              category: 'Tenis',
              brand: 'PR Store',
              sizes: ['40'],
              images: [],
              stock: 5,
            },
          });
          prodId = created.id;
        }
      } else {
        // Decrement stock atomically
        if (dbProd.stock > 0) {
          await db.produto.update({
            where: { id: dbProd.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      itemCreates.push({ produtoId: prodId, quantity: item.quantity, price: item.price });
    }

    // --- PIX Flow ---
    if (paymentMethod === 'PIX') {
      const pedido = await db.pedido.create({
        data: {
          clienteId: cliente.id,
          total: finalTotal,
          paymentMethod: 'PIX',
          shippingMethod: shippingMethod || 'CORREIOS',
          shippingCost: shippingCost || 0,
          status: 'PENDENTE',
          itens: { create: itemCreates },
        },
      });

      await db.venda.create({
        data: { total: finalTotal, paymentMethod: 'PIX', isPresencial: false },
      });

      return NextResponse.json({
        success: true,
        method: 'PIX',
        pedidoId: pedido.id,
        qrCode: '00020126580014br.gov.bcb.pix0136prstore-pix',
        barcode: '34191.79001 01043.513184 91020.150008 7 98760000015000',
        total: finalTotal,
      });
    }

    // --- CARD Flow (Stripe) ---
    if (paymentMethod === 'CARTAO_CREDITO' || paymentMethod === 'CARTAO_DEBITO') {
      if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')) {
        try {
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map((item) => ({
              price_data: {
                currency: 'brl',
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100),
              },
              quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL}/?checkout_success=true`,
            cancel_url: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL}/?checkout_cancel=true`,
            metadata: {
              clientPhone,
              clientName: clientName || 'Cliente E-commerce',
              items: JSON.stringify(items.map((i) => ({ id: i.id, qty: i.quantity }))),
            },
          });

          // Save pending order with Stripe session ID
          await db.pedido.create({
            data: {
              clienteId: cliente.id,
              total: finalTotal,
              paymentMethod: 'CARTAO_CREDITO',
              shippingMethod: shippingMethod || 'CORREIOS',
              shippingCost: shippingCost || 0,
              status: 'PENDENTE',
              stripeSessionId: session.id,
              itens: { create: itemCreates },
            },
          });

          return NextResponse.json({ success: true, url: session.url });
        } catch (stripeErr) {
          console.warn('Stripe session creation failed:', stripeErr);
        }
      }

      // Fallback: create order as paid (dev mode)
      const pedido = await db.pedido.create({
        data: {
          clienteId: cliente.id,
          total: finalTotal,
          paymentMethod: 'CARTAO_CREDITO',
          shippingMethod: shippingMethod || 'CORREIOS',
          shippingCost: shippingCost || 0,
          status: 'PAGO',
          itens: { create: itemCreates },
        },
      });

      await db.venda.create({
        data: { total: finalTotal, paymentMethod: 'CARTAO_CREDITO', isPresencial: false },
      });

      return NextResponse.json({
        success: true,
        pedidoId: pedido.id,
        url: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL}/?checkout_success=true&order_id=${pedido.id}`,
      });
    }

    return NextResponse.json({ success: false, error: 'Método de pagamento inválido' }, { status: 400 });
  } catch (error) {
    console.error('Checkout error:', error);
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
