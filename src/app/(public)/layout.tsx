import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles } from 'lucide-react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {/* Official Luxury Crown Logo */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <span className="text-xl font-bold text-[#09090b]">👑</span>
          </div>
          <div>
            <span className="text-lg font-black tracking-widest text-[#f4f4f5] uppercase block">PR STORE</span>
            <span className="text-[10px] text-amber-500/80 tracking-widest font-semibold uppercase block -mt-1">Luxury Streetwear</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="/?category=Roupas" className="hover:text-amber-500 transition-colors">Roupas</Link>
          <Link href="/?category=Tenis" className="hover:text-amber-500 transition-colors">Tênis</Link>
          <Link href="/?category=Acessorios" className="hover:text-amber-500 transition-colors">Acessórios</Link>
          <Link href="/admin" className="hover:text-amber-500 transition-colors flex items-center gap-1 text-zinc-500 border border-zinc-800 rounded-full px-3 py-1">
            <Sparkles className="w-3.5 h-3.5" />
            ERP Painel
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2.5 rounded-full hover:bg-zinc-800/60 border border-zinc-800/80 transition-colors text-amber-500 relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-[#09090b] text-[10px] font-black rounded-full flex items-center justify-center">0</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="bg-[#0c0c0e] border-t border-zinc-900 px-6 py-12 text-sm text-zinc-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">👑</span>
              <span className="text-sm font-black tracking-widest text-[#f4f4f5] uppercase">PR STORE</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              Peças exclusivas e selecionadas das melhores marcas do mercado streetwear de luxo. Garantia de originalidade e qualidade impecável.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-400 mb-3 uppercase tracking-wider text-xs">Categorias</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/?category=Roupas" className="hover:text-amber-500 transition-colors">Vestuário Premium</Link></li>
              <li><Link href="/?category=Tenis" className="hover:text-amber-500 transition-colors">Tênis & Sneakers</Link></li>
              <li><Link href="/?category=Acessorios" className="hover:text-amber-500 transition-colors">Acessórios Importados</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-400 mb-3 uppercase tracking-wider text-xs">Informações</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Região de Fronteira - Entrega Expressa local via Moto Frete & Correios Nacional.
            </p>
            <div className="mt-4 text-xs font-semibold text-amber-500">
              PR Store E-commerce &copy; 2026. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
