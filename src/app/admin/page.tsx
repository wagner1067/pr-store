'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Shield, TrendingUp, AlertTriangle, 
  Package, Check, MessageSquare, Plus, Upload, 
  DollarSign, FileText, CheckCircle2, ChevronRight,
  Sun, Moon, Users, Settings, ShoppingCart, CreditCard,
  Lock, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
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
  image: string;
  sizes: string[];
}

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Nike Air Jordan 1 High Gold', brand: 'Nike Jordan', stock: 5, price: 1899.90, category: 'Tenis', image: '👟', sizes: ['40', '41', '42'] },
  { id: '2', name: 'Supreme Box Logo Hoodie', brand: 'Supreme', stock: 3, price: 1499.90, category: 'Roupas', image: '👕', sizes: ['M', 'G'] },
  { id: '3', name: 'Yeezy Boost 350 Luxury', brand: 'Adidas', stock: 8, price: 1699.90, category: 'Tenis', image: '👟', sizes: ['39', '40', '41'] },
  { id: '4', name: 'PR Store Classic Necklace', brand: 'PR Store', stock: 12, price: 499.90, category: 'Acessorios', image: '💎', sizes: ['Unico'] },
  { id: '5', name: 'Off-White Industrial Belt Gold Edition', brand: 'Off-White', stock: 2, price: 799.90, category: 'Acessorios', image: '🎗️', sizes: ['Unico'] }
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

