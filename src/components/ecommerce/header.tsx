'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/lib/theme-provider';
import {
  Sun, Moon, Search, ShoppingBag, Sparkles, Menu, X,
} from 'lucide-react';
import { useCart } from '@/lib/cart-store';

export function Header() {
  const t = useTranslations('nav');
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { totalItems, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t('brands'), href: '/?filter=brands' },
    { label: t('sneakers'), href: '/?category=Tenis' },
    { label: t('clothing'), href: '/?category=Roupas' },
    { label: t('categories'), href: '/?category=All' },
    { label: t('accessories'), href: '/?category=Acessorios' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border backdrop-blur-md bg-background/90 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border shadow-md">
            <img src="/logo.jpg" alt="PR Store Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-lg font-black tracking-widest uppercase block transition-colors group-hover:text-primary">
              STORE
            </span>
            <span className="text-[7.5px] font-bold tracking-widest uppercase block -mt-1 text-muted-foreground">
              Moda Masculina e Acessórios
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-muted-foreground">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border text-[9px] font-extrabold">
            <Link href="/pt-BR" className="px-2 py-0.5 rounded hover:bg-primary hover:text-primary-foreground transition-all">PT</Link>
            <Link href="/en" className="px-2 py-0.5 rounded hover:bg-primary hover:text-primary-foreground transition-all">EN</Link>
            <Link href="/es" className="px-2 py-0.5 rounded hover:bg-primary hover:text-primary-foreground transition-all">ES</Link>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-border text-primary hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Search */}
          <button className="p-2 rounded-full border border-border text-muted-foreground hover:bg-secondary transition-colors">
            <Search className="w-4 h-4" />
          </button>

          {/* Cart */}
          <button
            onClick={openCart}
            className="p-2.5 rounded-full border border-border text-primary hover:bg-secondary transition-all relative"
            aria-label="Shopping bag"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[8px] font-black rounded-full flex items-center justify-center animate-bounce">
                {totalItems}
              </span>
            )}
          </button>

          {/* ERP Link */}
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1.5 text-[9px] font-black uppercase border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            {t('erpPanel')}
          </Link>

          {/* Mobile Menu */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-full border border-border text-muted-foreground hover:bg-secondary"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="lg:hidden mt-4 pb-4 border-t border-border pt-4 flex flex-col gap-3 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors px-2 py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 mt-2 px-2">
            <Link href="/pt-BR" className="text-[10px] font-bold px-2 py-1 border border-border rounded hover:bg-primary hover:text-primary-foreground">PT</Link>
            <Link href="/en" className="text-[10px] font-bold px-2 py-1 border border-border rounded hover:bg-primary hover:text-primary-foreground">EN</Link>
            <Link href="/es" className="text-[10px] font-bold px-2 py-1 border border-border rounded hover:bg-primary hover:text-primary-foreground">ES</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
