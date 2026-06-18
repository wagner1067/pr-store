'use client';

import { DollarSign, ShoppingCart, Users, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface KPIProps {
  todayRevenue: number;
  todayCount: number;
  monthRevenue: number;
  monthCount: number;
  totalClients: number;
  activeDebtors: number;
  totalDebt: number;
}

export function KPICards({
  todayRevenue,
  todayCount,
  monthRevenue,
  monthCount,
  totalClients,
  activeDebtors,
  totalDebt,
}: KPIProps) {
  const cards = [
    {
      title: 'Faturamento Hoje',
      value: formatCurrency(todayRevenue),
      subtext: `${todayCount} vendas realizadas`,
      icon: DollarSign,
      color: 'text-primary border-primary/20 bg-primary/5',
    },
    {
      title: 'Faturamento Mês',
      value: formatCurrency(monthRevenue),
      subtext: `${monthCount} vendas este mês`,
      icon: ArrowUpRight,
      color: 'text-success border-success/20 bg-success/5',
    },
    {
      title: 'Clientes Cadastrados',
      value: totalClients,
      subtext: 'Base total de contatos',
      icon: ShoppingCart,
      color: 'text-sky-500 border-sky-500/20 bg-sky-500/5',
    },
    {
      title: 'Promissórias Ativas',
      value: activeDebtors,
      subtext: `Total pendente: ${formatCurrency(totalDebt)}`,
      icon: Users,
      color: 'text-destructive border-destructive/20 bg-destructive/5',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`border rounded-xl p-5 bg-card flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200 shadow-md ${card.color}`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {card.title}
              </span>
              <div className="p-2 rounded-lg bg-background/50 border border-border">
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-foreground block">
                {card.value}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase mt-1 block">
                {card.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
