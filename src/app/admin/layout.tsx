import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, ShoppingCart, CreditCard, ShieldAlert, Package } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans">
      {/* Top Header Banner */}
      <header className="bg-zinc-950 border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 flex items-center justify-center">
            <span className="text-lg">👑</span>
          </div>
          <div>
            <span className="text-sm font-black tracking-widest text-[#f4f4f5] uppercase">PR STORE ERP</span>
            <span className="text-[9px] text-amber-500/80 tracking-widest font-semibold uppercase block -mt-1">Administrativo & Financeiro</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs font-semibold text-zinc-400 hover:text-amber-500 border border-zinc-800 hover:border-amber-500/30 rounded-lg px-3 py-1.5 transition-colors">
            Voltar para Loja
          </Link>
        </div>
      </header>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800/80 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Menu Corporativo</span>
            <nav className="flex flex-col gap-2">
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-500 text-xs font-bold transition-all cursor-pointer">
                <LayoutDashboard className="w-4 h-4" /> Dashboard Geral
              </span>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900/40 text-zinc-400 hover:text-[#f4f4f5] text-xs font-bold transition-all cursor-pointer">
                <ShoppingCart className="w-4 h-4" /> Frente de Caixa (PDV)
              </span>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900/40 text-zinc-400 hover:text-[#f4f4f5] text-xs font-bold transition-all cursor-pointer">
                <CreditCard className="w-4 h-4" /> Contas & Caixa
              </span>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900/40 text-zinc-400 hover:text-[#f4f4f5] text-xs font-bold transition-all cursor-pointer">
                <ShieldAlert className="w-4 h-4" /> Promissórias (Inadimplência)
              </span>
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900/40 text-zinc-400 hover:text-[#f4f4f5] text-xs font-bold transition-all cursor-pointer">
                <Package className="w-4 h-4" /> Estoque Curva ABC
              </span>
            </nav>
          </div>

          <div className="pt-6 border-t border-zinc-900 text-[10px] text-zinc-600 font-bold">
            Conexão Supabase Pooler: <span className="text-green-500">ATIVA</span>
          </div>
        </aside>

        {/* Dynamic page container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
