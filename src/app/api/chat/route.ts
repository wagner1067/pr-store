import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // AI Support Route with fallback mock responses
    let reply = 'Olá! Bem-vindo à PR Store. Como posso ajudar você hoje?';
    
    if (message.toLowerCase().includes('frete')) {
      reply = 'Oferecemos frete expresso local via Moto Frete para CEPs da região de fronteira começando com 85, e envios via Correios PAC/SEDEX para todo o Brasil.';
    } else if (message.toLowerCase().includes('promissoria') || message.toLowerCase().includes('no fio')) {
      reply = 'O pagamento em promissória está disponível para compras presenciais atreladas ao seu celular, sujeito a análise cadastral no nosso ERP.';
    } else if (message.toLowerCase().includes('pagamento') || message.toLowerCase().includes('cartao')) {
      reply = 'Aceitamos pagamentos via Pix Dinâmico, Cartão de Crédito parcelado em até 10x sem juros, Boleto e Promissória presencial.';
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
