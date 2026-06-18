'use client';

import { useState, useEffect } from 'react';
import { Calendar, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DashboardHeaderProps {
  title: string;
  isCaixaOpen: boolean;
  caixaInitialAmt: number | null;
}

export function DashboardHeader({ title, isCaixaOpen, caixaInitialAmt }: DashboardHeaderProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 border-b border-border px-8 flex items-center justify-between bg-card/40 backdrop-blur-md sticky top-0 z-10">
      <div>
        <h1 className="text-sm font-black uppercase tracking-wider text-foreground">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Caixa Status Badge */}
        <div className="flex items-center gap-2 border border-border bg-card px-3 py-1.5 rounded-lg">
          <Wallet className={`w-3.5 h-3.5 ${isCaixaOpen ? 'text-success' : 'text-muted-foreground'}`} />
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest leading-none">
              Caixa do Dia
            </span>
            <span className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${isCaixaOpen ? 'text-success' : 'text-muted-foreground'}`}>
              {isCaixaOpen ? 'ABERTO' : 'FECHADO'}
            </span>
          </div>
        </div>

        {/* Date and Time */}
        <div className="hidden sm:flex items-center gap-2.5 text-xs text-muted-foreground font-semibold">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{formatDate(new Date())}</span>
          <span className="text-border">|</span>
          <span className="font-mono text-foreground font-bold">{time}</span>
        </div>
      </div>
    </header>
  );
}
