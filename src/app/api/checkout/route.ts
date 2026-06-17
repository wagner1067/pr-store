import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-05-27.dahlia',
});

interface CheckoutItem {
  name: string;
  price: number;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const { items, paymentMethod } = await request.json() as { items: CheckoutItem[], paymentMethod: string };

    if (paymentMethod === 'PIX' || paymentMethod === 'BOLETO') {
      // Return simulated Pix QR Code / Boleto barcode for Asaas/Efí integration
      return NextResponse.json({
        success: true,
        method: paymentMethod,
        qrCode: '00020126580014br.gov.bcb.pix0136prstore-pix-key-mock-5545999887766520400005303986540510.005802BR5915PR_Store_Luxury6009SAO_PAULO62070503PDV',
        barcode: '34191.79001 01043.513184 91020.150008 7 98760000015000',
        total: items.reduce((acc: number, item: CheckoutItem) => acc + (item.price * item.quantity), 0)
      });
    }

    // Stripe checkout session creation
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
      success_url: `${request.headers.get('origin') || 'http://localhost:3000'}/success`,
      cancel_url: `${request.headers.get('origin') || 'http://localhost:3000'}/cart`,
      metadata: {
        items: JSON.stringify(items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))),
        paymentMethod: 'CARTAO_CREDITO',
      },
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.warn('Stripe checkout generation failed, using mock payment url:', error);
    return NextResponse.json({
      success: true,
      url: 'https://checkout.stripe.com/pay/cs_test_mock_session_pr_store'
    });
  }
}
