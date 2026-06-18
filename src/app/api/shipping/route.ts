import { NextResponse } from 'next/server';
import { shippingSchema } from '@/lib/validations';
import { checkRateLimit, apiRateLimiter } from '@/lib/redis';
import { getClientIP } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    const rl = await checkRateLimit(apiRateLimiter, `shipping:${ip}`);
    if (!rl.success) {
      return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = shippingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'CEP inválido' }, { status: 400 });
    }

    const { cep } = parsed.data;
    const cleanCep = cep.replace('-', '');

    // Border region logistics
    if (cleanCep.startsWith('85')) {
      return NextResponse.json({
        success: true,
        cost: 15.00,
        method: 'Moto Frete Regional (Expresso)',
        days: 1,
      });
    }

    // São Paulo region
    if (cleanCep.startsWith('0') || cleanCep.startsWith('1')) {
      return NextResponse.json({
        success: true,
        cost: 24.90,
        method: 'Correios SEDEX',
        days: 3,
      });
    }

    // Default: national PAC
    return NextResponse.json({
      success: true,
      cost: 29.90,
      method: 'Correios PAC Nacional',
      days: 7,
    });
  } catch (error) {
    console.error('Shipping error:', error);
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}
