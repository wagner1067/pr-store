import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Sparkles } from 'lucide-react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          {/* Official Luxury Crown Logo */}
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-[#d4af37]/40 flex items-center justify-center shadow-lg shadow-[#d4af37]/5 transition-all group-hover:border-[#d4af37]">
            <span className="text-xl font-bold text-[#d4af37]">👑</span>
          </div>
          <div>
            <span className="text-lg font-black tracking-widest text-[#f4f4f5] uppercase block group-hover:text-[#d4af37] transition-colors">PR STORE</span>
            <span className="text-[9px] text-[#d4af37]/80 tracking-widest font-semibold uppercase block -mt-1">Luxury Streetwear</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <Link href="/?category=Marcas" className="hover:text-[#d4af37] transition-colors">Marcas</Link>
          <Link href="/?category=Tenis" className="hover:text-[#d4af37] transition-colors">Tênis</Link>
          <Link href="/?category=Roupas" className="hover:text-[#d4af37] transition-colors">Vestuário</Link>
          <Link href="/?category=All" className="hover:text-[#d4af37] transition-colors">Categorias</Link>
          <Link href="/?category=Acessorios" className="hover:text-[#d4af37] transition-colors">Acessórios</Link>
        </nav>

        {/* Actions & Language Selector */}
        <div className="flex items-center gap-6">
          {/* Language Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[10px] font-extrabold text-zinc-500">
            <button className="px-2 py-1 rounded bg-[#d4af37] text-[#09090b] font-black">PT-BR</button>
            <button className="px-2 py-1 rounded hover:text-white transition-colors">EN</button>
            <button className="px-2 py-1 rounded hover:text-white transition-colors">ES</button>
          </div>

          {/* Search bar button */}
          <button className="text-zinc-400 hover:text-[#d4af37] transition-colors p-1.5 rounded-full hover:bg-zinc-900/50">
            <Search className="w-4 h-4" />
          </button>

          {/* ERP access */}
          <Link 
            href="/admin" 
            className="hidden sm:flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500 hover:text-[#d4af37] border border-zinc-800 hover:border-[#d4af37]/30 rounded-full px-3 py-1.5 transition-all"
          >
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            ERP Painel
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="bg-[#0c0c0e] border-t border-zinc-900 px-6 py-12 text-sm text-zinc-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-lg">👑</span>
              <span className="text-sm font-black tracking-widest text-[#f4f4f5] uppercase">PR STORE</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              Peças exclusivas e selecionadas das melhores marcas do mercado streetwear de luxo. Garantia de originalidade e qualidade impecável.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-zinc-400 mb-4 uppercase tracking-wider text-xs">Categorias</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/?category=Roupas" className="hover:text-[#d4af37] transition-colors">Vestuário Premium</Link></li>
              <li><Link href="/?category=Tenis" className="hover:text-[#d4af37] transition-colors">Tênis & Sneakers</Link></li>
              <li><Link href="/?category=Acessorios" className="hover:text-[#d4af37] transition-colors">Acessórios Importados</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-zinc-400 mb-4 uppercase tracking-wider text-xs">Logística & Fronteira</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Região de Fronteira - Entrega Expressa local via Moto Frete & Correios Nacional.
            </p>
            <div className="mt-4 text-xs font-semibold text-[#d4af37]">
              PR Store E-commerce &copy; 2026. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
