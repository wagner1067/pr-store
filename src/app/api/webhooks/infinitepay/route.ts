import { NextResponse } from 'next/server';

/**
 * DESATIVADO — a PR Store migrou o gateway para o Mercado Pago.
 * O webhook ativo agora é /api/webhooks/mercadopago.
 * Mantido apenas para retornar 410 caso alguma notificação antiga chegue.
 */
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Endpoint desativado. Use /api/webhooks/mercadopago.' },
    { status: 410 }
  );
}
