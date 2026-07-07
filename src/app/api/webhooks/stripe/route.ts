import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const stripeSessionId = session.id;

        // Update order status to PAGO
        const pedido = await db.pedido.findFirst({
          where: { stripeSessionId },
        });

        if (pedido) {
          await db.pedido.update({
            where: { id: pedido.id },
            data: { status: 'PAGO' },
          });

          // Log the sale
          await db.venda.create({
            data: {
              total: pedido.total,
              paymentMethod: 'CARTAO_CREDITO',
              isPresencial: false,
            },
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        console.warn('Payment failed:', intent.id, intent.last_payment_error?.message);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
