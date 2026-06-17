import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-05-27.dahlia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    if (endpointSecret && !endpointSecret.startsWith('whsec_mock')) {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } else {
      // Mock / Dev mode fallback without signature verification
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook Error: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Retrieve metadata
    const itemsStr = session.metadata?.items;
    const total = (session.amount_total || 0) / 100;

    try {
      // Create a Venda record in the database
      const venda = await db.venda.create({
        data: {
          total: total,
          paymentMethod: 'CARTAO_CREDITO',
          isPresencial: false, // E-commerce sale
        },
      });

      // Update stocks
      if (itemsStr) {
        const items = JSON.parse(itemsStr) as { name: string; price: number; quantity: number }[];
        for (const item of items) {
          // Find product by name and decrement stock
          const product = await db.produto.findFirst({
            where: { name: item.name },
          });
          if (product) {
            await db.produto.update({
              where: { id: product.id },
              data: {
                stock: {
                  decrement: Math.min(product.stock, item.quantity),
                },
              },
            });
          }
        }
      }

      console.log(`Sale registered via Webhook: ${venda.id}`);
    } catch (dbErr) {
      console.error('Failed to persist webhook checkout sale to DB:', dbErr);
    }
  }

  return NextResponse.json({ received: true });
}
