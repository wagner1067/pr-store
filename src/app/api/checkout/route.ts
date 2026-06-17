import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, paymentMethod, clientPhone, clientName, shippingCost, shippingMethod } = body as {
      items: CheckoutItem[];
      paymentMethod: 'PIX' | 'CARD';
      clientPhone: string;
      clientName: string;
      shippingCost?: number;
      shippingMethod?: string;
    };

    if (!clientPhone) {
      return NextResponse.json({ success: false, error: 'Client phone is required' }, { status: 400 });
    }

    // 1. Find or create the client in Supabase
    const cliente = await db.cliente.upsert({
      where: { phone: clientPhone },
      update: clientName ? { name: clientName } : {},
      create: { name: clientName || 'Cliente E-commerce', phone: clientPhone },
    });

    const total = items.reduce((acc: number, item: CheckoutItem) => acc + (item.price * item.quantity), 0);
    const shipCost = shippingCost || 0;
    const finalTotal = total + shipCost;

    // 2. Create the Pedido and ItemPedido in Prisma
    // Map shipping method string to enum
    let shipEnum: 'RETIRADA' | 'MOTO_FRETE' | 'CORREIOS' = 'CORREIOS';
    if (shippingMethod?.includes('Moto')) {
      shipEnum = 'MOTO_FRETE';
    } else if (shippingMethod?.includes('Retirada')) {
      shipEnum = 'RETIRADA';
    }

    // First check if products exist in database to avoid foreign key violations.
    // If not (e.g. they are mock product IDs), we look them up or create them.
    const itemCreates = [];
    for (const item of items) {
      const dbProd = await db.produto.findUnique({ where: { id: item.id } });
      let finalProdId = item.id;
      if (!dbProd) {
        // If product doesn't exist, try to find by name or slug
        const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const foundProd = await db.produto.findFirst({ where: { name: item.name } });
        if (foundProd) {
          finalProdId = foundProd.id;
        } else {
          // Create product in DB to satisfy foreign key
          const newProd = await db.produto.create({
            data: {
              name: item.name,
              slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
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
    }

    const pedido = await db.pedido.create({
      data: {
        clienteId: cliente.id,
        total: finalTotal,
        paymentMethod: paymentMethod === 'CARD' ? 'CARTAO_CREDITO' : 'PIX',
        shippingMethod: shipEnum,
        shippingCost: shipCost,
        status: paymentMethod === 'CARD' ? 'PAGO' : 'PENDENTE',
        itens: {
          create: itemCreates,
        },
      },
    });

    // 3. Register the sales in the Venda table
    await db.venda.create({
      data: {
        total: finalTotal,
        paymentMethod: paymentMethod === 'CARD' ? 'CARTAO_CREDITO' : 'PIX',
        isPresencial: false,
      },
    });

    // 4. Handle Stripe card checkout if Stripe secret key is present and valid
    if (paymentMethod === 'CARD' && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: items.map((item: CheckoutItem) => ({
            price_data: {
              currency: 'brl',
              product_data: {
                name: item.name,
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          })),
          mode: 'payment',
          success_url: `${request.headers.get('origin') || 'http://localhost:3000'}/?checkout_success=true&order_id=${pedido.id}`,
          cancel_url: `${request.headers.get('origin') || 'http://localhost:3000'}/?checkout_cancel=true`,
          metadata: {
            pedidoId: pedido.id,
            paymentMethod: 'CARTAO_CREDITO',
          },
        });
        return NextResponse.json({ success: true, url: session.url });
      } catch (stripeErr) {
        console.warn('Stripe session creation failed, falling back to local simulation:', stripeErr);
        // Fallback to local success URL
      }
    }

    // PIX or local simulated card checkout
    if (paymentMethod === 'PIX') {
      return NextResponse.json({
        success: true,
        method: 'PIX',
        pedidoId: pedido.id,
        qrCode: '00020126580014br.gov.bcb.pix0136prstore-pix-key-mock-5545999887766520400005303986540510.005802BR5915PR_Store_Luxury6009SAO_PAULO62070503PDV',
        barcode: '34191.79001 01043.513184 91020.150008 7 98760000015000',
        total: finalTotal
      });
    }

    // Local simulated credit card redirect
    return NextResponse.json({
      success: true,
      pedidoId: pedido.id,
      url: `${request.headers.get('origin') || 'http://localhost:3000'}/?checkout_success=true&order_id=${pedido.id}`
    });
  } catch (error) {
    console.error('Checkout failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
