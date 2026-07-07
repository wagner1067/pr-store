'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Plus, 
  Check, 
  Search, 
  AlertCircle, 
  Calendar, 
  Trash2, 
  UserPlus, 
  ArrowUpRight, 
  TrendingDown, 
  Activity,
  ChevronRight,
  Printer,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Wallet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { AuthUser } from '@/lib/auth';
import { formatCurrency, formatDate } from '@/lib/utils';
import { SidebarNav } from './sidebar-nav';
import { DashboardHeader } from './dashboard-header';
import { KPICards } from './kpi-cards';

interface DashboardClientProps {
  user: AuthUser;
}

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();
  const [currentTab, setTab] = useState('pdv'); // Default to PDV for faster checkout access
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data State
  const [kpis, setKpis] = useState({
    todayRevenue: 0,
    todayCount: 0,
    monthRevenue: 0,
    monthCount: 0,
    totalClients: 0,
    activeDebtors: 0,
    totalDebt: 0,
  });
  const [sales, setSales] = useState<any[]>([]);
  const [debtors, setDebtors] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [abcReport, setAbcReport] = useState<any[]>([]);
  const [activeCaixa, setActiveCaixa] = useState<any | null>(null);
  
  // Stock State (Fetched from /api/products)
  const [products, setProducts] = useState<any[]>([]);
  const [stockSearch, setStockSearch] = useState('');
  const [stockCategory, setStockCategory] = useState('All');
  
  // PDV Cart & Form State
  const [pdvCart, setPdvCart] = useState<any[]>([]);
  const [pdvClientPhone, setPdvClientPhone] = useState('');
  const [pdvClientName, setPdvClientName] = useState('');
  const [pdvMethod, setPdvMethod] = useState<'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PROMISSORIA'>('PIX');
  const [pdvSubmitting, setPdvSubmitting] = useState(false);
  const [pdvSuccess, setPdvSuccess] = useState(false);
  
  // Debtors Filter & Add
  const [debtorSearch, setDebtorSearch] = useState('');
  const [showAddDebtorModal, setShowAddDebtorModal] = useState(false);
  const [debtorName, setDebtorName] = useState('');
  const [debtorPhone, setDebtorPhone] = useState('');
  const [debtorAmount, setDebtorAmount] = useState('');
  const [debtorDueDate, setDebtorDueDate] = useState('');
  
  // Product Creation
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodPromoPrice, setProdPromoPrice] = useState('');
  const [prodPromoUntil, setProdPromoUntil] = useState('');
  const [prodCategory, setProdCategory] = useState<'Roupas' | 'Tenis' | 'Acessorios'>('Roupas');
  const [prodBrand, setProdBrand] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodSizes, setProdSizes] = useState<string[]>([]);
  const [prodDescription, setProdDescription] = useState('');
  
  // Expense Creation
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [expValue, setExpValue] = useState('');
  const [expCategory, setExpCategory] = useState<'FIXO' | 'VARIAVEL'>('VARIAVEL');

  // Caixa Management
  const [initialAmtInput, setInitialAmtInput] = useState('');
  const [finalAmtInput, setFinalAmtInput] = useState('');
  const [caixaNotes, setCaixaNotes] = useState('');

  const isManagerOrOwner = user.role === 'DONO' || user.role === 'GERENTE';

  // ── Atualização em tempo real ──────────────────────────────────────────────
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const REFRESH_INTERVAL_MS = 30000;

  // Fetch Admin Data
  const fetchData = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await fetch('/api/admin', { cache: 'no-store' });
      const data = await res.json();
      
      if (data.success) {
        setKpis(data.kpis);
        setSales(data.sales);
        setDebtors(data.debtors);
        setClients(data.clients);
        setOrders(data.orders);
        setExpenses(data.expenses || []);
        setAbcReport(data.abcReport || []);
        setActiveCaixa(data.activeCaixa);
        
        // Auto routing if employee and somehow tries to access metrics
        if (user.role === 'FUNCIONARIO' && currentTab === 'metrics') {
          setTab('pdv');
        }
      } else {
        setError(data.error || 'Falha ao carregar dados');
      }

      // Fetch products for PDV catalog
      const prodRes = await fetch('/api/products?limit=100');
      const prodData = await prodRes.json();
      if (prodData.success) {
        setProducts(prodData.products);
      }
    } catch (err) {
      setError('Erro de conexão ao carregar dados.');
    } finally {
      setIsLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentTab]);

  // Polling em tempo real — atualiza silenciosamente em segundo plano.
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return; // pausa se aba oculta
      fetchData({ silent: true });
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, currentTab]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  // PDV Logic
  const addToCart = (product: any) => {
    if (product.stock <= 0) return;
    const existing = pdvCart.find(i => i.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return;
      setPdvCart(pdvCart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setPdvCart([...pdvCart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setPdvCart(pdvCart.filter(i => i.id !== id));
  };

  const updateCartQty = (id: string, delta: number) => {
    setPdvCart(pdvCart.map(i => {
      if (i.id === id) {
        const nQty = i.quantity + delta;
        if (nQty > i.stock) return i;
        return nQty > 0 ? { ...i, quantity: nQty } : i;
      }
      return i;
    }));
  };

  const cartTotal = pdvCart.reduce((acc, item) => {
    const price = item.promoPrice || item.price;
    return acc + price * item.quantity;
  }, 0);

  const handleRegisterSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pdvCart.length === 0 && cartTotal <= 0) return;
    if (!activeCaixa) {
      alert('É necessário abrir o caixa antes de fazer uma venda!');
      return;
    }
    
    setPdvSubmitting(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_pdv_sale',
          clientPhone: pdvClientPhone || '0000000000',
          clientName: pdvClientName || 'Cliente PDV',
          total: cartTotal,
          paymentMethod: pdvMethod,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPdvSuccess(true);
        setPdvCart([]);
        setPdvClientPhone('');
        setPdvClientName('');
        setPdvMethod('PIX');
        fetchData();
        setTimeout(() => setPdvSuccess(false), 3000);
      } else {
        alert(data.error || 'Erro ao registrar venda');
      }
    } catch {
      alert('Erro de conexão ao registrar venda.');
    } finally {
      setPdvSubmitting(false);
    }
  };

  // Debtor Discharge / Paid
  const handleDischargeDebtor = async (id: string) => {
    if (!confirm('Deseja realmente dar baixa nesta promissória?')) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discharge_debtor', id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || 'Falha ao dar baixa');
      }
    } catch {
      alert('Erro de conexão.');
    }
  };

  // Add Debtor
  const handleAddDebtor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_debtor',
          name: debtorName,
          phone: debtorPhone,
          amount: parseFloat(debtorAmount),
          dueDate: new Date(debtorDueDate).toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddDebtorModal(false);
        setDebtorName('');
        setDebtorPhone('');
        setDebtorAmount('');
        setDebtorDueDate('');
        fetchData();
      } else {
        alert(data.error || 'Erro ao adicionar débito');
      }
    } catch {
      alert('Erro de conexão.');
    }
  };

  // Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prodName,
          price: parseFloat(prodPrice),
          promoPrice: prodPromoPrice ? parseFloat(prodPromoPrice) : null,
          promoUntil: prodPromoUntil ? new Date(prodPromoUntil).toISOString() : null,
          category: prodCategory,
          brand: prodBrand || 'PR Store',
          stock: parseInt(prodStock),
          sizes: prodSizes.length > 0 ? prodSizes : ['Unico'],
          description: prodDescription,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddProductModal(false);
        setProdName('');
        setProdPrice('');
        setProdPromoPrice('');
        setProdPromoUntil('');
        setProdBrand('');
        setProdStock('');
        setProdSizes([]);
        setProdDescription('');
        fetchData();
      } else {
        alert(data.error || 'Erro ao cadastrar produto');
      }
    } catch {
      alert('Erro de conexão.');
    }
  };

  // Add Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_expense',
          description: expDesc,
          value: parseFloat(expValue),
          category: expCategory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddExpenseModal(false);
        setExpDesc('');
        setExpValue('');
        fetchData();
      } else {
        alert(data.error || 'Erro ao cadastrar despesa');
      }
    } catch {
      alert('Erro de conexão.');
    }
  };

  // Caixa Actions
  const handleOpenCaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'open_caixa',
          initialAmt: parseFloat(initialAmtInput),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInitialAmtInput('');
        fetchData();
      } else {
        alert(data.error);
      }
    } catch {
      alert('Erro de conexão.');
    }
  };

  const handleCloseCaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close_caixa',
          finalAmt: parseFloat(finalAmtInput),
          notes: caixaNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFinalAmtInput('');
        setCaixaNotes('');
        alert(data.isBalanced ? 'Caixa fechado com sucesso! Saldo batido.' : `Caixa fechado! Saldo de divergência detectado. Esperado: ${formatCurrency(data.expectedAmt)}`);
        fetchData();
      } else {
        alert(data.error);
      }
    } catch {
      alert('Erro de conexão.');
    }
  };

  // Filters for lists
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(stockSearch.toLowerCase()) || p.brand.toLowerCase().includes(stockSearch.toLowerCase());
    const matchCat = stockCategory === 'All' || p.category === stockCategory;
    return matchSearch && matchCat;
  });

  const filteredDebtors = debtors.filter(d => 
    d.name.toLowerCase().includes(debtorSearch.toLowerCase()) || d.phone.includes(debtorSearch)
  );

  // Send WhatsApp Collection
  const openWhatsAppCollection = (debtor: any) => {
    const message = `Olá ${debtor.name}, notamos que há uma promissória pendente no valor de ${formatCurrency(debtor.amount)} com vencimento em ${formatDate(debtor.dueDate)}. Por favor, entre em contato para regularização. Obrigado! - PR Store`;
    const cleanPhone = debtor.phone.replace(/[^\d]/g, '');
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // ABC chart data mapping
  const abcData = abcReport.map((p, idx) => ({
    name: p.name.split(' ')[0] + ' ' + (p.name.split(' ')[1] || ''),
    Faturamento: p.revenue,
    Rank: `ABC ${idx < 3 ? 'A' : idx < 6 ? 'B' : 'C'}`
  }));

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      {/* Sidebar */}
      <SidebarNav
        currentTab={currentTab}
        setTab={setTab}
        userRole={user.role}
        userName={user.name}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title={
            currentTab === 'metrics' ? 'Dashboard de Métricas & Curva ABC' :
            currentTab === 'pdv' ? 'Frente de Caixa (PDV) - Registro de Vendas' :
            currentTab === 'stock' ? 'Gestão de Estoque & Catálogo' :
            currentTab === 'debtors' ? 'Controle de Promissórias & Clientes Inadimplentes' :
            currentTab === 'expenses' ? 'Controle de Custos e Despesas' :
            'Fechamento e Registro de Caixa'
          }
          isCaixaOpen={!!activeCaixa}
          caixaInitialAmt={activeCaixa ? activeCaixa.initialAmt : null}
          lastUpdated={lastUpdated}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={() => setAutoRefresh((v) => !v)}
        />

        <main className="p-8 flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-20 text-xs font-bold uppercase tracking-widest text-primary animate-pulse">
              Carregando dados do sistema...
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 border border-destructive/20 bg-destructive/5 text-destructive text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {!isLoading && !error && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* TAB: METRICS */}
              {currentTab === 'metrics' && isManagerOrOwner && (
                <div className="space-y-8">
                  {/* KPIs */}
                  <KPICards {...kpis} totalClients={clients.length} />

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main revenue flow */}
                    <div className="lg:col-span-7 border border-border rounded-xl p-6 bg-card">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider">Desempenho de Vendas Recentes</h3>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1 block">Faturamento consolidado bruto</span>
                        </div>
                      </div>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sales.slice(0, 15).reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', fontSize: '11px', textTransform: 'uppercase' }}
                              labelStyle={{ fontWeight: 'black', color: 'var(--primary)' }}
                            />
                            <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Curva ABC */}
                    <div className="lg:col-span-5 border border-border rounded-xl p-6 bg-card flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider">Produtos Mais Vendidos (Curva ABC)</h3>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1 block">Top 10 faturamento gerado</span>
                      </div>
                      <div className="h-56 mt-6">
                        {abcData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={abcData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={9} tickLine={false} />
                              <YAxis stroke="var(--muted-foreground)" fontSize={9} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', fontSize: '10px' }}
                              />
                              <Bar dataKey="Faturamento" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                                {abcData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index < 3 ? 'var(--primary)' : 'var(--muted-foreground)'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-[10px] uppercase font-bold text-muted-foreground">
                            Sem dados de vendas suficientes para Curva ABC.
                          </div>
                        )}
                      </div>
                      <div className="mt-4 border-t border-border pt-4 flex justify-between text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                        <span>Rank A (Estrelas): 3 primeiros</span>
                        <span>Rank B/C (Giro): Restante</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders table */}
                  <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="p-6 border-b border-border">
                      <h3 className="text-xs font-black uppercase tracking-wider">Pedidos Recentes do E-commerce</h3>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-secondary/10">
                          <th className="p-4">Cliente</th>
                          <th className="p-4">Total</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Método</th>
                          <th className="p-4">Data</th>
                          <th className="p-4">Produtos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 10).map((order) => (
                          <tr key={order.id} className="border-b border-border hover:bg-secondary/10 text-xs font-medium transition-colors">
                            <td className="p-4 font-bold">{order.clientName}</td>
                            <td className="p-4 text-primary font-bold">{formatCurrency(order.total)}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                order.status === 'PAGO' ? 'bg-success/15 text-success border border-success/20' :
                                order.status === 'PENDENTE' ? 'bg-warning/15 text-warning border border-warning/20' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-4 font-mono">{order.paymentMethod}</td>
                            <td className="p-4 text-muted-foreground">{formatDate(order.date)}</td>
                            <td className="p-4 text-muted-foreground truncate max-w-xs" title={order.items.map((i: any) => `${i.qty}x ${i.name}`).join(', ')}>
                              {order.items.map((i: any) => `${i.qty}x ${i.name}`).join(', ')}
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-[10px] text-muted-foreground uppercase font-black">Nenhum pedido digital cadastrado ainda.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: PDV */}
              {currentTab === 'pdv' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: POS Catalog Catalog */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={stockSearch}
                          onChange={(e) => setStockSearch(e.target.value)}
                          placeholder="Buscar produto por nome/marca..."
                          className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-xs focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto">
                        {['All', 'Roupas', 'Tenis', 'Acessorios'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setStockCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                              stockCategory === cat
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-border text-muted-foreground bg-card'
                            }`}
                          >
                            {cat === 'All' ? 'Todos' : cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Catalog Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredProducts.map((p) => {
                        const displayPrice = p.promoPrice || p.price;
                        const hasStock = p.stock > 0;
                        return (
                          <button
                            key={p.id}
                            disabled={!hasStock}
                            onClick={() => addToCart(p)}
                            className="text-left border border-border hover:border-primary/40 p-4 rounded-xl bg-card transition-all flex flex-col justify-between h-40 disabled:opacity-30 disabled:cursor-not-allowed group cursor-pointer"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-[8px] font-black text-primary uppercase tracking-widest">{p.brand}</span>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground`}>
                                  Qtd: {p.stock}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold leading-snug line-clamp-2 mt-1.5 group-hover:text-primary transition-colors">{p.name}</h4>
                            </div>
                            <div className="mt-4 flex justify-between items-end">
                              <span className="text-xs font-black">{formatCurrency(displayPrice)}</span>
                              <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                Adicionar +
                              </span>
                            </div>
                          </button>
                        );
                      })}
                      {filteredProducts.length === 0 && (
                        <div className="col-span-full py-16 text-center text-muted-foreground uppercase text-[10px] font-black bg-card border border-border rounded-xl">
                          Nenhum produto em estoque correspondente.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: POS Ticket / Checkout Form */}
                  <div className="lg:col-span-5 border border-border rounded-xl bg-card p-6 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-wider border-b border-border pb-4">Cupom de Venda Presencial</h3>

                    {/* Cart Items */}
                    <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                      {pdvCart.map((item) => {
                        const price = item.promoPrice || item.price;
                        return (
                          <div key={item.id} className="flex items-center justify-between border-b border-border/40 pb-2 text-xs">
                            <div className="flex flex-col max-w-[65%]">
                              <span className="font-bold truncate">{item.name}</span>
                              <span className="text-[9px] text-muted-foreground font-semibold">{formatCurrency(price)}/un</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-border rounded">
                                <button type="button" onClick={() => updateCartQty(item.id, -1)} className="px-1.5 py-0.5 text-[10px] hover:bg-secondary cursor-pointer">-</button>
                                <span className="px-2 font-mono font-bold text-[10px]">{item.quantity}</span>
                                <button type="button" onClick={() => updateCartQty(item.id, 1)} className="px-1.5 py-0.5 text-[10px] hover:bg-secondary cursor-pointer">+</button>
                              </div>
                              <button type="button" onClick={() => removeFromCart(item.id)} className="text-destructive hover:scale-105 transition-transform cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {pdvCart.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground text-[10px] uppercase font-bold">
                          Sacola vazia. Clique nos produtos para iniciar.
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="border-t border-border pt-4 flex justify-between items-baseline">
                      <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Valor Total:</span>
                      <span className="text-lg font-black text-primary">{formatCurrency(cartTotal)}</span>
                    </div>

                    {/* Client Details & Payment Form */}
                    <form onSubmit={handleRegisterSale} className="space-y-4 pt-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Celular do Cliente (WhatsApp)</label>
                        <input
                          type="text"
                          value={pdvClientPhone}
                          onChange={(e) => setPdvClientPhone(e.target.value)}
                          placeholder="Ex: 45999998888"
                          required
                          className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs focus:border-primary focus:outline-none transition-colors font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Nome Completo (Opcional)</label>
                        <input
                          type="text"
                          value={pdvClientName}
                          onChange={(e) => setPdvClientName(e.target.value)}
                          placeholder="Ex: Wagner Silva"
                          className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Forma de Pagamento</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'PIX', label: 'PIX' },
                            { id: 'CARTAO_CREDITO', label: 'Crédito' },
                            { id: 'CARTAO_DEBITO', label: 'Débito' },
                            { id: 'PROMISSORIA', label: 'Promissória (Pend)' },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setPdvMethod(opt.id as any)}
                              className={`py-2 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                pdvMethod === opt.id
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-border hover:bg-secondary/40 text-muted-foreground'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {pdvSuccess && (
                        <div className="bg-success/15 border border-success/30 text-success text-[10px] font-bold uppercase rounded-lg px-3 py-2 text-center animate-fadeIn">
                          Venda presencial registrada com sucesso!
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={pdvSubmitting || pdvCart.length === 0 || !activeCaixa}
                        className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary/95 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/10"
                      >
                        {!activeCaixa ? 'Abrir Caixa Primeiro' : pdvSubmitting ? 'Registrando...' : 'Finalizar e Emitir Cupom'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB: STOCK */}
              {currentTab === 'stock' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="relative w-full max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={stockSearch}
                        onChange={(e) => setStockSearch(e.target.value)}
                        placeholder="Buscar por nome/marca..."
                        className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-xs focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    {isManagerOrOwner && (
                      <button
                        onClick={() => setShowAddProductModal(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-black uppercase tracking-widest py-3 px-5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Cadastrar Produto
                      </button>
                    )}
                  </div>

                  {/* Stock List table */}
                  <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-secondary/10">
                          <th className="p-4">Produto</th>
                          <th className="p-4">Marca</th>
                          <th className="p-4">Categoria</th>
                          <th className="p-4">Tamanhos</th>
                          <th className="p-4">Estoque</th>
                          <th className="p-4">Preço Original</th>
                          <th className="p-4">Preço Promo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((prod) => (
                          <tr key={prod.id} className="border-b border-border hover:bg-secondary/10 text-xs font-semibold transition-colors">
                            <td className="p-4 font-bold">{prod.name}</td>
                            <td className="p-4 text-primary uppercase font-bold">{prod.brand}</td>
                            <td className="p-4">{prod.category}</td>
                            <td className="p-4 font-mono">{prod.sizes.join(', ')}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prod.stock <= 2 ? 'bg-destructive/15 text-destructive border border-destructive/25' : 'bg-secondary text-muted-foreground'}`}>
                                {prod.stock} un
                              </span>
                            </td>
                            <td className="p-4">{formatCurrency(prod.price)}</td>
                            <td className="p-4 text-success">{prod.promoPrice ? formatCurrency(prod.promoPrice) : '-'}</td>
                          </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-[10px] text-muted-foreground uppercase font-black">Nenhum produto cadastrado.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Product Modal */}
                  {showAddProductModal && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto space-y-4">
                        <div className="flex justify-between items-center border-b border-border pb-3">
                          <h3 className="text-xs font-black uppercase tracking-wider text-primary">Cadastrar Novo Produto</h3>
                          <button onClick={() => setShowAddProductModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">Fechar</button>
                        </div>
                        <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Nome do Produto</label>
                              <input type="text" value={prodName} onChange={(e) => setProdName(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Marca</label>
                              <input type="text" value={prodBrand} onChange={(e) => setProdBrand(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none" />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Preço Original (R$)</label>
                              <input type="number" step="0.01" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Preço Promo (Opcional)</label>
                              <input type="number" step="0.01" value={prodPromoPrice} onChange={(e) => setProdPromoPrice(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Qtd em Estoque</label>
                              <input type="number" value={prodStock} onChange={(e) => setProdStock(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Categoria</label>
                              <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value as any)} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none">
                                <option value="Roupas">Roupas</option>
                                <option value="Tenis">Tênis</option>
                                <option value="Acessorios">Acessórios</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Tamanhos (separados por vírgula)</label>
                              <input type="text" placeholder="ex: 40,41,42 ou M,G,GG" onChange={(e) => setProdSizes(e.target.value.split(',').map(s => s.trim()))} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Descrição</label>
                            <textarea rows={3} value={prodDescription} onChange={(e) => setProdDescription(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none" />
                          </div>

                          <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-black uppercase tracking-widest hover:bg-primary/95 transition-colors cursor-pointer">
                            Cadastrar e Publicar
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: DEBTORS */}
              {currentTab === 'debtors' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="relative w-full max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={debtorSearch}
                        onChange={(e) => setDebtorSearch(e.target.value)}
                        placeholder="Buscar devedor por nome/telefone..."
                        className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-xs focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    {isManagerOrOwner && (
                      <button
                        onClick={() => setShowAddDebtorModal(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-black uppercase tracking-widest py-3 px-5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" /> Registrar Promissória
                      </button>
                    )}
                  </div>

                  {/* Debtors List table */}
                  <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-secondary/10">
                          <th className="p-4">Cliente</th>
                          <th className="p-4">Telefone</th>
                          <th className="p-4">Débito total</th>
                          <th className="p-4">Vencimento</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDebtors.map((debtor) => (
                          <tr key={debtor.id} className="border-b border-border hover:bg-secondary/10 text-xs font-semibold transition-colors">
                            <td className="p-4 font-bold">{debtor.name}</td>
                            <td className="p-4 font-mono text-muted-foreground">{debtor.phone}</td>
                            <td className="p-4 text-destructive font-black">{formatCurrency(debtor.amount)}</td>
                            <td className="p-4">{formatDate(debtor.dueDate)}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                debtor.isPaid ? 'bg-success/15 text-success border border-success/20' :
                                debtor.isOverdue ? 'bg-destructive/15 text-destructive border border-destructive/20 animate-pulse' :
                                'bg-warning/15 text-warning border border-warning/20'
                              }`}>
                                {debtor.isPaid ? 'PAGO' : debtor.isOverdue ? 'ATRASADO' : 'PENDENTE'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {!debtor.isPaid && (
                                <>
                                  <button
                                    onClick={() => openWhatsAppCollection(debtor)}
                                    className="bg-success text-success-foreground hover:bg-success/90 px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-wider transition-colors cursor-pointer"
                                  >
                                    Cobrar WhatsApp
                                  </button>
                                  {isManagerOrOwner && (
                                    <button
                                      onClick={() => handleDischargeDebtor(debtor.id)}
                                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-wider transition-colors cursor-pointer"
                                    >
                                      Dar Baixa
                                    </button>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredDebtors.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-[10px] text-muted-foreground uppercase font-black">Nenhum devedor encontrado.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Debtor Modal */}
                  {showAddDebtorModal && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-border pb-3">
                          <h3 className="text-xs font-black uppercase tracking-wider text-primary">Lançar Promissória</h3>
                          <button onClick={() => setShowAddDebtorModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">Fechar</button>
                        </div>
                        <form onSubmit={handleAddDebtor} className="space-y-4 text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Nome Completo</label>
                            <input type="text" value={debtorName} onChange={(e) => setDebtorName(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none" />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Telefone Celular</label>
                            <input type="text" value={debtorPhone} onChange={(e) => setDebtorPhone(e.target.value)} placeholder="DDD + Número" required className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none font-mono" />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Valor do Débito (R$)</label>
                            <input type="number" step="0.01" value={debtorAmount} onChange={(e) => setDebtorAmount(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none" />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Data de Vencimento</label>
                            <input type="date" value={debtorDueDate} onChange={(e) => setDebtorDueDate(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none font-mono" />
                          </div>

                          <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-black uppercase tracking-widest hover:bg-primary/95 transition-colors cursor-pointer">
                            Registrar Pendência
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: EXPENSES */}
              {currentTab === 'expenses' && isManagerOrOwner && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider">Histórico de Custos & Despesas</h3>
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1 block">Gastos fixos e variáveis registrados</span>
                    </div>

                    <button
                      onClick={() => setShowAddExpenseModal(true)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-black uppercase tracking-widest py-3 px-5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Lançar Despesa
                    </button>
                  </div>

                  {/* Expenses List table */}
                  <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-secondary/10">
                          <th className="p-4">Descrição</th>
                          <th className="p-4">Categoria</th>
                          <th className="p-4">Valor</th>
                          <th className="p-4">Data Lançamento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((exp) => (
                          <tr key={exp.id} className="border-b border-border hover:bg-secondary/10 text-xs font-semibold transition-colors">
                            <td className="p-4 font-bold">{exp.description}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black ${exp.category === 'FIXO' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'}`}>
                                {exp.category}
                              </span>
                            </td>
                            <td className="p-4 text-destructive font-black">{formatCurrency(exp.value)}</td>
                            <td className="p-4 text-muted-foreground">{formatDate(exp.date)}</td>
                          </tr>
                        ))}
                        {expenses.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-[10px] text-muted-foreground uppercase font-black">Nenhuma despesa registrada neste período.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Expense Modal */}
                  {showAddExpenseModal && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-border pb-3">
                          <h3 className="text-xs font-black uppercase tracking-wider text-primary">Registrar Despesa</h3>
                          <button onClick={() => setShowAddExpenseModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">Fechar</button>
                        </div>
                        <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Descrição</label>
                            <input type="text" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} placeholder="Ex: Aluguel da Loja Física" required className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none" />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Valor (R$)</label>
                            <input type="number" step="0.01" value={expValue} onChange={(e) => setExpValue(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none" />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Categoria</label>
                            <select value={expCategory} onChange={(e) => setExpCategory(e.target.value as any)} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none">
                              <option value="VARIAVEL">Variável</option>
                              <option value="FIXO">Fixo</option>
                            </select>
                          </div>

                          <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-black uppercase tracking-widest hover:bg-primary/95 transition-colors cursor-pointer">
                            Confirmar Lançamento
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: CAIXA */}
              {currentTab === 'caixa' && (
                <div className="max-w-xl mx-auto border border-border rounded-2xl bg-card p-8 space-y-8 shadow-2xl">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Wallet className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wider">Fechamento de Caixa diário</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Controle de fluxo de caixa e batimento de vendas presenciais</p>
                  </div>

                  {!activeCaixa ? (
                    /* Open Caixa Form */
                    <form onSubmit={handleOpenCaixa} className="space-y-4">
                      <div className="bg-warning/10 border border-warning/25 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                        <div className="text-xs">
                          <h4 className="font-bold text-warning uppercase">Caixa Fechado</h4>
                          <p className="text-muted-foreground mt-1 leading-relaxed">Você precisa definir um fundo de troco (valor de abertura) para iniciar o turno de vendas.</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Fundo de Troco Inicial (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={initialAmtInput}
                          onChange={(e) => setInitialAmtInput(e.target.value)}
                          placeholder="Ex: 150.00"
                          required
                          className="w-full bg-background border border-border rounded-lg px-4 py-3 text-xs focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary/95 transition-colors cursor-pointer"
                      >
                        Abrir Caixa do Dia
                      </button>
                    </form>
                  ) : (
                    /* Close Caixa Form */
                    <form onSubmit={handleCloseCaixa} className="space-y-6">
                      <div className="bg-success/10 border border-success/25 p-4 rounded-xl flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <div className="text-xs">
                          <h4 className="font-bold text-success uppercase">Caixa Aberto</h4>
                          <p className="text-muted-foreground mt-1 leading-relaxed">Caixa aberto em {new Date(activeCaixa.openedAt).toLocaleDateString('pt-BR')} às {new Date(activeCaixa.openedAt).toLocaleTimeString('pt-BR')}.</p>
                        </div>
                      </div>

                      <div className="border border-border rounded-xl p-5 bg-background space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Fundo de Abertura:</span>
                          <span className="font-bold">{formatCurrency(activeCaixa.initialAmt)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Saídas (Despesas no Caixa):</span>
                          <span className="font-bold text-destructive">-{formatCurrency(activeCaixa.expensesSum)}</span>
                        </div>
                        <div className="border-t border-border/50 pt-2 flex justify-between items-center text-xs font-black">
                          <span>Abertura Líquida:</span>
                          <span>{formatCurrency(activeCaixa.initialAmt - activeCaixa.expensesSum)}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Valor Físico Contado em Caixa (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={finalAmtInput}
                            onChange={(e) => setFinalAmtInput(e.target.value)}
                            placeholder="Conte todo o dinheiro da gaveta"
                            required
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-xs focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Observações / Notas</label>
                          <textarea
                            rows={3}
                            value={caixaNotes}
                            onChange={(e) => setCaixaNotes(e.target.value)}
                            placeholder="Informe qualquer divergência ou notas sobre o fechamento..."
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-xs focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary/95 transition-colors cursor-pointer"
                      >
                        Salvar e Fechar Turno
                      </button>
                    </form>
                  )}
                </div>
              )}

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
