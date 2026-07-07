'use client';

import { useState, useEffect } from 'react';
import { Calendar, Wallet, Radio, Pause } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DashboardHeaderProps {
  title: string;
  isCaixaOpen: boolean;
  caixaInitialAmt: number | null;
  lastUpdated?: Date | null;
  autoRefresh?: boolean;
  onToggleAutoRefresh?: () => void;
}

export function DashboardHeader({
  title,
  isCaixaOpen,
  autoRefresh = false,
  lastUpdated = null,
  onToggleAutoRefresh,
}: DashboardHeaderProps) {
  const [time, setTime] = useState('');
  const [ago, setAgo] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (lastUpdated) {
        const secs = Math.max(0, Math.round((now.getTime() - lastUpdated.getTime()) / 1000));
        setAgo(secs < 60 ? `${secs}s` : `${Math.round(secs / 60)}min`);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <header className="h-20 border-b border-border px-8 flex items-center justify-between bg-card/40 backdrop-blur-md sticky top-0 z-10">
      <div>
        <h1 className="text-sm font-black uppercase tracking-wider text-foreground">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Live / Auto-refresh Badge */}
        <button
          type="button"
          onClick={onToggleAutoRefresh}
          title={autoRefresh ? 'Atualização automática ativa — clique para pausar' : 'Atualização pausada — clique para reativar'}
          className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg transition-colors ${
            autoRefresh
              ? 'border-success/40 bg-success/10'
              : 'border-border bg-card hover:bg-card/70'
          }`}
        >
          {autoRefresh ? (
            <Radio className="w-3.5 h-3.5 text-success animate-pulse" />
          ) : (
            <Pause className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <div className="flex flex-col items-start">
            <span className="text-[8px] font-black uppercase tracking-widest leading-none">
              {autoRefresh ? 'Ao Vivo' : 'Pausado'}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 text-muted-foreground">
              {lastUpdated ? `há ${ago}` : '—'}
            </span>
          </div>
        </button>

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
