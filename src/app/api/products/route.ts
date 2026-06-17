import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const SEED_PRODUCTS = [
  {
    name: 'Nike Air Jordan 1 Retro High Gold',
    slug: 'jordan-1-gold',
    price: 1899.90,
    promoPrice: 1599.90,
    category: 'Tenis',
    brand: 'Nike Jordan',
    sizes: ['40', '41', '42', '43'],
    images: ['#jordan'],
    stock: 5,
  },
  {
    name: 'Supreme Box Logo Hoodie Black/Gold',
    slug: 'supreme-bogo-gold',
    price: 1499.90,
    category: 'Roupas',
    brand: 'Supreme',
    sizes: ['M', 'G', 'GG'],
    images: ['#hoodie'],
    stock: 3,
  },
  {
    name: 'Yeezy Boost 350 V2 Luxury Accent',
    slug: 'yeezy-350-luxury',
    price: 1699.90,
    promoPrice: 1399.90,
    category: 'Tenis',
    brand: 'Adidas',
    sizes: ['38', '39', '40', '41'],
    images: ['#yeezy'],
    stock: 8,
  },
  {
    name: 'PR Store Classic Crown Gold Necklace',
    slug: 'pr-crown-gold-necklace',
    price: 499.90,
    category: 'Acessorios',
    brand: 'PR Store',
    sizes: ['Unico'],
    images: ['#necklace'],
    stock: 12,
  },
  {
    name: 'Off-White Industrial Belt Gold Edition',
    slug: 'off-white-industrial-gold',
    price: 799.90,
    category: 'Acessorios',
    brand: 'Off-White',
    sizes: ['Unico'],
    images: ['#belt'],
    stock: 2,
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 50; // Retrieve more to avoid early pagination limits on catalog
  const skip = (page - 1) * limit;

  try {
    let products = await db.produto.findMany({
      where: category && category !== 'All' ? { category } : undefined,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        promoPrice: true,
        category: true,
        brand: true,
        sizes: true,
        images: true,
        stock: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Auto-seed if database is empty so that it never shows a blank storefront
    if (products.length === 0 && (!category || category === 'All') && page === 1) {
      console.log('Seeding initial products into Supabase...');
      await Promise.all(SEED_PRODUCTS.map(async (p) => {
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        return db.produto.create({
          data: {
            name: p.name,
            slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
            description: `Streetwear de luxo - ${p.name}`,
            price: p.price,
            promoPrice: p.promoPrice || null,
            category: p.category,
            brand: p.brand,
            sizes: p.sizes,
            images: p.images,
            stock: p.stock,
          }
        });
      }));

      // Re-fetch
      products = await db.produto.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          promoPrice: true,
          category: true,
          brand: true,
          sizes: true,
          images: true,
          stock: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.warn('DB connect failed, falling back to mock data:', error);
    return NextResponse.json({ 
      success: true, 
      products: SEED_PRODUCTS.map((p, idx) => ({ ...p, id: (idx + 1).toString() }))
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, stock, category, brand, image, sizes } = body;

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Math.floor(Math.random() * 1000);

    const product = await db.produto.create({
      data: {
        name,
        slug,
        description: `Streetwear de luxo - ${name}`,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        brand: brand || 'PR Store',
        images: [image || '👟'],
        sizes: sizes || ['39', '40', '41'],
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to create product in DB:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
