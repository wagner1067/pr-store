import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2023-10-16' as any,
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
    const clientPhone = session.metadata?.clientPhone;
    const clientName = session.metadata?.clientName || 'Cliente E-commerce';
    const shippingCost = parseFloat(session.metadata?.shippingCost || '0');
    const shippingMethod = session.metadata?.shippingMethod || 'Retirada em Mãos';
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

      if (clientPhone) {
        // Create/Find client in DB
        const cliente = await db.cliente.upsert({
          where: { phone: clientPhone },
          update: { name: clientName },
          create: { name: clientName, phone: clientPhone },
        });

        let shipEnum: 'RETIRADA' | 'MOTO_FRETE' | 'CORREIOS' = 'CORREIOS';
        if (shippingMethod.includes('Moto')) {
          shipEnum = 'MOTO_FRETE';
        } else if (shippingMethod.includes('Retirada')) {
          shipEnum = 'RETIRADA';
        }

        // Parse items and create Pedido
        if (itemsStr) {
          const items = JSON.parse(itemsStr) as { id: string; name: string; price: number; quantity: number }[];
          
          const itemCreates = [];
          for (const item of items) {
            let finalProdId = item.id;
            const dbProd = await db.produto.findUnique({ where: { id: item.id } });
            if (!dbProd) {
              const foundProd = await db.produto.findFirst({ where: { name: item.name } });
              if (foundProd) {
                finalProdId = foundProd.id;
              } else {
                const newProd = await db.produto.create({
                  data: {
                    name: item.name,
                    slug: `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(Math.random() * 1000)}`,
                    description: `Streetwear de luxo - ${item.name}`,
                    price: item.price,
                    category: 'Tenis',
                    brand: 'PR Store',
                    sizes: ['40'],
                    images: ['👟'],
                    stock: 5,
                  }
                });
                finalProdId = newProd.id;
              }
            }
            
            itemCreates.push({
              produtoId: finalProdId,
              quantity: item.quantity,
              price: item.price,
            });

            // Update stocks: decrement by quantity bought
            const product = await db.produto.findUnique({ where: { id: finalProdId } });
            if (product) {
              await db.produto.update({
                where: { id: finalProdId },
                data: {
                  stock: {
                    decrement: Math.min(product.stock, item.quantity),
                  },
                },
              });
            }
          }

          // Create Pedido in Supabase Postgres
          await db.pedido.create({
            data: {
              clienteId: cliente.id,
              total: total,
              paymentMethod: 'CARTAO_CREDITO',
              shippingMethod: shipEnum,
              shippingCost: shippingCost,
              status: 'PAGO',
              itens: {
                create: itemCreates,
              },
            },
          });
        }
      }

      console.log(`Sale registered via Webhook: ${venda.id}`);
    } catch (dbErr) {
      console.error('Failed to persist webhook checkout sale to DB:', dbErr);
    }
  }

  return NextResponse.json({ received: true });
}
