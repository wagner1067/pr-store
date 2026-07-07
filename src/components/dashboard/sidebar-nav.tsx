'use client';

import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Clock, 
  LogOut, 
  LayoutDashboard,
  Wallet
} from 'lucide-react';
import { UserRole } from '@/lib/auth';

interface SidebarNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
}

export function SidebarNav({ currentTab, setTab, userRole, userName, onLogout }: SidebarNavProps) {
  const isManagerOrOwner = userRole === 'DONO' || userRole === 'GERENTE';

  const menuItems = [
    {
      id: 'metrics',
      label: 'Métricas',
      icon: TrendingUp,
      allowed: isManagerOrOwner,
    },
    {
      id: 'pdv',
      label: 'Frente de Caixa (PDV)',
      icon: ShoppingCart,
      allowed: true,
    },
    {
      id: 'stock',
      label: 'Estoque',
      icon: Package,
      allowed: true,
    },
    {
      id: 'debtors',
      label: 'Promissórias / Débitos',
      icon: Users,
      allowed: true,
    },
    {
      id: 'expenses',
      label: 'Despesas',
      icon: DollarSign,
      allowed: isManagerOrOwner,
    },
    {
      id: 'caixa',
      label: 'Fechamento de Caixa',
      icon: Wallet,
      allowed: true,
    },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col justify-between h-screen sticky top-0">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-border">
            <img src="/logo.jpg" alt="PR Store" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-gold-gradient">PR Store</h2>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">ERP System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems
            .filter((item) => item.allowed)
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
        </nav>
      </div>

      {/* Footer / User info */}
      <div className="p-6 border-t border-border bg-background/30 space-y-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-wider truncate">
            {userName}
          </span>
          <span className="text-[8px] font-extrabold uppercase tracking-widest text-primary mt-0.5">
            Role: {userRole}
          </span>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 border border-destructive/20 hover:border-destructive text-destructive font-black text-[10px] uppercase tracking-wider py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair do Painel
        </button>
      </div>
    </aside>
  );
}
