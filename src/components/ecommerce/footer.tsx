import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 py-8 mt-auto bg-card/50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-border">
            <img src="/logo.jpg" alt="PR Store Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-xs font-black tracking-widest uppercase">PR Store</span>
            <span className="text-[8px] text-muted-foreground font-bold tracking-widest uppercase block -mt-0.5">
              {t('tagline')}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground font-semibold">
          © {year} PR Store. {t('rights')}
        </p>
      </div>
    </footer>
  );
}
