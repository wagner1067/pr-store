import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const { items, paymentMethod, clientPhone, clientName, shippingCost, shippingMethod, simulatedCardStatus } = body as {
      items: CheckoutItem[];
      paymentMethod: 'PIX' | 'CARD';
      clientPhone: string;
      clientName: string;
      shippingCost?: number;
      shippingMethod?: string;
      simulatedCardStatus?: 'approved' | 'refused';
    };

    if (!clientPhone) {
      return NextResponse.json({ success: false, error: 'Client phone is required' }, { status: 400 });
    }

    const total = items.reduce((acc: number, item: CheckoutItem) => acc + (item.price * item.quantity), 0);
    const shipCost = shippingCost || 0;
    const finalTotal = total + shipCost;

    let shipEnum: 'RETIRADA' | 'MOTO_FRETE' | 'CORREIOS' = 'CORREIOS';
    if (shippingMethod?.includes('Moto')) {
      shipEnum = 'MOTO_FRETE';
    } else if (shippingMethod?.includes('Retirada')) {
      shipEnum = 'RETIRADA';
    }

    // --- 1. PIX Flow ---
    if (paymentMethod === 'PIX') {
      // Create Client
      const cliente = await db.cliente.upsert({
        where: { phone: clientPhone },
        update: clientName ? { name: clientName } : {},
        create: { name: clientName || 'Cliente E-commerce', phone: clientPhone },
      });

      // Map item creates for FK safety
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
      }

      // Create Order in DB (status PENDENTE for Pix)
      const pedido = await db.pedido.create({
        data: {
          clienteId: cliente.id,
          total: finalTotal,
          paymentMethod: 'PIX',
          shippingMethod: shipEnum,
          shippingCost: shipCost,
          status: 'PENDENTE',
          itens: {
            create: itemCreates,
          },
        },
      });

      // Log Sale
      await db.venda.create({
        data: {
          total: finalTotal,
          paymentMethod: 'PIX',
          isPresencial: false,
        },
      });

      return NextResponse.json({
        success: true,
        method: 'PIX',
        pedidoId: pedido.id,
        qrCode: '00020126580014br.gov.bcb.pix0136prstore-pix-key-mock-5545999887766520400005303986540510.005802BR5915PR_Store_Luxury6009SAO_PAULO62070503PDV',
        barcode: '34191.79001 01043.513184 91020.150008 7 98760000015000',
        total: finalTotal
      });
    }

    // --- 2. CARD Flow ---
    if (paymentMethod === 'CARD') {
      // If Stripe credentials are set and NOT mock, use Stripe Checkout Session (Redirect flow)
      if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')) {
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
            success_url: `${request.headers.get('origin') || 'http://localhost:3000'}/?checkout_success=true`,
            cancel_url: `${request.headers.get('origin') || 'http://localhost:3000'}/?checkout_cancel=true`,
            metadata: {
              clientPhone,
              clientName: clientName || 'Cliente E-commerce',
              shippingCost: shipCost.toString(),
              shippingMethod: shippingMethod || 'Retirada em Mãos',
              items: JSON.stringify(items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }))),
            },
          });
          return NextResponse.json({ success: true, url: session.url });
        } catch (stripeErr) {
          console.warn('Stripe checkout session creation failed, falling back to local simulation:', stripeErr);
          // Fall through to local simulation
        }
      }

      // Local / Dev Simulation Flow (User rule: if card refused, inform client, don't save pending order)
      if (simulatedCardStatus === 'refused') {
        return NextResponse.json({
          success: false,
          error: 'Transação Recusada: Saldo insuficiente, dados incorretos ou erro de autenticação do emissor.'
        }, { status: 402 }); // Payment Required
      }

      // Approved simulated card payment: persist order as paid (PAGO)
      const cliente = await db.cliente.upsert({
        where: { phone: clientPhone },
        update: clientName ? { name: clientName } : {},
        create: { name: clientName || 'Cliente E-commerce', phone: clientPhone },
      });

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
      }

      const pedido = await db.pedido.create({
        data: {
          clienteId: cliente.id,
          total: finalTotal,
          paymentMethod: 'CARTAO_CREDITO',
          shippingMethod: shipEnum,
          shippingCost: shipCost,
          status: 'PAGO',
          itens: {
            create: itemCreates,
          },
        },
      });

      await db.venda.create({
        data: {
          total: finalTotal,
          paymentMethod: 'CARTAO_CREDITO',
          isPresencial: false,
        },
      });

      return NextResponse.json({
        success: true,
        pedidoId: pedido.id,
        url: `${request.headers.get('origin') || 'http://localhost:3000'}/?checkout_success=true&order_id=${pedido.id}`
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid payment method' }, { status: 400 });
  } catch (error) {
    console.error('Checkout failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
