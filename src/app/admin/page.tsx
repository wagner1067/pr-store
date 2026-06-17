'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Shield, TrendingUp, AlertTriangle, 
  Package, Check, MessageSquare, Plus, Upload, 
  DollarSign, FileText, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Bar, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

interface Debtor {
  id: string;
  name: string;
  phone: string;
  amount: number;
  dueDate: string;
  isOverdue: boolean;
}

interface ABCProduct {
  id: string;
  name: string;
  salesCount: number;
  stock: number;
  revenue: number;
  status: 'ESTÁVEL' | 'CRÍTICO' | 'ALERTA';
}

interface Product {
  id: string;
  name: string;
  brand: string;
  stock: number;
  price: number;
  category: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Nike Air Jordan 1 High Gold', brand: 'Nike Jordan', stock: 5, price: 1899.90, category: 'Tenis' },
  { id: '2', name: 'Supreme Box Logo Hoodie', brand: 'Supreme', stock: 3, price: 1499.90, category: 'Roupas' },
  { id: '3', name: 'Yeezy Boost 350 Luxury', brand: 'Adidas', stock: 8, price: 1699.90, category: 'Tenis' },
  { id: '4', name: 'PR Store Classic Necklace', brand: 'PR Store', stock: 12, price: 499.90, category: 'Acessorios' },
  { id: '5', name: 'Off-White Industrial Belt Gold Edition', brand: 'Off-White', stock: 2, price: 799.90, category: 'Acessorios' }
];

const INITIAL_DEBTORS: Debtor[] = [
  { id: '1', name: 'Marcos Oliveira', phone: '5545999887766', amount: 890.00, dueDate: '2026-06-10', isOverdue: true },
  { id: '2', name: 'Ana Beatriz Souza', phone: '5545999554433', amount: 1200.00, dueDate: '2026-06-25', isOverdue: false },
  { id: '3', name: 'Lucas Pinheiro', phone: '5545999112233', amount: 450.00, dueDate: '2026-06-05', isOverdue: true },
];

const ABC_PRODUCTS: ABCProduct[] = [
  { id: '1', name: 'Nike Air Jordan 1 High Gold', salesCount: 45, stock: 2, revenue: 71995.50, status: 'CRÍTICO' },
  { id: '2', name: 'Yeezy Boost 350 Luxury', salesCount: 38, stock: 8, revenue: 53196.20, status: 'ESTÁVEL' },
  { id: '3', name: 'Supreme Box Logo Hoodie', salesCount: 20, stock: 3, revenue: 25998.00, status: 'ALERTA' },
  { id: '4', name: 'PR Store Classic Necklace', salesCount: 15, stock: 12, revenue: 7498.50, status: 'ESTÁVEL' },
];

const ANALYTICAL_CHART_DATA = [
  { name: 'Jan', vendas: 380000, receita: 320000, estoque: 700000 },
  { name: 'Fev', vendas: 420000, receita: 360000, estoque: 680000 },
  { name: 'Mar', vendas: 510000, receita: 440000, estoque: 650000 },
  { name: 'Abr', vendas: 480000, receita: 410000, estoque: 620000 },
  { name: 'Mai', vendas: 590000, receita: 520000, estoque: 580000 },
  { name: 'Jun', vendas: 720000, receita: 630000, estoque: 550000 },
  { name: 'Jul', vendas: 680000, receita: 590000, estoque: 600000 },
  { name: 'Ago', vendas: 750000, receita: 670000, estoque: 540000 },
  { name: 'Set', vendas: 890000, receita: 790000, estoque: 490000 },
  { name: 'Out', vendas: 980000, receita: 880000, estoque: 420000 },
  { name: 'Nov', vendas: 1150000, receita: 1050000, estoque: 380000 },
  { name: 'Dez', vendas: 1500000, receita: 1350000, estoque: 330000 }
];

