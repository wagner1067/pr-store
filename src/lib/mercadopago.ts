/**
 * Mercado Pago — Checkout Pro Integration
 * ─────────────────────────────────────────────────────────────────────────────
 * Gateway de pagamento da PR Store (PIX, Cartão e Boleto num único checkout).
 *
 * - Criar preferência: POST https://api.mercadopago.com/checkout/preferences
 * - Consultar pagamento: GET https://api.mercadopago.com/v1/payments/{id}
 * - Auth: Bearer <MERCADOPAGO_ACCESS_TOKEN>
 * - Webhook: validação via header x-signature (HMAC-SHA256)
 * Docs: https://www.mercadopago.com.br/developers
 */
import crypto from 'crypto';

const MP_BASE_URL = 'https://api.mercadopago.com';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MercadoPagoItem {
  title: string;
  quantity: number;
  unit_price: number; // em reais (R$ 10,00 = 10.0)
  currency_id?: string;
}

export interface CreatePreferenceParams {
  orderId: string; // external_reference — id do pedido no nosso banco
  items: MercadoPagoItem[];
  payerName?: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
  notificationUrl: string;
}

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface MercadoPagoPayment {
  id: number;
  status:
    | 'approved'
    | 'pending'
    | 'in_process'
    | 'rejected'
    | 'cancelled'
    | 'refunded'
    | 'charged_back'
    | string;
  status_detail: string;
  external_reference: string | null;
  transaction_amount: number;
  payment_method_id: string;
  payment_type_id: string; // 'credit_card' | 'debit_card' | 'pix' | 'ticket' ...
}

// ─── Helpers de configuração ───────────────────────────────────────────────────

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error('[MercadoPago] MERCADOPAGO_ACCESS_TOKEN é obrigatório.');
  }
  return token;
}

/** Retorna true se o Mercado Pago está configurado */
export function isMercadoPagoConfigured(): boolean {
  return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
}

// ─── Criar preferência de checkout ─────────────────────────────────────────────

export async function createMercadoPagoPreference(
  params: CreatePreferenceParams
): Promise<MercadoPagoPreferenceResponse> {
  const payload = {
    items: params.items.map((it) => ({
      title: it.title,
      quantity: it.quantity,
      unit_price: Number(it.unit_price.toFixed(2)),
      currency_id: it.currency_id || 'BRL',
    })),
    payer: params.payerName ? { name: params.payerName } : undefined,
    external_reference: params.orderId,
    back_urls: {
      success: params.successUrl,
      failure: params.failureUrl,
      pending: params.pendingUrl,
    },
    auto_return: 'approved',
    notification_url: params.notificationUrl,
  };

  const response = await fetch(`${MP_BASE_URL}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[MercadoPago] Erro ao criar preferência: ${response.status} — ${errorText}`);
  }

  return response.json() as Promise<MercadoPagoPreferenceResponse>;
}

// ─── Consultar pagamento (usado pelo webhook) ──────────────────────────────────

export async function getMercadoPagoPayment(paymentId: string): Promise<MercadoPagoPayment> {
  const response = await fetch(`${MP_BASE_URL}/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[MercadoPago] Erro ao consultar pagamento: ${response.status} — ${errorText}`);
  }

  return response.json() as Promise<MercadoPagoPayment>;
}

// ─── Validação da assinatura do webhook (x-signature) ──────────────────────────

/**
 * Valida a autenticidade da notificação do Mercado Pago.
 *
 * O header `x-signature` tem o formato: `ts=<timestamp>,v1=<hash>`.
 * O manifesto assinado é: `id:<dataId>;request-id:<xRequestId>;ts:<ts>;`
 * O hash é HMAC-SHA256(manifesto, MERCADOPAGO_WEBHOOK_SECRET) em hexadecimal.
 *
 * Retorna true se a assinatura confere. Se o segredo não estiver configurado,
 * retorna false em produção (fail-closed) e true fora de produção.
 */
export function validateMercadoPagoSignature(opts: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!secret) {
    // Sem segredo: bloqueia em produção, permite em dev para testes locais.
    return process.env.NODE_ENV !== 'production';
  }

  const { xSignature, xRequestId, dataId } = opts;
  if (!xSignature || !dataId) return false;

  // Parse do header: "ts=1704908010,v1=abcdef..."
  let ts = '';
  let v1 = '';
  for (const part of xSignature.split(',')) {
    const [key, value] = part.split('=').map((s) => s.trim());
    if (key === 'ts') ts = value;
    else if (key === 'v1') v1 = value;
  }
  if (!ts || !v1) return false;

  // Monta o manifesto exatamente na ordem exigida pela documentação.
  const manifest = `id:${dataId};request-id:${xRequestId ?? ''};ts:${ts};`;
  const computed = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  // Comparação em tempo constante para evitar timing attacks.
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(v1));
  } catch {
    return false;
  }
}

/** Mapeia payment_type_id do MP para o enum PaymentMethod do Prisma */
export function mapMpPaymentType(paymentTypeId: string): 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'BOLETO' {
  switch (paymentTypeId) {
    case 'pix':
    case 'bank_transfer':
      return 'PIX';
    case 'debit_card':
      return 'CARTAO_DEBITO';
    case 'ticket':
      return 'BOLETO';
    case 'credit_card':
    default:
      return 'CARTAO_CREDITO';
  }
}
