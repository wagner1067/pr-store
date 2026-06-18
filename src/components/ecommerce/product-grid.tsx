'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Filter } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';
import { CategoryGrid } from './category-grid';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  promoPrice: number | null;
  promoUntil?: Date | string | null;
  category: string;
  brand: string;
  sizes: string[];
  images: string[];
  stock: number;
}

interface ProductGridProps {
  initialProducts: Product[];
  brands: string[];
}

export function ProductGrid({ initialProducts, brands }: ProductGridProps) {
  const t = useTranslations('showcase');
  const tFilter = useTranslations('filter');
  const { addItem } = useCart();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const products = initialProducts.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
    return true;
  });

  const handleAddToCart = (product: Product, size: string) => {
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        promoPrice: product.promoPrice,
        category: product.category,
        brand: product.brand,
        image: product.images[0] || '',
        selectedSize: size,
        stock: product.stock,
      },
      size
    );
  };

  return (
    <>
      <CategoryGrid
        onCategorySelect={setSelectedCategory}
        selectedCategory={selectedCategory}
      />

      <section id="catalog" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider">{t('title')}</h3>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5 block">
              {t('showing')} {products.length} {t('itemsFound')}
            </span>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 border border-border hover:border-primary/40 hover:text-primary rounded-lg px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-colors bg-card cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" /> {t('filters')}
          </button>
        </div>

        {/* Filter Drawer */}
        {isFilterOpen && (
          <div className="mb-8 p-4 border border-border rounded-xl bg-card animate-fadeIn">
            <h4 className="text-xs font-black uppercase tracking-wider mb-3">{tFilter('title')}</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedBrand('All')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                  selectedBrand === 'All'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {tFilter('allBrands')}
              </button>
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    selectedBrand === brand
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const hasPromo = !!product.promoPrice;
            const displayPrice = product.promoPrice || product.price;

            return (
              <div
                key={product.id}
                className="border border-border rounded-xl overflow-hidden shadow-xl group hover:border-primary/35 transition-all duration-300 flex flex-col justify-between bg-card animate-fadeIn"
              >
                {/* Image */}
                <div className="h-64 flex items-center justify-center relative border-b border-border overflow-hidden bg-secondary/30">
                  {product.images[0] && (product.images[0].startsWith('http') || product.images[0].startsWith('/') || product.images[0].startsWith('data:')) ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-36 h-36 text-primary/30 flex items-center justify-center text-6xl transition-transform duration-500 group-hover:scale-110">
                      {product.category === 'Tenis' ? '👟' : product.category === 'Roupas' ? '👕' : '💎'}
                    </div>
                  )}
                  {hasPromo && (
                    <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider shadow-lg">
                      {t('promo')}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                    {product.brand}
                  </span>
                  <h4 className="text-sm font-bold leading-snug line-clamp-2">
                    {product.name}
                  </h4>

                  {/* Sizes */}
                  <div className="flex gap-1.5 flex-wrap mt-1">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleAddToCart(product, size)}
                        disabled={product.stock <= 0}
                        className="px-2.5 py-1 text-[10px] font-bold border border-border rounded-md hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title={`${t('addToBag')} - ${size}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="mt-auto pt-3 flex items-baseline gap-2">
                    <span className="text-lg font-black text-primary">
                      {formatCurrency(displayPrice)}
                    </span>
                    {hasPromo && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>
                  {product.stock <= 0 && (
                    <span className="text-[9px] font-bold text-destructive uppercase">{t('outOfStock')}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-sm">Nenhum produto encontrado para os filtros selecionados.</p>
          </div>
        )}
      </section>
    </>
  );
}