const PHOTO_GALLERY = [
  { id: '👟', label: 'Tênis Streetwear Gold' },
  { id: '👕', label: 'Hoodie Bogo Black' },
  { id: '💎', label: 'Colar Crown Gold' },
  { id: '🎗️', label: 'Cinto Off-White Gold' },
  { id: '🎒', label: 'Acessório Street Bag' }
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Tab control state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'produtos' | 'promissorias' | 'clientes' | 'vendas' | 'contas' | 'configuracoes'>('dashboard');

  // Auth lock screen states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState('');

  // Business states
  const [role, setRole] = useState<'DONO' | 'FUNCIONARIO'>('DONO');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [debtors, setDebtors] = useState<Debtor[]>(INITIAL_DEBTORS);
  const [sales, setSales] = useState<{id: string, client: string, phone: string, total: number, method: string, date: string}[]>([
    { id: '1', client: 'Marcos Oliveira', phone: '5545999887766', total: 890.00, method: 'PROMISSORIA', date: '2026-06-16' },
    { id: '2', client: 'Júlio Silva', phone: '5545999223344', total: 450.00, method: 'PIX', date: '2026-06-15' }
  ]);
  const [clients, setClients] = useState<{name: string, phone: string, date: string}[]>([
    { name: 'Marcos Oliveira', phone: '5545999887766', date: '2026-06-12' },
    { name: 'Ana Beatriz Souza', phone: '5545999554433', date: '2026-06-10' },
    { name: 'Lucas Pinheiro', phone: '5545999112233', date: '2026-06-08' }
  ]);
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

  // Ficha de Produto States
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodCategory, setProdCategory] = useState('Tenis');
  const [prodBrand, setProdBrand] = useState('');
  const [selectedImage, setSelectedImage] = useState('👟');
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [prodSizes, setProdSizes] = useState<string>('39, 40, 41');
  const [productFormSuccess, setProductFormSuccess] = useState(false);

  // Promissória Debtor states
  const [newDebtorName, setNewDebtorName] = useState('');
  const [newDebtorPhone, setNewDebtorPhone] = useState('');
  const [newDebtorAmount, setNewDebtorAmount] = useState('');
  const [newDebtorDate, setNewDebtorDate] = useState('');

  // Cash closure
  const [cashBalanceValue, setCashBalanceValue] = useState('');
  const [cashBalancedMessage, setCashBalancedMessage] = useState('');

  // Metas state
  const metaFaturamento = 150000.00;
  const faturamentoAtual = 104590.20 + sales.reduce((acc, s) => acc + s.total, 0);
  const progressPercent = Math.min((faturamentoAtual / metaFaturamento) * 100, 100);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth check helper
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeSent) {
      if (email.endsWith('@prstore.com') && password === 'admin') {
        setCodeSent(true);
        setAuthError('');
        alert('Código OTP enviado via Firebase SMS/E-mail de Teste: 123456');
      } else {
        setAuthError('Email Corporativo Inválido ou Senha de Funcionário Incorreta.');
      }
    } else {
      if (otpCode === '123456') {
        setIsAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError('Código OTP SMS incorreto ou expirado.');
      }
    }
  };

  // Add Expense handler
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expDescription && expValue) {
      setExpenses(prev => [...prev, { description: expDescription, val: parseFloat(expValue) }]);
      setExpDescription('');
      setExpValue('');
    }
  };

  // Product Registry handler (Ficha de Produto)
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prodName && prodPrice && prodStock) {
      const newProd: Product = {
        id: (products.length + 1).toString(),
        name: prodName,
        price: parseFloat(prodPrice),
        stock: parseInt(prodStock),
        category: prodCategory,
        brand: prodBrand || 'PR Store',
        image: selectedImage,
        sizes: prodSizes.split(',').map(s => s.trim())
      };

      setProducts(prev => [newProd, ...prev]);
      setProductFormSuccess(true);
      setTimeout(() => {
        setProductFormSuccess(false);
        setProdName('');
        setProdPrice('');
        setProdStock('');
        setProdBrand('');
        setProdSizes('39, 40, 41');
        setSelectedImage('👟');
      }, 1500);
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

    const newSale = {
      id: (sales.length + 1).toString(),
      client: pdvClientName || 'Cliente PDV Presencial',
      phone: pdvClientPhone,
      total: totalVal,
      method: pdvMethod,
      date: new Date().toISOString().split('T')[0]
    };
    setSales(prev => [newSale, ...prev]);

    // Check if client is in clients list, if not add
    if (!clients.some(c => c.phone === pdvClientPhone)) {
      setClients(prev => [{ name: pdvClientName || 'Cliente PDV Presencial', phone: pdvClientPhone, date: new Date().toISOString().split('T')[0] }, ...prev]);
    }

    setPdvSuccessMessage('Venda presencial registrada com sucesso no caixa do Supabase!');
    setPdvClientPhone('');
    setPdvClientName('');
    setPdvTotal('');
    
    setTimeout(() => {
      setPdvSuccessMessage('');
    }, 3000);
  };

  // Add Debtor Manual
  const handleAddDebtor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDebtorName && newDebtorPhone && newDebtorAmount && newDebtorDate) {
      const debtor: Debtor = {
        id: Math.random().toString(),
        name: newDebtorName,
        phone: newDebtorPhone,
        amount: parseFloat(newDebtorAmount),
        dueDate: newDebtorDate,
        isOverdue: new Date(newDebtorDate) < new Date()
      };
      setDebtors(prev => [...prev, debtor]);
      setNewDebtorName('');
      setNewDebtorPhone('');
      setNewDebtorAmount('');
      setNewDebtorDate('');
    }
  };

  // Discharge debtor
  const dischargeDebtor = (id: string) => {
    setDebtors(prev => prev.filter(d => d.id !== id));
  };

  // Cash balance closure
  const handleCashClosure = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashBalanceValue) {
      const val = parseFloat(cashBalanceValue);
      const consolidado = faturamentoAtual - expenses.reduce((acc, exp) => acc + exp.val, 0);
      if (Math.abs(val - consolidado) < 1) {
        setCashBalancedMessage('Fechamento Confirmado: O caixa bateu perfeitamente com as vendas online/físicas!');
      } else {
        setCashBalancedMessage(`Fechamento Inconsistente: Valor informado (R$ ${val.toFixed(2)}) diverge do faturamento líquido do ERP (R$ ${consolidado.toFixed(2)})!`);
      }
    }
  };

  // WhatsApp Billing Link Generator
  const getWhatsAppBillingLink = (debtor: Debtor) => {
    const text = `Olá, ${debtor.name}. Passando para lembrar sobre a sua promissória em aberto na PR Store no valor de R$ ${debtor.amount.toFixed(2)}, com vencimento em ${debtor.dueDate}. Agradecemos a preferência!`;
    return `https://wa.me/${debtor.phone}?text=${encodeURIComponent(text)}`;
  };

  // Lock screen view if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${
        isDarkMode ? 'bg-[#09090b]' : 'bg-zinc-50'
      }`}>
        <div className={`border p-8 rounded-xl max-w-sm w-full relative shadow-2xl transition-colors ${
          isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-white border-zinc-200'
        }`}>
          {/* Logo Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative bg-gradient-to-r from-amber-400 to-[#d4af37] w-14 h-14 rounded-xl flex items-center justify-center shadow-lg shadow-[#d4af37]/15">
              <span className="text-3xl font-serif font-black text-[#09090b]">PR</span>
              <span className="absolute -top-1.5 -right-1.5 text-xl rotate-[15deg]">👑</span>
            </div>
            <h2 className={`text-xl font-black uppercase tracking-wider mt-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>PR Store ERP</h2>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block mt-0.5">Acesso de Funcionários</span>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!codeSent ? (
              <>
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase block mb-1 font-bold tracking-widest">E-mail Corporativo:</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: wagner@prstore.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase block mb-1 font-bold tracking-widest">Senha:</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white"
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="text-[9px] text-zinc-500 uppercase block mb-1 font-bold tracking-widest">Código 2FA OTP (SMS):</label>
                <input 
                  type="text" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Código de 6 dígitos"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white tracking-widest text-center font-black"
                  maxLength={6}
                  required
                />
              </div>
            )}

            {authError && (
              <span className="text-[10px] font-bold text-red-500 block text-center bg-red-500/10 p-2 rounded border border-red-500/25">
                {authError}
              </span>
            )}

            <button 
              type="submit"
              className="w-full bg-[#d4af37] text-[#09090b] font-black text-xs py-3 rounded-lg hover:bg-amber-400 tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-[#d4af37]/10"
            >
              <Lock className="w-3.5 h-3.5" />
              {codeSent ? 'Confirmar Acesso' : 'Enviar Código OTP'}
            </button>
          </form>

          {codeSent && (
            <button 
              onClick={() => setCodeSent(false)}
              className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white mt-4 block mx-auto text-center"
            >
              Voltar para login
            </button>
          )}

          <div className="mt-8 text-center">
            <Link href="/" className="text-zinc-500 hover:text-[#d4af37] text-[10px] font-bold uppercase tracking-wider transition-colors">
              Voltar para Loja E-commerce
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-[#09090b] text-[#f4f4f5]' : 'bg-white text-zinc-900'
    }`}>
      
      {/* Top Header Banner */}
      <header className={`border-b transition-colors px-6 py-4 flex items-center justify-between ${
        isDarkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative bg-gradient-to-r from-amber-400 to-[#d4af37] w-10 h-10 rounded-lg flex items-center justify-center">
            <span className="text-xl font-serif font-black text-[#09090b]">PR</span>
            <span className="absolute -top-1 -right-1 text-sm rotate-[15deg]">👑</span>
          </div>
          <div>
            <span className="text-sm font-black tracking-widest uppercase block">PR Store ERP</span>
            <span className="text-[9px] text-[#d4af37] tracking-widest font-semibold uppercase block -mt-1">Administrativo & Financeiro</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme switcher */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={`p-2 rounded-full border transition-colors ${
              isDarkMode ? 'border-zinc-800 text-[#d4af37] hover:bg-zinc-900' : 'border-zinc-200 text-amber-600 hover:bg-zinc-100'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link 
            href="/" 
            className={`text-xs font-black uppercase border rounded-lg px-4 py-2 transition-all flex items-center gap-1.5 ${
              isDarkMode ? 'border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-[#d4af37]' : 'border-zinc-200 bg-zinc-50 text-zinc-650 hover:text-amber-600'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Loja
          </Link>
        </div>
      </header>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Navigation Sidebar */}
        <aside className={`w-full lg:w-64 border-b lg:border-b-0 lg:border-r p-6 flex flex-col justify-between transition-colors ${
          isDarkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="space-y-6">
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Menu Corporativo</span>
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                  activeTab === 'dashboard'
                    ? 'bg-zinc-900 border border-zinc-800 text-[#d4af37]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Painel Geral
              </button>
              <button
                onClick={() => setActiveTab('produtos')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                  activeTab === 'produtos'
                    ? 'bg-zinc-900 border border-zinc-800 text-[#d4af37]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <Package className="w-4 h-4" /> Produtos
              </button>
              <button
                onClick={() => setActiveTab('promissorias')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                  activeTab === 'promissorias'
                    ? 'bg-zinc-900 border border-zinc-800 text-[#d4af37]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <AlertTriangle className="w-4 h-4" /> Promissórias
              </button>
              <button
                onClick={() => setActiveTab('clientes')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                  activeTab === 'clientes'
                    ? 'bg-zinc-900 border border-zinc-800 text-[#d4af37]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <Users className="w-4 h-4" /> Clientes
              </button>
              <button
                onClick={() => setActiveTab('vendas')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                  activeTab === 'vendas'
                    ? 'bg-zinc-900 border border-zinc-800 text-[#d4af37]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <ShoppingCart className="w-4 h-4" /> Vendas (PDV)
              </button>
              <button
                onClick={() => setActiveTab('contas')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                  activeTab === 'contas'
                    ? 'bg-zinc-900 border border-zinc-800 text-[#d4af37]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Contas & Caixa
              </button>
              <button
                onClick={() => setActiveTab('configuracoes')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                  activeTab === 'configuracoes'
                    ? 'bg-zinc-900 border border-zinc-800 text-[#d4af37]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <Settings className="w-4 h-4" /> Configurações
              </button>
            </nav>
          </div>

          <div className="pt-6 border-t border-zinc-900/50 text-[10px] text-zinc-650 font-extrabold uppercase tracking-widest">
            Supabase Connection: <span className="text-green-500">Active</span>
          </div>
        </aside>

        {/* Dynamic page container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && role === 'DONO' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Composed chart card */}
              <div className={`border rounded-xl p-6 shadow-2xl ${
                isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-900/40">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-wider">Análise de Desempenho</h2>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mt-0.5">Visão analítica de faturamento e fluxo de caixa</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-850 text-[9px] font-black uppercase tracking-wider">
                    <button className="px-2.5 py-1 rounded bg-[#d4af37] text-[#09090b] font-black">Mensal</button>
                    <button className="px-2.5 py-1 rounded text-zinc-500 hover:text-white transition-colors">Semanal</button>
                    <button className="px-2.5 py-1 rounded text-zinc-500 hover:text-white transition-colors">Diário</button>
                  </div>
                </div>

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
                    <div className="w-full h-full bg-zinc-950/40 animate-pulse rounded-lg flex items-center justify-center text-zinc-650 text-xs">
                      Carregando Gráficos Analíticos...
                    </div>
                  )}
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`border p-6 rounded-xl flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Vendas Totais</span>
                    <span className="text-2xl font-black text-[#d4af37]">R$ 1.5M</span>
                  </div>
                  <span className="text-[9px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 mt-4 self-start">
                    +18% Meta Comercial
                  </span>
                </div>
                <div className={`border p-6 rounded-xl flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Receita Líquida</span>
                    <span className="text-2xl font-black text-[#d4af37]">R$ 1.5M</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-semibold block mt-4">Faturamento Deduzido Custos</span>
                </div>
                <div className={`border p-6 rounded-xl flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Média do Carrinho</span>
                    <span className="text-2xl font-black text-white">R$ 330k</span>
                  </div>
                  <span className="text-[9px] text-[#d4af37] font-semibold block mt-4">Ticket Médio de Venda</span>
                </div>
                {/* Horizontal Category Distribution */}
                <div className={`border p-6 rounded-xl flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
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

              {/* Progress and meta bar */}
              <div className={`border p-6 rounded-xl ${
                isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-zinc-900/40">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Progresso Metas Mensais</h3>
                  <span className="text-xs font-black text-[#d4af37]">{progressPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-950 border border-zinc-900 rounded-full h-3 overflow-hidden mb-4 mt-2">
                  <div className="bg-[#d4af37] h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500">
                  <span>Faturamento Atual: R$ {faturamentoAtual.toLocaleString('pt-BR')}</span>
                  <span>Objetivo Mensal: R$ {metaFaturamento.toLocaleString('pt-BR')}</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRODUTOS (Ficha de Produto e Lista) */}
          {activeTab === 'produtos' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ficha de Produto */}
                <div className={`border p-6 rounded-xl ${
                  isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-900/60">
                    Cadastrar Produto (Ficha de Produto)
                  </h3>
                  <form onSubmit={handleProductSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Simulated Upload Picker triggering modal */}
                    <div 
                      onClick={() => setIsImagePickerOpen(true)}
                      className="border-2 border-dashed border-zinc-800 hover:border-[#d4af37]/45 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-zinc-950/60 transition-colors cursor-pointer aspect-video sm:aspect-auto"
                    >
                      <Upload className="w-8 h-8 text-[#d4af37] mb-2" />
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">Selecionar Foto</span>
                      <span className="text-[12px] font-bold text-[#d4af37] mt-1 block">Preview: {selectedImage}</span>
                    </div>

                    <div className="space-y-3">
                      <input 
                        type="text" 
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="Nome do Produto"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="number" 
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          placeholder="Preço R$"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white"
                          required
                        />
                        <input 
                          type="number" 
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value)}
                          placeholder="Estoque"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={prodCategory}
                          onChange={(e) => setProdCategory(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-zinc-400 font-bold"
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
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] text-zinc-500 uppercase block mb-1 font-bold">Grade de tamanhos separados por vírgula:</label>
                        <input 
                          type="text" 
                          value={prodSizes}
                          onChange={(e) => setProdSizes(e.target.value)}
                          placeholder="Ex: 39, 40, 41"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white"
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
                    <div className="mt-3 text-[10px] font-bold text-green-500 flex items-center gap-1 bg-green-500/10 p-2.5 rounded-lg border border-green-500/20 justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Produto registrado e indexado com sucesso no Supabase!
                    </div>
                  )}
                </div>

                {/* Photo Picker Modal */}
                {isImagePickerOpen && (
                  <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6 max-w-sm w-full relative shadow-2xl text-center">
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4">Selecione uma Imagem do Catálogo</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {PHOTO_GALLERY.map(item => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSelectedImage(item.id);
                              setIsImagePickerOpen(false);
                            }}
                            className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2"
                          >
                            <span className="text-2xl">{item.id}</span>
                            <span className="text-[7.5px] font-bold uppercase text-zinc-500 block">{item.label}</span>
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setIsImagePickerOpen(false)}
                        className="mt-6 text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-wider"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                )}

                {/* Stock Giro Stats */}
                <div className={`border p-6 rounded-xl flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-900/60">
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
                </div>
              </div>

              {/* Products List Grid */}
              <div className={`border p-6 rounded-xl ${
                isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-900/60">Estoque Geral de Produtos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {products.map(p => (
                    <div key={p.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex items-center gap-4">
                      <span className="text-3xl">{p.image}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[8px] text-[#d4af37] font-black uppercase tracking-widest block">{p.brand}</span>
                        <h4 className="text-xs font-bold text-[#f4f4f5] truncate">{p.name}</h4>
                        <span className="text-[10px] font-black text-[#d4af37] block mt-0.5">R$ {p.price.toFixed(2)}</span>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-850 px-2 py-1.5 rounded-lg text-center">
                        <span className="text-[8px] text-zinc-500 uppercase block font-bold">Estoque</span>
                        <span className="text-xs font-black text-white">{p.stock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PROMISSÓRIAS (Crediário Board) */}
          {activeTab === 'promissorias' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Outstanding debtors list */}
                <div className={`lg:col-span-8 border p-6 rounded-xl shadow-2xl ${
                  isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-wider text-red-500 mb-4 pb-2 border-b border-zinc-900/60 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 animate-pulse" /> Controle de Inadimplência ("No Fio")
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] font-semibold text-zinc-400">
                      <thead>
                        <tr className="border-b border-zinc-900 text-zinc-650 uppercase tracking-widest text-[8px] font-black">
                          <th className="pb-3">Cliente</th>
                          <th className="pb-3">Débito Total</th>
                          <th className="pb-3">Data Limite</th>
                          <th className="pb-3 text-center">Status</th>
                          <th className="pb-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debtors.map(debtor => (
                          <tr key={debtor.id} className="border-b border-zinc-900/40">
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
                            <td className="py-4 text-right flex justify-end gap-2">
                              <button 
                                onClick={() => dischargeDebtor(debtor.id)}
                                className="bg-[#d4af37] text-[#09090b] px-3 py-1.5 rounded text-[8px] font-black uppercase tracking-wider hover:bg-amber-400 transition-colors"
                              >
                                Baixar
                              </button>
                              <a 
                                href={getWhatsAppBillingLink(debtor)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-zinc-950 border border-zinc-850 hover:border-[#d4af37] text-zinc-400 hover:text-[#d4af37] px-3.5 py-1.5 rounded text-[8px] font-black uppercase tracking-wider transition-colors inline-block"
                              >
                                Cobrar
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add new debtor */}
                <div className={`lg:col-span-4 border p-6 rounded-xl ${
                  isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-900/60">Lançar Novo Crediário</h3>
                  <form onSubmit={handleAddDebtor} className="space-y-3">
                    <div>
                      <label className="text-[8px] text-zinc-500 uppercase block mb-1 font-bold">Cliente:</label>
                      <input 
                        type="text" 
                        value={newDebtorName}
                        onChange={(e) => setNewDebtorName(e.target.value)}
                        placeholder="Nome do Cliente"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-zinc-500 uppercase block mb-1 font-bold">Telefone (SMS/WhatsApp):</label>
                      <input 
                        type="text" 
                        value={newDebtorPhone}
                        onChange={(e) => setNewDebtorPhone(e.target.value)}
                        placeholder="5545999999999"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-zinc-500 uppercase block mb-1 font-bold">Valor da Dívida R$:</label>
                      <input 
                        type="number" 
                        value={newDebtorAmount}
                        onChange={(e) => setNewDebtorAmount(e.target.value)}
                        placeholder="Ex: 500"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-zinc-500 uppercase block mb-1 font-bold">Vencimento:</label>
                      <input 
                        type="date" 
                        value={newDebtorDate}
                        onChange={(e) => setNewDebtorDate(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-zinc-400 font-bold"
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-zinc-850 hover:bg-[#d4af37] hover:text-[#09090b] text-zinc-300 font-black text-[9px] py-2.5 rounded-lg border border-zinc-800 uppercase tracking-widest transition-colors"
                    >
                      Registrar Promissória
                    </button>
                  </form>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: CLIENTES (Captured leads list) */}
          {activeTab === 'clientes' && (
            <div className={`border p-6 rounded-xl shadow-2xl animate-fadeIn ${
              isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-900/60">
                Lista de Clientes & Leads do E-commerce
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] font-semibold text-zinc-400">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-650 uppercase tracking-widest text-[8px] font-black">
                      <th className="pb-3">Nome / Identificação</th>
                      <th className="pb-3">WhatsApp / Telefone</th>
                      <th className="pb-3">Data de Cadastro</th>
                      <th className="pb-3 text-right">Status do Lead</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client, idx) => (
                      <tr key={idx} className="border-b border-zinc-900/40">
                        <td className="py-4 font-bold text-white">{client.name}</td>
                        <td className="py-4 font-bold text-[#d4af37]">{client.phone}</td>
                        <td className="py-4 font-medium">{client.date}</td>
                        <td className="py-4 text-right">
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20">
                            Membro Premium
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: VENDAS / PDV */}
          {activeTab === 'vendas' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* PDV Form */}
                <div className={`lg:col-span-6 border p-6 rounded-xl shadow-lg flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#d4af37] mb-4 pb-2 border-b border-zinc-900/60 flex items-center justify-between">
                      <span>Frente de Caixa (PDV Presencial)</span>
                      <span className="text-[8px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-widest animate-pulse">Caixa Aberto</span>
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

                {/* Presencial Sales List */}
                <div className={`lg:col-span-6 border p-6 rounded-xl shadow-lg flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-900/60">
                      Registro de Vendas Presenciais
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {sales.map((sale, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded border border-zinc-900">
                          <div>
                            <span className="text-[10px] font-bold text-white block">{sale.client}</span>
                            <span className="text-[8px] text-zinc-500 font-bold block">{sale.phone}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-black text-[#d4af37] block">R$ {sale.total.toFixed(2)}</span>
                            <span className="text-[7px] text-zinc-600 block">{sale.method} - {sale.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: CONTAS & CAIXA */}
          {activeTab === 'contas' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Cash cierre */}
                <div className={`lg:col-span-6 border p-6 rounded-xl shadow-lg ${
                  isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-900/60">
                    Conciliação e Fechamento de Caixa Diário
                  </h3>
                  <form onSubmit={handleCashClosure} className="space-y-4">
                    <div>
                      <label className="text-[9px] text-zinc-500 uppercase block mb-1.5 font-bold tracking-widest">Informar Valor Físico em Caixa R$:</label>
                      <input 
                        type="number" 
                        value={cashBalanceValue}
                        onChange={(e) => setCashBalanceValue(e.target.value)}
                        placeholder="Contagem física do caixa"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white font-black"
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-[#d4af37] text-[#09090b] font-black text-xs py-3 rounded-lg hover:bg-amber-400 tracking-wider uppercase transition-colors"
                    >
                      Bater Caixa
                    </button>
                  </form>
                  {cashBalancedMessage && (
                    <div className="mt-4 text-xs font-bold text-green-500 flex items-center gap-1.5 bg-green-500/10 p-3 rounded-lg border border-green-500/20 justify-center">
                      <CheckCircle2 className="w-4 h-4" /> {cashBalancedMessage}
                    </div>
                  )}
                </div>

                {/* Expenses logger */}
                <div className={`lg:col-span-6 border p-6 rounded-xl ${
                  isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-900/60">
                    Lançar Despesa / Custo
                  </h3>
                  <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      value={expDescription}
                      onChange={(e) => setExpDescription(e.target.value)}
                      placeholder="Descrição da Despesa"
                      className="sm:col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white"
                      required
                    />
                    <input 
                      type="number" 
                      value={expValue}
                      onChange={(e) => setExpValue(e.target.value)}
                      placeholder="Valor R$"
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none text-white"
                      required
                    />
                    <button 
                      type="submit"
                      className="sm:col-span-3 bg-zinc-850 hover:bg-[#d4af37] hover:text-[#09090b] text-zinc-300 font-black text-[10px] py-2 rounded-lg border border-zinc-800 uppercase tracking-widest transition-colors"
                    >
                      Registrar Custo
                    </button>
                  </form>

                  {/* Expenses list */}
                  <div className="mt-4 space-y-2 max-h-36 overflow-y-auto pr-1">
                    {expenses.map((exp, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] font-semibold text-zinc-500 bg-zinc-950/40 p-2b rounded border border-zinc-900/60 p-2">
                        <span>{exp.description}</span>
                        <span className="text-red-500 font-bold">- R$ {exp.val.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: CONFIGURAÇÕES (Employees and RLS info) */}
          {activeTab === 'configuracoes' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className={`border p-6 rounded-xl shadow-2xl ${
                isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-zinc-900/60">
                  Gestão de Funcionários & Permissões (RBAC)
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
                        <td className="py-3 font-bold text-white">Wagner Lima (Dono)</td>
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
                        <td className="py-3 font-bold text-white">Larissa Souza (Funcionário)</td>
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
          )}

        </main>
      </div>

    </div>
  );
}
