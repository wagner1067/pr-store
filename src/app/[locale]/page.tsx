import { Suspense } from 'react';
import { db } from '@/lib/db';
import { getCached, setCache } from '@/lib/redis';
import { Header } from '@/components/ecommerce/header';
import { HeroSection } from '@/components/ecommerce/hero-section';
import { ProductGrid } from '@/components/ecommerce/product-grid';
import { LeadModal } from '@/components/ecommerce/lead-modal';
import { ChatWidget } from '@/components/ecommerce/chat-widget';
import { CartDrawer } from '@/components/ecommerce/cart-drawer';
import { Footer } from '@/components/ecommerce/footer';
import { JsonLd } from '@/components/seo/json-ld';
import { ProductGridSkeleton } from '@/components/ui/skeletons';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  promoPrice: number | null;
  promoUntil?: string | Date | null;
  category: string;
  brand: string;
  sizes: string[];
  images: string[];
  stock: number;
  description?: string;
}

const SEED_PRODUCTS: Product[] = [
  { id: '1', name: 'Nike Air Jordan 1 Retro High Gold', slug: 'jordan-1-gold', price: 1899.90, promoPrice: 1599.90, category: 'Tenis', brand: 'Nike Jordan', sizes: ['40', '41', '42', '43'], images: [], stock: 5, description: 'Streetwear de luxo - Nike Air Jordan 1 Retro High Gold' },
  { id: '2', name: 'Supreme Box Logo Hoodie Black/Gold', slug: 'supreme-bogo-gold', price: 1499.90, promoPrice: null, category: 'Roupas', brand: 'Supreme', sizes: ['M', 'G', 'GG'], images: [], stock: 3, description: 'Streetwear de luxo - Supreme Box Logo Hoodie' },
  { id: '3', name: 'Yeezy Boost 350 V2 Luxury Accent', slug: 'yeezy-350-luxury', price: 1699.90, promoPrice: 1399.90, category: 'Tenis', brand: 'Adidas', sizes: ['38', '39', '40', '41'], images: [], stock: 8, description: 'Streetwear de luxo - Yeezy Boost 350 V2' },
  { id: '4', name: 'PR Store Classic Crown Gold Necklace', slug: 'pr-crown-gold-necklace', price: 499.90, promoPrice: null, category: 'Acessorios', brand: 'PR Store', sizes: ['Unico'], images: [], stock: 12, description: 'Colar exclusivo PR Store Crown Gold' },
  { id: '5', name: 'Off-White Industrial Belt Gold Edition', slug: 'off-white-industrial-gold', price: 799.90, promoPrice: null, category: 'Acessorios', brand: 'Off-White', sizes: ['Unico'], images: [], stock: 2, description: 'Cinto Off-White Industrial Gold Edition' },
];

async function getProducts() {
  try {
    const cacheKey = 'products:catalog:all';
    const cached = await getCached<Product[]>(cacheKey);
    if (cached) return cached;

    const products = await db.produto.findMany({
      where: { isActive: true },
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
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    await setCache(cacheKey, products, 60);
    return products;
  } catch (error) {
    console.error('Failed to fetch products, falling back to mock data:', error);
    return SEED_PRODUCTS;
  }
}

async function getServerTime() {
  return new Date().toISOString();
}

export default async function HomePage() {
  const [products, serverTime] = await Promise.all([
    getProducts(),
    getServerTime(),
  ]);

  const brands = [...new Set(products.map((p: Product) => p.brand))];
  const promoProducts = products.filter(
    (p: Product) => p.promoPrice && p.promoUntil && new Date(p.promoUntil) > new Date()
  );

  return (
    <>
      <JsonLd
        type="LocalBusiness"
        data={{
          name: 'PR Store - Moda Masculina e Acessórios',
          description: 'E-commerce de luxo com catálogo exclusivo de roupas, tênis e acessórios premium streetwear.',
          url: process.env.NEXT_PUBLIC_APP_URL || 'https://prstore.vercel.app',
          currenciesAccepted: 'BRL',
          paymentAccepted: 'Pix, Cartão de Crédito, Boleto',
        }}
      />

      <Header />

      <main className="flex-1">
        <HeroSection
          promoProduct={promoProducts[0] || products[0]}
          serverTime={serverTime}
        />

        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid
            initialProducts={products}
            brands={brands}
          />
        </Suspense>
      </main>

      <Footer />

      {/* Client-side interactive overlays */}
      <LeadModal />
      <ChatWidget />
      <CartDrawer />
    </>
  );
}
