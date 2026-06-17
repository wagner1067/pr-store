import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, ShoppingCart, CreditCard, 
  ShieldAlert, Package, Users, Settings, ArrowLeft 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans">
      {/* Top Header Banner */}
      <header className="bg-zinc-950 border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-[#d4af37]/40 flex items-center justify-center">
            <span className="text-xl font-bold text-[#d4af37]">👑</span>
          </div>
          <div>
            <span className="text-sm font-black tracking-widest text-[#f4f4f5] uppercase block">PR Store ERP</span>
            <span className="text-[9px] text-[#d4af37]/80 tracking-widest font-semibold uppercase block -mt-1">Administrativo & Financeiro</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="text-xs font-black uppercase text-zinc-400 hover:text-[#d4af37] border border-zinc-900 hover:border-[#d4af37]/30 rounded-lg px-4 py-2 transition-all flex items-center gap-1.5 bg-zinc-950"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Loja
          </Link>
        </div>
      </header>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 bg-zinc-950 border-b lg:border-b-0 lg:border-r border-zinc-900 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Menu Corporativo</span>
            <nav className="flex flex-col gap-1.5">
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[#d4af37] text-xs font-bold transition-all cursor-pointer">
                <LayoutDashboard className="w-4 h-4" /> Painel Geral
              </span>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900/40 text-zinc-400 hover:text-white text-xs font-bold transition-all cursor-pointer">
                <Package className="w-4 h-4" /> Produtos
              </span>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900/40 text-zinc-400 hover:text-white text-xs font-bold transition-all cursor-pointer">
                <ShieldAlert className="w-4 h-4" /> Promissórias
              </span>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900/40 text-zinc-400 hover:text-white text-xs font-bold transition-all cursor-pointer">
                <Users className="w-4 h-4" /> Clientes
              </span>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900/40 text-zinc-400 hover:text-white text-xs font-bold transition-all cursor-pointer">
                <ShoppingCart className="w-4 h-4" /> Vendas (PDV)
              </span>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900/40 text-zinc-400 hover:text-white text-xs font-bold transition-all cursor-pointer">
                <CreditCard className="w-4 h-4" /> Contas & Caixa
              </span>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900/40 text-zinc-400 hover:text-white text-xs font-bold transition-all cursor-pointer">
                <Settings className="w-4 h-4" /> Configurações
              </span>
            </nav>
          </div>

          <div className="pt-6 border-t border-zinc-900 text-[10px] text-zinc-600 font-extrabold uppercase tracking-widest">
            Supabase Connection: <span className="text-green-500">Active</span>
          </div>
        </aside>

        {/* Dynamic page container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
