/**
 * Melhor Envio — Shipping Integration
 * ─────────────────────────────────────────────────────────────────────────────
 * API: POST https://melhorenvio.com.br/api/v2/me/shipment/calculate
 * Auth: Bearer token (MELHORENVIO_TOKEN no .env)
 * Docs: https://docs.melhorenvio.com.br
 */

const MELHORENVIO_API_URL = 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

// CEP de origem da loja (Foz do Iguaçu - PR)
const STORE_CEP = process.env.MELHORENVIO_ORIGIN_CEP || '85851010';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MelhorEnvioProduct {
  name: string;
  quantity: number;
  unitary_weight: number; // kg
  unitary_value: number;  // R$
  width: number;          // cm
  height: number;         // cm
  length: number;         // cm
}

export interface MelhorEnvioService {
  id: number;
  name: string;
  price: string;
  custom_price: string;
  discount: string;
  currency: string;
  delivery_time: number;
  delivery_range: { min: number; max: number };
  company: { id: number; name: string; picture: string };
  error?: string;
}

export interface ShippingOption {
  id: number;
  name: string;          // "SEDEX", "PAC", "Mini Envios" etc.
  company: string;       // "Correios", "Jadlog" etc.
  price: number;         // R$ final
  days: number;          // dias úteis
  logo?: string;
}

// ─── Calculate Shipping ───────────────────────────────────────────────────────

/**
 * Calcula opções de frete para um CEP de destino via Melhor Envio.
 * Retorna todas as transportadoras disponíveis ordenadas por preço.
 */
export async function calculateShipping(
  destinationCep: string,
  products: MelhorEnvioProduct[]
): Promise<ShippingOption[]> {
  const token = process.env.MELHORENVIO_TOKEN;
  if (!token) {
    throw new Error('[MelhorEnvio] MELHORENVIO_TOKEN não configurado.');
  }

  const payload = {
    from: { postal_code: STORE_CEP.replace(/\D/g, '') },
    to: { postal_code: destinationCep.replace(/\D/g, '') },
    products,
  };

  const response = await fetch(MELHORENVIO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'PR Store E-commerce (wagnerbejota@hotmail.com)',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`[MelhorEnvio] Erro ${response.status}: ${err}`);
  }

  const services: MelhorEnvioService[] = await response.json();

  // Filtrar serviços com erro e mapear para formato simplificado
  const options: ShippingOption[] = services
    .filter((s) => !s.error && s.price)
    .map((s) => ({
      id: s.id,
      name: s.name,
      company: s.company?.name || 'Transportadora',
      price: parseFloat(s.custom_price || s.price),
      days: s.delivery_time || s.delivery_range?.max || 7,
      logo: s.company?.picture,
    }))
    .sort((a, b) => a.price - b.price);

  return options;
}

// ─── Default products helper (para itens sem dimensões no banco) ──────────────

/**
 * Gera um produto padrão com dimensões médias de streetwear
 * para calcular o frete quando não temos dados precisos de dimensão.
 */
export function defaultProduct(
  name: string,
  price: number,
  quantity: number,
  category?: string
): MelhorEnvioProduct {
  // Dimensões estimadas por categoria
  const dims: Record<string, { w: number; h: number; l: number; kg: number }> = {
    Tenis:      { w: 32, h: 20, l: 12, kg: 0.8 },
    Roupas:     { w: 30, h: 5,  l: 25, kg: 0.4 },
    Acessorios: { w: 20, h: 5,  l: 15, kg: 0.2 },
  };

  const d = dims[category || 'Roupas'] || dims.Roupas;

  return {
    name,
    quantity,
    unitary_weight: d.kg,
    unitary_value: price,
    width: d.w,
    height: d.h,
    length: d.l,
  };
}

/** Verifica se Melhor Envio está configurado */
export function isMelhorEnvioConfigured(): boolean {
  return !!process.env.MELHORENVIO_TOKEN;
}
