import { NextResponse } from 'next/server';
import { shippingSchema } from '@/lib/validations';
import { checkRateLimit, apiRateLimiter, withCache } from '@/lib/redis';
import { getClientIP } from '@/lib/utils';
import {
  calculateShipping,
  defaultProduct,
  isMelhorEnvioConfigured,
  type ShippingOption,
} from '@/lib/melhorenvio';

// Dimensões padrão de um tênis/roupa para cálculo genérico (sem itens do carrinho)
const DEFAULT_PRODUCT = defaultProduct('Produto PR Store', 300, 1, 'Tenis');

export async function POST(request: Request) {
  try {
    // ── Rate limit ────────────────────────────────────────────────────────────
    const ip = getClientIP(request);
    const rl = await checkRateLimit(apiRateLimiter, `shipping:${ip}`);
    if (!rl.success) {
      return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 });
    }

    // ── Validação ─────────────────────────────────────────────────────────────
    const body = await request.json();
    const parsed = shippingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'CEP inválido' }, { status: 400 });
    }

    const { cep } = parsed.data;
    const cleanCep = cep.replace(/\D/g, '');

    // ── Moto Frete regional (CEP 85xxx = Foz do Iguaçu / fronteira) ──────────
    if (cleanCep.startsWith('85')) {
      return NextResponse.json({
        success: true,
        options: [
          {
            id: 0,
            name: 'Moto Frete Expresso',
            company: 'PR Store Local',
            price: 15.00,
            days: 1,
            logo: null,
          },
        ],
        // Compatibilidade com o campo legado
        cost: 15.00,
        method: 'Moto Frete Regional (Expresso)',
        days: 1,
      });
    }

    // ── Melhor Envio (nacional) ───────────────────────────────────────────────
    if (isMelhorEnvioConfigured()) {
      // Cache por CEP de destino — 30 min (fretes não mudam com frequência)
      const cacheKey = `shipping:me:${cleanCep}`;

      try {
        const options = await withCache<ShippingOption[]>(
          cacheKey,
          1800, // 30 minutos
          () => calculateShipping(cleanCep, [DEFAULT_PRODUCT])
        );

        if (options.length > 0) {
          return NextResponse.json({
            success: true,
            options,
            // Legado: retorna a opção mais barata nos campos flat
            cost: options[0].price,
            method: `${options[0].company} ${options[0].name}`,
            days: options[0].days,
          });
        }
      } catch (err) {
        console.warn('[MelhorEnvio] Falha na API, usando fallback por região:', err);
        // Fall through to region-based fallback
      }
    }

    // ── Fallback estático por região (quando Melhor Envio falha ou não configurado) ─
    const options = getStaticOptions(cleanCep);
    return NextResponse.json({
      success: true,
      options,
      cost: options[0].price,
      method: options[0].name,
      days: options[0].days,
    });
  } catch (error) {
    console.error('Shipping error:', error);
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}

// ─── Fallback estático por região ────────────────────────────────────────────

function getStaticOptions(cep: string): ShippingOption[] {
  // Sul / Sudeste
  if (cep.startsWith('0') || cep.startsWith('1') || cep.startsWith('2')) {
    return [
      { id: 1, name: 'SEDEX', company: 'Correios', price: 24.90, days: 2 },
      { id: 2, name: 'PAC',   company: 'Correios', price: 18.90, days: 5 },
    ];
  }
  // Centro-Oeste / Norte / Nordeste
  return [
    { id: 1, name: 'SEDEX', company: 'Correios', price: 34.90, days: 4 },
    { id: 2, name: 'PAC',   company: 'Correios', price: 26.90, days: 8 },
  ];
}
