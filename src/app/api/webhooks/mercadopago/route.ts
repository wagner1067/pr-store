import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invalidateCache } from '@/lib/redis';
import {
  getMercadoPagoPayment,
  validateMercadoPagoSignature,
  mapMpPaymentType,
} from '@/lib/mercadopago';

/**
 * Mercado Pago Webhook Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Recebe notificações de pagamento (topic=payment).
 * O MP envia: ?type=payment&data.id=<paymentId> + body { type, data: { id } }.
 *
 * Fluxo:
 *  1. Valida a assinatura (x-signature) — rejeita se inválida.
 *  2. Busca o pagamento real na API do MP (nunca confia só no payload).
 *  3. Atualiza o pedido pelo external_reference (= pedido.id).
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);

    // data.id pode vir na query (?data.id=) ou no corpo da requisição.
    let dataId = url.searchParams.get('data.id') || url.searchParams.get('id');
    const type = url.searchParams.get('type') || url.searchParams.get('topic');

    let body: { type?: string; action?: string; data?: { id?: string } } = {};
    try {
      body = await request.json();
    } catch {
      // Algumas notificações não têm corpo JSON — tudo bem.
    }
    if (!dataId && body?.data?.id) dataId = String(body.data.id);
    const eventType = type || body?.type;

    // ── 1. Valida assinatura ──────────────────────────────────────────────────
    const valid = validateMercadoPagoSignature({
      xSignature: request.headers.get('x-signature'),
      xRequestId: request.headers.get('x-request-id'),
      dataId,
    });
    if (!valid) {
      console.warn('[MercadoPago Webhook] Assinatura inválida — requisição rejeitada.');
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    // Só processamos notificações de pagamento.
    if (eventType && eventType !== 'payment') {
      return NextResponse.json({ received: true, ignored: eventType });
    }
    if (!dataId) {
      return NextResponse.json({ received: true, status: 'no_data_id' });
    }

    // ── 2. Busca o pagamento real na API do MP ────────────────────────────────
    const payment = await getMercadoPagoPayment(dataId);
    const orderId = payment.external_reference;
    if (!orderId) {
      console.warn(`[MercadoPago Webhook] Pagamento ${dataId} sem external_reference.`);
      return NextResponse.json({ received: true, status: 'no_reference' });
    }

    const pedido = await db.pedido.findUnique({ where: { id: orderId } });
    if (!pedido) {
      console.warn(`[MercadoPago Webhook] Pedido não encontrado: ${orderId}`);
      return NextResponse.json({ received: true, status: 'unknown_order' });
    }

    // ── Idempotência ──────────────────────────────────────────────────────────
    if (pedido.status === 'PAGO' || pedido.status === 'CANCELADO') {
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    // ── 3. Atualiza pedido conforme status ────────────────────────────────────
    if (payment.status === 'approved') {
      const paymentMethod = mapMpPaymentType(payment.payment_type_id);

      await db.pedido.update({
        where: { id: orderId },
        data: {
          status: 'PAGO',
          paymentMethod,
          stripeSessionId: String(payment.id), // reaproveitado p/ conciliação
        },
      });

      await db.venda.create({
        data: { total: pedido.total, paymentMethod, isPresencial: false },
      });

      await invalidateCache('dashboard:sales:*', 'dashboard:orders');
      console.log(`[MercadoPago] Pagamento aprovado — Pedido: ${orderId} | Payment: ${payment.id}`);
      return NextResponse.json({ received: true, status: 'approved', orderId });
    }

    if (
      payment.status === 'rejected' ||
      payment.status === 'cancelled' ||
      payment.status === 'refunded' ||
      payment.status === 'charged_back'
    ) {
      await db.pedido.update({ where: { id: orderId }, data: { status: 'CANCELADO' } });

      // Restaura estoque
      const itens = await db.itemPedido.findMany({
        where: { pedidoId: orderId },
        select: { produtoId: true, quantity: true },
      });
      await Promise.all(
        itens.map((item) =>
          db.produto.update({
            where: { id: item.produtoId },
            data: { stock: { increment: item.quantity } },
          })
        )
      );

      await invalidateCache('products:list:*', 'dashboard:orders');
      console.log(`[MercadoPago] Pagamento ${payment.status} — Pedido: ${orderId}`);
      return NextResponse.json({ received: true, status: payment.status, orderId });
    }

    // pending / in_process → aguarda próxima notificação
    console.log(`[MercadoPago] Status intermediário (${payment.status}) — Pedido: ${orderId}`);
    return NextResponse.json({ received: true, status: payment.status });
  } catch (error) {
    console.error('[MercadoPago Webhook] Erro interno:', error);
    // 500 faz o MP reenviar a notificação.
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}
