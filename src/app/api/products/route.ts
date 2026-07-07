import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productCreateSchema, productQuerySchema } from '@/lib/validations';
import { withCache, invalidateCache, checkRateLimit, apiRateLimiter, CACHE_KEYS, TTL } from '@/lib/redis';
import { getClientIP } from '@/lib/utils';
import { getAuthUser, isManager } from '@/lib/auth';

const SEED_PRODUCTS = [
  { name: 'Nike Air Jordan 1 Retro High Gold', slug: 'jordan-1-gold', price: 1899.90, promoPrice: 1599.90, category: 'Tenis', brand: 'Nike Jordan', sizes: ['40', '41', '42', '43'], images: [], stock: 5, description: 'Streetwear de luxo - Nike Air Jordan 1 Retro High Gold' },
  { name: 'Supreme Box Logo Hoodie Black/Gold', slug: 'supreme-bogo-gold', price: 1499.90, promoPrice: null, category: 'Roupas', brand: 'Supreme', sizes: ['M', 'G', 'GG'], images: [], stock: 3, description: 'Streetwear de luxo - Supreme Box Logo Hoodie' },
  { name: 'Yeezy Boost 350 V2 Luxury Accent', slug: 'yeezy-350-luxury', price: 1699.90, promoPrice: 1399.90, category: 'Tenis', brand: 'Adidas', sizes: ['38', '39', '40', '41'], images: [], stock: 8, description: 'Streetwear de luxo - Yeezy Boost 350 V2' },
  { name: 'PR Store Classic Crown Gold Necklace', slug: 'pr-crown-gold-necklace', price: 499.90, promoPrice: null, category: 'Acessorios', brand: 'PR Store', sizes: ['Unico'], images: [], stock: 12, description: 'Colar exclusivo PR Store Crown Gold' },
  { name: 'Off-White Industrial Belt Gold Edition', slug: 'off-white-industrial-gold', price: 799.90, promoPrice: null, category: 'Acessorios', brand: 'Off-White', sizes: ['Unico'], images: [], stock: 2, description: 'Cinto Off-White Industrial Gold Edition' },
];

// ─── GET — Product listing (cached) ──────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const ip = getClientIP(request);
    const rl = await checkRateLimit(apiRateLimiter, `products:${ip}`);
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const query = productQuerySchema.safeParse({
      category: searchParams.get('category') || 'All',
      brand: searchParams.get('brand') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      cursor: searchParams.get('cursor') || undefined,
    });

    const params = query.success ? query.data : { category: 'All' as const, page: 1, limit: 20 };
    const cacheKey = CACHE_KEYS.productsList(params.category, params.page ?? 1);

    const result = await withCache(
      cacheKey,
      TTL.PRODUCTS_LIST,
      async () => {
        const where = {
          isActive: true,
          ...(params.category !== 'All' ? { category: params.category } : {}),
          ...('brand' in params && params.brand ? { brand: params.brand } : {}),
        };

        let products = await db.produto.findMany({
          where,
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            promoPrice: true,
            promoUntil: true,
            category: true,
            brand: true,
            sizes: true,
            images: true,
            stock: true,
          },
          skip: ((params.page ?? 1) - 1) * (params.limit ?? 20),
          take: params.limit ?? 20,
          orderBy: { createdAt: 'desc' },
        });

        // Auto-seed if empty
        if (products.length === 0 && params.category === 'All' && params.page === 1) {
          await Promise.all(
            SEED_PRODUCTS.map((p) =>
              db.produto.create({
                data: { ...p, slug: `${p.slug}-${Math.floor(Math.random() * 1000)}` },
              })
            )
          );
          products = await db.produto.findMany({
            where: { isActive: true },
            select: { id: true, name: true, slug: true, price: true, promoPrice: true, promoUntil: true, category: true, brand: true, sizes: true, images: true, stock: true },
            orderBy: { createdAt: 'desc' },
          });
        }

        return { products };
      }
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({
      success: true,
      products: SEED_PRODUCTS.map((p, idx) => ({ ...p, id: String(idx + 1) })),
    });
  }
}

// ─── POST — Create product (invalidates cache) ────────────────────────────────
export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!isManager(user)) {
      return NextResponse.json(
        { success: false, error: 'Apenas gerentes e administradores podem cadastrar produtos.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const slug =
      data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Math.floor(Math.random() * 10000);

    const product = await db.produto.create({
      data: {
        name: data.name,
        slug,
        description: data.description || `Streetwear de luxo - ${data.name}`,
        price: data.price,
        promoPrice: data.promoPrice || null,
        stock: data.stock,
        category: data.category,
        brand: data.brand || 'PR Store',
        images: data.images || [],
        sizes: data.sizes,
      },
    });

    // Bust all product list caches (wildcard pattern)
    await invalidateCache('products:list:*');

    return NextResponse.json({ success: true, product });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Products POST error:', error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
