'use client';

import React, { useState } from 'react';
import { 
  User, Shield, TrendingUp, AlertTriangle, 
  Package, Check, MessageSquare 
} from 'lucide-react';

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
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Nike Air Jordan 1 High Gold', brand: 'Nike Jordan', stock: 5 },
  { id: '2', name: 'Supreme Box Logo Hoodie', brand: 'Supreme', stock: 3 },
  { id: '3', name: 'Yeezy Boost 350 Luxury', brand: 'Adidas', stock: 8 },
  { id: '4', name: 'PR Store Classic Necklace', brand: 'PR Store', stock: 12 },
  { id: '5', name: 'Off-White Industrial Belt Gold Edition', brand: 'Off-White', stock: 2 }
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

export default function AdminDashboard() {
  const [role, setRole] = useState<'DONO' | 'FUNCIONARIO'>('DONO');
  
  // Dashboard states
  const [expenses, setExpenses] = useState<{description: string, val: number}[]>([
    { description: 'Aluguel do Espaço Físico', val: 3500.00 },
    { description: 'Energia Elétrica Comercial', val: 780.00 },
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

  // Add Expense handler
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expDescription && expValue) {
      setExpenses(prev => [...prev, { description: expDescription, val: parseFloat(expValue) }]);
      setExpDescription('');
      setExpValue('');
    }
  };

  // PDV Sale Registry
  const handlePdvSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdvClientPhone || !pdvTotal) return;

    const totalVal = parseFloat(pdvTotal);

    // If sale is on Promissória ("No Fio"), add to debtors list
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
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-xs font-bold uppercase text-zinc-400">Simulação de Níveis de Acesso (RBAC)</h3>
            <p className="text-[10px] text-zinc-500">Mude o papel abaixo para testar as permissões e telas do ERP.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => setRole('DONO')}
            className={`px-3 py-1.5 rounded text-[10px] font-extrabold uppercase transition-all flex items-center gap-1.5 ${
              role === 'DONO' 
                ? 'bg-amber-500 text-[#09090b]' 
                : 'text-zinc-400 hover:text-[#f4f4f5]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Dono / Gerente
          </button>
          <button
            onClick={() => setRole('FUNCIONARIO')}
            className={`px-3 py-1.5 rounded text-[10px] font-extrabold uppercase transition-all flex items-center gap-1.5 ${
              role === 'FUNCIONARIO' 
                ? 'bg-amber-500 text-[#09090b]' 
                : 'text-zinc-400 hover:text-[#f4f4f5]'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Funcionário
          </button>
        </div>
      </div>

      {/* RENDER FOR DONO / GERENTE (FULL FINANCIAL METRICS) */}
      {role === 'DONO' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Financial Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                Faturamento Consolidado
              </span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-amber-500">R$ {faturamentoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="text-[9px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                  +12.4%
                </span>
              </div>
            </div>
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                Despesas Registradas
              </span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-zinc-300">
                  R$ {expenses.reduce((acc, exp) => acc + exp.val, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                Meta Mensal Comercial
              </span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-[#f4f4f5]">R$ {metaFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Goal Progress bar component */}
          <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold uppercase text-zinc-400">Progresso de Metas de Faturamento</h4>
              <span className="text-xs font-black text-amber-500">{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden border border-zinc-900">
              <div 
                className="bg-gradient-to-r from-amber-400 to-yellow-600 h-full rounded-full transition-all" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Charts, Expenses and Closed Drawer check */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Custom High Density Bar Chart (DIA, MES, ANO) */}
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-500" /> Histórico de Vendas
                </h4>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 bg-zinc-950 px-2 py-1 border border-zinc-900 rounded">
                  <span>DIA</span>
                  <span className="text-amber-500">MÊS</span>
                  <span>ANO</span>
                </div>
              </div>
              
              {/* High Density Bar visualization */}
              <div className="h-48 flex items-end justify-between gap-4 pt-6 border-b border-zinc-800/80 px-2">
                {[
                  { month: 'Jan', val: 78000 },
                  { month: 'Fev', val: 85000 },
                  { month: 'Mar', val: 92000 },
                  { month: 'Abr', val: 104000 },
                  { month: 'Mai', val: 99000 },
                  { month: 'Jun', val: 104590 }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    {/* Tooltip value */}
                    <span className="text-[9px] font-bold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity -mt-6">
                      R$ {Math.round(item.val/1000)}k
                    </span>
                    {/* Visual Bar */}
                    <div 
                      className="w-full bg-gradient-to-t from-yellow-600 to-amber-400 rounded-t group-hover:from-amber-400 group-hover:to-yellow-500 transition-all cursor-pointer"
                      style={{ height: `${(item.val / metaFaturamento) * 120}px` }}
                    />
                    <span className="text-[10px] text-zinc-500 font-semibold mt-1 block">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses launcher form */}
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase text-zinc-400 mb-4 pb-2 border-b border-zinc-900">
                  Lançamento de Gastos / Custos
                </h4>
                <form onSubmit={handleAddExpense} className="space-y-3">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Descrição da Despesa"
                      value={expDescription}
                      onChange={(e) => setExpDescription(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <input 
                      type="number" 
                      placeholder="Valor (R$)"
                      value={expValue}
                      onChange={(e) => setExpValue(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-zinc-800 border border-zinc-700 hover:border-amber-500 hover:text-amber-500 text-xs font-bold py-2 rounded-lg transition-colors"
                  >
                    Lançar Custo
                  </button>
                </form>
              </div>

              {/* Expense list */}
              <div className="mt-4 max-h-24 overflow-y-auto space-y-1.5 border-t border-zinc-900 pt-3">
                {expenses.map((exp, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] text-zinc-400">
                    <span className="truncate max-w-[150px]">{exp.description}</span>
                    <span className="font-bold text-red-500">- R$ {exp.val.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Promissória Debtors Inadimplência Panel (ALERT RED SYSTEM) */}
          <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl">
            <h4 className="text-xs font-bold uppercase text-zinc-400 mb-6 pb-2 border-b border-zinc-900 flex items-center gap-1.5">
              <AlertTriangle className="text-red-500 w-4 h-4" /> Alerta de Inadimplência (Crediário Próprio)
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Cliente</th>
                    <th className="pb-3">Valor Devido</th>
                    <th className="pb-3">Vencimento</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Cobrança WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {debtors.map(debtor => (
                    <tr key={debtor.id} className="hover:bg-zinc-900/20">
                      <td className="py-4 font-bold">{debtor.name}</td>
                      <td className="py-4 font-extrabold text-amber-500">R$ {debtor.amount.toFixed(2)}</td>
                      <td className="py-4 text-zinc-400">{debtor.dueDate}</td>
                      <td className="py-4 text-center">
                        {debtor.isOverdue ? (
                          <span className="inline-block px-2.5 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-500 text-[9px] font-black uppercase">
                            Atrasado
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-500 text-[9px] font-bold uppercase">
                            No Prazo
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <a
                          href={getWhatsAppBillingLink(debtor)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 hover:border-green-500/30 hover:bg-green-600 hover:text-[#09090b] text-[10px] font-bold transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Cobrar Cliente
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Curva ABC Report */}
          <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl">
            <h4 className="text-xs font-bold uppercase text-zinc-400 mb-6 pb-2 border-b border-zinc-900 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-500" /> Relatório Curva ABC (Giro de Estoque)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {ABC_PRODUCTS.map(p => (
                <div key={p.id} className="bg-zinc-900/40 p-4 border border-zinc-800/80 rounded-xl relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-amber-500 tracking-wider">CURVA A</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                        p.status === 'CRÍTICO' 
                          ? 'border-red-500/20 bg-red-500/10 text-red-500' 
                          : p.status === 'ALERTA' 
                          ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-500' 
                          : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold truncate pr-6">{p.name}</h5>
                    <div className="mt-3 text-[10px] text-zinc-500 space-y-1">
                      <div>Vendas: <span className="font-extrabold text-zinc-300">{p.salesCount} un</span></div>
                      <div>Estoque Atual: <span className="font-extrabold text-zinc-300">{p.stock} un</span></div>
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-t border-zinc-800/80 text-[10px] font-bold text-amber-500">
                    Faturado: R$ {p.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RENDER FOR EMPLOYEE / FUNCIONÁRIO (PDV ONLY ACCESS) */}
      {(role === 'FUNCIONARIO' || role === 'DONO') && (
        <div className={`space-y-8 ${role === 'FUNCIONARIO' ? 'animate-fadeIn' : ''}`}>
          
          {role === 'FUNCIONARIO' && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-xs text-amber-500">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-bold block mb-0.5">Perfil Limitado (Frente de Caixa / Consulta)</span>
                Você está logado como funcionário. Métricas, faturamentos consolidados e gráficos financeiros estão ocultos e protegidos no servidor.
              </div>
            </div>
          )}

          {/* Interactive PDV Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Front Desk PDV Registry form */}
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl lg:col-span-2">
              <h4 className="text-xs font-bold uppercase text-zinc-400 mb-6 pb-2 border-b border-zinc-900">
                Frente de Caixa (PDV Presencial)
              </h4>

              {pdvSuccessMessage && (
                <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-xs text-green-500 flex items-center gap-2">
                  <Check className="w-4 h-4" /> {pdvSuccessMessage}
                </div>
              )}

              <form onSubmit={handlePdvSale} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Celular / Identificador:</label>
                  <input 
                    type="text" 
                    placeholder="WhatsApp (ex: 45999887766)"
                    value={pdvClientPhone}
                    onChange={(e) => setPdvClientPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Nome do Cliente (Opcional):</label>
                  <input 
                    type="text" 
                    placeholder="Nome completo"
                    value={pdvClientName}
                    onChange={(e) => setPdvClientName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Valor Cobrado (R$):</label>
                  <input 
                    type="number" 
                    placeholder="Total da Venda"
                    value={pdvTotal}
                    onChange={(e) => setPdvTotal(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Forma de Pagamento:</label>
                  <select
                    value={pdvMethod}
                    onChange={(e) => setPdvMethod(e.target.value as 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PROMISSORIA')}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="PIX">Pix Dinâmico</option>
                    <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                    <option value="CARTAO_DEBITO">Cartão de Débito</option>
                    <option value="PROMISSORIA">Promissória (&quot;No Fio&quot;)</option>
                  </select>
                </div>

                <div className="md:col-span-2 pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-amber-500 text-[#09090b] font-black text-xs py-3 rounded-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10"
                  >
                    Lançar e Sincronizar Venda
                  </button>
                </div>
              </form>
            </div>

            {/* Cash Balance drawer closing checklist */}
            <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase text-zinc-400 mb-4 pb-2 border-b border-zinc-900">
                  Conciliação de Fechamento de Caixa
                </h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed mb-4">
                  Conciliação diária de entradas financeiras presenciais e online. Marque os itens para atestar que o caixa bateu no fim do dia.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="w-5 h-5 rounded border border-zinc-800 flex items-center justify-center bg-zinc-950 text-amber-500">
                      ✓
                    </span>
                    <span>Vendas digitais Stripe conciliadas</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="w-5 h-5 rounded border border-zinc-800 flex items-center justify-center bg-zinc-950 text-amber-500">
                      ✓
                    </span>
                    <span>Caixa Físico batido (dinheiro)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="w-5 h-5 rounded border border-zinc-800 flex items-center justify-center bg-zinc-950 text-amber-500">
                      ✓
                    </span>
                    <span>Promissórias da data verificadas</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-900 mt-6 flex justify-between items-center text-[10px] font-bold text-zinc-500">
                <span>Status do Dia:</span>
                <span className="text-amber-500 uppercase">Fechamento Pendente</span>
              </div>
            </div>

          </div>

          {/* Basic Inventory Consultation list */}
          <div className="bg-[#121214] border border-zinc-800 p-6 rounded-xl">
            <h4 className="text-xs font-bold uppercase text-zinc-400 mb-6 pb-2 border-b border-zinc-900">
              Consulta Rápida de Grade & Estoque
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {MOCK_PRODUCTS.map(product => (
                <div key={product.id} className="bg-zinc-900/30 p-4 border border-zinc-800/80 rounded-xl flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold truncate max-w-[180px]">{product.name}</h5>
                    <span className="text-[10px] text-zinc-500">{product.brand}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      product.stock > 3 ? 'bg-zinc-900 text-zinc-400 border border-zinc-800' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {product.stock} un
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