export default function AdminDashboard() {
  const [role, setRole] = useState<'DONO' | 'FUNCIONARIO'>('DONO');
  const [mounted, setMounted] = useState(false);
  
  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Dashboard states
  const [expenses, setExpenses] = useState<{description: string, val: number}[]>([
    { description: 'Aluguel do Espaço Físico', val: 3500.00 },
    { description: 'Energia Elétrica Comercial', val: 780.00 },
    { description: 'Marketing Digital Trafego Pago', val: 1200.00 }
  ]);
  const [expDescription, setExpDescription] = useState('');
  const [expValue, setExpValue] = useState('');
  
  // PDV States
  const [pdvClientPhone, setPdvClientPhone] = useState('');
  const [pdvClientName, setPdvClientName] = useState('');
  const [pdvTotal, setPdvTotal] = useState('');
  const [pdvMethod, setPdvMethod] = useState<'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PROMISSORIA'>('PIX');
  const [pdvSuccessMessage, setPdvSuccessMessage] = useState('');

  // Promissória state
  const [debtors, setDebtors] = useState<Debtor[]>(INITIAL_DEBTORS);

  // Metas state
  const metaFaturamento = 150000.00;
  const faturamentoAtual = 104590.20;
  const progressPercent = Math.min((faturamentoAtual / metaFaturamento) * 100, 100);

  // Product Sheet Form States
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodCategory, setProdCategory] = useState('Tenis');
  const [prodBrand, setProdBrand] = useState('');
  const [productFormSuccess, setProductFormSuccess] = useState(false);

  // Add Expense handler
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expDescription && expValue) {
      setExpenses(prev => [...prev, { description: expDescription, val: parseFloat(expValue) }]);
      setExpDescription('');
      setExpValue('');
    }
  };

  // Product Registry handler
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prodName && prodPrice && prodStock) {
      setProductFormSuccess(true);
      setTimeout(() => {
        setProductFormSuccess(false);
        setProdName('');
        setProdPrice('');
        setProdStock('');
        setProdBrand('');
      }, 2000);
    }
  };

  // PDV Sale Registry
  const handlePdvSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdvClientPhone || !pdvTotal) return;

    const totalVal = parseFloat(pdvTotal);

    if (pdvMethod === 'PROMISSORIA') {
      const newDebtor: Debtor = {
        id: Math.random().toString(),
        name: pdvClientName || 'Cliente PDV Presencial',
        phone: pdvClientPhone,
        amount: totalVal,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days due
        isOverdue: false
      };
      setDebtors(prev => [...prev, newDebtor]);
    }

    setPdvSuccessMessage('Venda presencial registrada com sucesso no caixa do Supabase!');
    setPdvClientPhone('');
    setPdvClientName('');
    setPdvTotal('');
    
    setTimeout(() => {
      setPdvSuccessMessage('');
    }, 3000);
  };

  // WhatsApp Billing Link Generator
  const getWhatsAppBillingLink = (debtor: Debtor) => {
    const text = `Olá, ${debtor.name}. Passando para lembrar sobre a sua promissória em aberto na PR Store no valor de R$ ${debtor.amount.toFixed(2)}, com vencimento em ${debtor.dueDate}. Agradecemos a preferência!`;
    return `https://wa.me/${debtor.phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-8">
      {/* RBAC Role Switcher Banner */}
      <div className="bg-[#121214] border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-[#d4af37]" />
          <div>
            <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Painel Administrativo: Níveis de Acesso</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">Mude o papel abaixo para testar as restrições de faturamento.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-lg border border-zinc-850">
          <button
            onClick={() => setRole('DONO')}
            className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              role === 'DONO' 
                ? 'bg-[#d4af37] text-[#09090b]' 
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Dono / Gerente
          </button>
          <button
            onClick={() => setRole('FUNCIONARIO')}
            className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              role === 'FUNCIONARIO' 
                ? 'bg-[#d4af37] text-[#09090b]' 
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Funcionário
          </button>
        </div>
      </div>

      {/* RENDER FOR DONO / GERENTE (FULL PERFORMANCE ANALYSIS & FINANCIAL CHARTS) */}
      {role === 'DONO' && (
        <div className="space-y-8">
          
          {/* Main Chart Card (Análise de Desempenho) */}
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-900">
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider text-[#f4f4f5]">Análise de Desempenho</h2>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mt-0.5">Visão analítica de faturamento e fluxo de caixa</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-900 text-[9px] font-black uppercase tracking-wider">
                <button className="px-2.5 py-1 rounded bg-[#d4af37] text-[#09090b] font-black">Mensal</button>
                <button className="px-2.5 py-1 rounded text-zinc-500 hover:text-white transition-colors">Semanal</button>
                <button className="px-2.5 py-1 rounded text-zinc-500 hover:text-white transition-colors">Diário</button>
              </div>
            </div>

            {/* Custom Recharts Render */}
            <div className="h-80 w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={ANALYTICAL_CHART_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#121214', border: '1px solid #27272a', borderRadius: '8px' }}
                      labelStyle={{ color: '#fafafa', fontWeight: 'bold', fontSize: '11px' }}
                      itemStyle={{ fontSize: '11px' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                    <Bar name="Vendas Totais" dataKey="vendas" fill="#d4af37" radius={[4, 4, 0, 0]} barSize={24} />
                    <Line name="Receita Líquida" type="monotone" dataKey="receita" stroke="#f4f4f5" strokeWidth={2} activeDot={{ r: 6 }} />
                    <Line name="Controle de Estoque" type="monotone" dataKey="estoque" stroke="#71717a" strokeWidth={1.5} strokeDasharray="4 4" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full bg-zinc-950/40 animate-pulse rounded-lg flex items-center justify-center text-zinc-600 text-xs">
                  Carregando Gráficos Analíticos...
                </div>
              )}
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Vendas Totais</span>
                <span className="text-2xl font-black text-[#d4af37]">R$ 1.5M</span>
              </div>
              <span className="text-[9px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 mt-4 self-start">
                +18% Meta Comercial
              </span>
            </div>
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Receita Líquida</span>
                <span className="text-2xl font-black text-white">R$ 1.5M</span>
              </div>
              <span className="text-[9px] text-zinc-500 font-semibold block mt-4">Faturamento Deduzido Impostos</span>
            </div>
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Média do Carrinho</span>
                <span className="text-2xl font-black text-white">R$ 330k</span>
              </div>
              <span className="text-[9px] text-amber-500 font-semibold block mt-4">Ticket Médio de Venda</span>
            </div>
            {/* Horizontal stacked bar mockup */}
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1.5">Vendas por Categoria</span>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                    <span>Tênis</span>
                    <span className="text-[#d4af37]">60%</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-900">
                    <div className="bg-[#d4af37] h-full" style={{ width: '60%' }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                    <span>Vestuário</span>
                    <span className="text-[#d4af37]">30%</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-900">
                    <div className="bg-[#d4af37] h-full" style={{ width: '30%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Goal and Expenses layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Metas Card */}
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-zinc-900">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Progresso Metas</h3>
                  <span className="text-xs font-black text-[#d4af37]">{progressPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-950 border border-zinc-900 rounded-full h-3 overflow-hidden mb-4 mt-2">
                  <div className="bg-[#d4af37] h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500">
                  <span>Atual: R$ {faturamentoAtual.toLocaleString('pt-BR')}</span>
                  <span>Meta: R$ {metaFaturamento.toLocaleString('pt-BR')}</span>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 mt-4">
                Estoque e vendas consolidados em ambiente de produção da PR Store.
              </p>
            </div>

            {/* Cost inputs form */}
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-900">
                Lançar Despesa / Custo
              </h3>
              <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input 
                  type="text" 
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="Descrição da Despesa"
                  className="sm:col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none"
                  required
                />
                <input 
                  type="number" 
                  value={expValue}
                  onChange={(e) => setExpValue(e.target.value)}
                  placeholder="Valor R$"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none"
                  required
                />
                <button 
                  type="submit"
                  className="sm:col-span-3 bg-zinc-850 hover:bg-[#d4af37] hover:text-[#09090b] text-zinc-300 font-black text-[10px] py-2 rounded-lg transition-colors border border-zinc-800 uppercase tracking-widest"
                >
                  Registrar Custo
                </button>
              </form>

              {/* Expenses List */}
              <div className="mt-4 space-y-2 max-h-24 overflow-y-auto pr-1">
                {expenses.map((exp, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] font-semibold text-zinc-500 bg-zinc-950/40 p-2 rounded border border-zinc-900">
                    <span>{exp.description}</span>
                    <span className="text-red-500 font-bold">- R$ {exp.val.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row showing Product File (Ficha de Produto) and Employee Roles (Gestão de Funcionários) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Ficha de Produto */}
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-900">
                Ficha de Produto
              </h3>
              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Image upload drag area */}
                <div className="border-2 border-dashed border-zinc-800 hover:border-[#d4af37]/40 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-zinc-950/60 transition-colors cursor-pointer aspect-video sm:aspect-auto">
                  <Upload className="w-8 h-8 text-zinc-600 mb-2" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Drag & Drop Image</span>
                  <span className="text-[8px] text-zinc-600 block mt-1">Recomendado: WebP/AVIF (Max 5MB)</span>
                </div>

                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Nome do Produto"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="Preço R$"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none"
                      required
                    />
                    <input 
                      type="number" 
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      placeholder="Estoque"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-zinc-400"
                    >
                      <option value="Tenis">Tênis</option>
                      <option value="Roupas">Roupas</option>
                      <option value="Acessorios">Acessórios</option>
                    </select>
                    <input 
                      type="text" 
                      value={prodBrand}
                      onChange={(e) => setProdBrand(e.target.value)}
                      placeholder="Marca"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-[#d4af37] text-[#09090b] font-black text-[10px] py-2.5 rounded-lg transition-all uppercase tracking-widest"
                  >
                    Salvar na Base
                  </button>
                </div>
              </form>
              {productFormSuccess && (
                <div className="mt-3 text-[10px] font-bold text-green-500 flex items-center gap-1 bg-green-500/10 p-2 rounded border border-green-500/20 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Produto cadastrado com compressão Sharp!
                </div>
              )}
            </div>

            {/* Gestão de Funcionários (Toggles) */}
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-900">
                Gestão de Funcionários
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] font-semibold text-zinc-400">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-650 uppercase tracking-widest text-[8px] font-black">
                      <th className="pb-2">Funcionário</th>
                      <th className="pb-2">Financeiro</th>
                      <th className="pb-2">Dashboard</th>
                      <th className="pb-2">Estoque</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-900/60">
                      <td className="py-3 font-bold text-white">Wagner Lima</td>
                      <td>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-7 h-4 bg-zinc-850 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-[#d4af37] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#d4af37]/25" />
                        </label>
                      </td>
                      <td>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-7 h-4 bg-zinc-850 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-[#d4af37] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#d4af37]/25" />
                        </label>
                      </td>
                      <td>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-7 h-4 bg-zinc-850 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-[#d4af37] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#d4af37]/25" />
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">Larissa Souza</td>
                      <td>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-7 h-4 bg-zinc-850 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-[#d4af37] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#d4af37]/25" />
                        </label>
                      </td>
                      <td>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-7 h-4 bg-zinc-850 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-[#d4af37] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#d4af37]/25" />
                        </label>
                      </td>
                      <td>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-7 h-4 bg-zinc-850 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-[#d4af37] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#d4af37]/25" />
                        </label>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* RENDER FOR BOTH ROLES: FRENTE DE CAIXA (PDV) AND STOCK GIRO / CURVA ABC */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PDV Card Panel */}
        <div className="lg:col-span-7 bg-[#121214] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between shadow-lg">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#d4af37] mb-4 pb-2 border-b border-zinc-900 flex items-center justify-between">
              <span>Frente de Caixa (PDV Presencial)</span>
              <span className="text-[8px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-widest">Caixa Aberto</span>
            </h3>
            <form onSubmit={handlePdvSale} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase block mb-1.5 font-bold tracking-widest">WhatsApp do Cliente:</label>
                  <input 
                    type="text" 
                    value={pdvClientPhone}
                    onChange={(e) => setPdvClientPhone(e.target.value)}
                    placeholder="Ex: 5545999999999"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase block mb-1.5 font-bold tracking-widest">Nome do Cliente (Opcional):</label>
                  <input 
                    type="text" 
                    value={pdvClientName}
                    onChange={(e) => setPdvClientName(e.target.value)}
                    placeholder="Ex: Marcos Oliveira"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase block mb-1.5 font-bold tracking-widest">Total da Venda R$:</label>
                  <input 
                    type="number" 
                    value={pdvTotal}
                    onChange={(e) => setPdvTotal(e.target.value)}
                    placeholder="Valor total cobrado"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white font-black text-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase block mb-1.5 font-bold tracking-widest">Método de Cobrança:</label>
                  <select
                    value={pdvMethod}
                    onChange={(e) => setPdvMethod(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-zinc-400 font-semibold"
                  >
                    <option value="PIX">Pix Dinâmico</option>
                    <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                    <option value="CARTAO_DEBITO">Cartão de Débito</option>
                    <option value="PROMISSORIA">Crediário (Promissória)</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#d4af37] text-[#09090b] font-black text-xs py-3.5 rounded-lg hover:bg-amber-400 tracking-wider uppercase transition-colors"
              >
                Concluir Venda Presencial
              </button>
            </form>
          </div>

          {pdvSuccessMessage && (
            <div className="mt-4 text-xs font-bold text-green-500 flex items-center gap-1.5 bg-green-500/10 p-3 rounded-lg border border-green-500/20 justify-center">
              <Check className="w-4 h-4" /> {pdvSuccessMessage}
            </div>
          )}
        </div>

        {/* Curva ABC Stock giro list */}
        <div className="lg:col-span-5 bg-[#121214] border border-zinc-800 p-6 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-900">
              Curva ABC (Giro de Estoque)
            </h3>
            <div className="space-y-3.5">
              {ABC_PRODUCTS.map(prod => (
                <div key={prod.id} className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded border border-zinc-900">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-white truncate block">{prod.name}</span>
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold mt-0.5 block">Vendas: {prod.salesCount} | Estoque: {prod.stock}</span>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                    prod.status === 'CRÍTICO' 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                      : prod.status === 'ALERTA' 
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                        : 'bg-green-500/10 text-green-500 border-green-500/20'
                  }`}>
                    {prod.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest text-center mt-6">
            Relatório de Reposição Preventiva Automatizado
          </p>
        </div>

      </div>

      {/* Promissórias Inadimplência Red alert board */}
      <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-900">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-red-500 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 animate-bounce" /> Controle de Inadimplência ("No Fio")
            </h3>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mt-0.5">Acompanhamento e cobrança de crediários vencidos</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] font-semibold text-zinc-400">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-650 uppercase tracking-widest text-[8px] font-black">
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Débito total</th>
                <th className="pb-3">Data Vencimento</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {debtors.map(debtor => (
                <tr key={debtor.id} className="border-b border-zinc-900/60">
                  <td className="py-4 font-bold text-white">{debtor.name}</td>
                  <td className="py-4 font-bold text-[#d4af37]">R$ {debtor.amount.toFixed(2)}</td>
                  <td className="py-4 font-medium">{debtor.dueDate}</td>
                  <td className="py-4 text-center">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                      debtor.isOverdue 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                        : 'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}>
                      {debtor.isOverdue ? 'Atrasado' : 'No Prazo'}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <a 
                      href={getWhatsAppBillingLink(debtor)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-zinc-950 border border-zinc-800 hover:border-[#d4af37] text-zinc-400 hover:text-[#d4af37] px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors inline-block"
                    >
                      Cobrar WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
