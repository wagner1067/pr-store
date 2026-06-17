import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { cep } = await request.json();

    if (!cep || cep.length < 8) {
      return NextResponse.json({ success: false, error: 'CEP inválido' }, { status: 400 });
    }

    // Border region logistics intelligence calculations (PAC / Moto Frete)
    let cost = 29.90;
    let method = 'Correios PAC Nacional';
    let days = 7;

    if (cep.startsWith('85')) {
      cost = 15.00;
      method = 'Moto Frete Regional (Expresso)';
      days = 1;
    }

    return NextResponse.json({ success: true, cost, method, days });
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
