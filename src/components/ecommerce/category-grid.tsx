'use client';

import { useTranslations } from 'next-intl';

interface CategoryGridProps {
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
}

const CATEGORIES = [
  { id: 'All', icon: '🛍️', key: 'all' },
  { id: 'Tenis', icon: '👟', key: 'shoes' },
  { id: 'Roupas', icon: '👕', key: 'clothes' },
  { id: 'Acessorios', icon: '🕶️', key: 'accessories' },
] as const;

export function CategoryGrid({ onCategorySelect, selectedCategory = 'All' }: CategoryGridProps) {
  const t = useTranslations('categories');

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col mb-6">
        <h2 className="text-lg font-black uppercase tracking-wider">{t('title')}</h2>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mt-0.5">
          {t('subtitle')}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategorySelect?.(cat.id)}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-card border-primary text-primary'
                : 'bg-card/50 border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="text-xl">{cat.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-wider">
              {t(cat.key)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
