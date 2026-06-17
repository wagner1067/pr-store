'use client';

import React, { useState, useEffect } from 'react';
import { 
  Filter, Clock, Sparkles, Phone, ShoppingCart, 
  Trash2, X, Send, HelpCircle, ArrowRight, CheckCircle2,
  Sun, Moon, Search, ShoppingBag
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  promoPrice?: number;
  category: string;
  brand: string;
  sizes: string[];
  images: string[];
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Nike Air Jordan 1 Retro High Gold',
    slug: 'jordan-1-gold',
    price: 1899.90,
    promoPrice: 1599.90,
    category: 'Tenis',
    brand: 'Nike Jordan',
    sizes: ['40', '41', '42', '43'],
    images: ['#jordan'],
    stock: 5,
  },
  {
    id: '2',
    name: 'Supreme Box Logo Hoodie Black/Gold',
    slug: 'supreme-bogo-gold',
    price: 1499.90,
    category: 'Roupas',
    brand: 'Supreme',
    sizes: ['M', 'G', 'GG'],
    images: ['#hoodie'],
    stock: 3,
  },
  {
    id: '3',
    name: 'Yeezy Boost 350 V2 Luxury Accent',
    slug: 'yeezy-350-luxury',
    price: 1699.90,
    promoPrice: 1399.90,
    category: 'Tenis',
    brand: 'Adidas',
    sizes: ['38', '39', '40', '41'],
    images: ['#yeezy'],
    stock: 8,
  },
  {
    id: '4',
    name: 'PR Store Classic Crown Gold Necklace',
    slug: 'pr-crown-gold-necklace',
    price: 499.90,
    category: 'Acessorios',
    brand: 'PR Store',
    sizes: ['Unico'],
    images: ['#necklace'],
    stock: 12,
  },
  {
    id: '5',
    name: 'Off-White Industrial Belt Gold Edition',
    slug: 'off-white-industrial-gold',
    price: 799.90,
    category: 'Acessorios',
    brand: 'Off-White',
    sizes: ['Unico'],
    images: ['#belt'],
    stock: 2,
  }
];

const TRANSLATIONS = {
  pt: {
    heroTitle: "Promoção Relâmpago",
    heroSubtitle: "Coleção Streetwear",
    heroDesc: "Consiga itens selecionados e importados da marca oficial com o estoque físico sincronizado direto em tempo real.",
    shopNow: "Comprar Agora",
    categoriesTitle: "Categorias",
    categoriesSub: "Pesquisar roupas e acessórios",
    showcaseTitle: "Vitrine Streetwear",
    showcaseSub: "itens encontrados",
    filters: "Filtros",
    cartTitle: "Sacola de Compras",
    cartEmpty: "Sacola vazia. Adicione itens da vitrine.",
    shippingLabel: "Cálculo de Envio (CEP):",
    subtotal: "Subtotal:",
    checkoutBtn: "Finalizar Compra Segura",
    checkoutRedirecting: "Redirecionando...",
    leadTitle: "Membro PR Store",
    leadDesc: "Digite seu WhatsApp abaixo para receber novidades exclusivas e destravar um cupom de 10% de boas-vindas.",
    leadBtn: "Resgatar Cupom de Luxo",
    leadSuccess: "Membro Ativado! Seu cupom de 10% foi registrado.",
    sizeLabel: "Adicionar à Sacola:",
    chooseSize: "Escolha o tamanho:",
    calcBtn: "Calcular"
  },
  en: {
    heroTitle: "Lightning Deal",
    heroSubtitle: "Streetwear Collection",
    heroDesc: "Get exclusive imported streetwear items with physical stock synchronized in real-time.",
    shopNow: "Shop Now",
    categoriesTitle: "Categories",
    categoriesSub: "Search apparel and accessories",
    showcaseTitle: "Streetwear Showcase",
    showcaseSub: "items found",
    filters: "Filters",
    cartTitle: "Shopping Bag",
    cartEmpty: "Bag is empty. Add items from the storefront.",
    shippingLabel: "Shipping Estimate (ZIP):",
    subtotal: "Subtotal:",
    checkoutBtn: "Secure Checkout",
    checkoutRedirecting: "Redirecting...",
    leadTitle: "PR Store Member",
    leadDesc: "Enter your WhatsApp below to receive exclusive news and unlock a 10% welcome coupon.",
    leadBtn: "Claim Luxury Coupon",
    leadSuccess: "Member Activated! Your 10% coupon has been registered.",
    sizeLabel: "Add to Bag:",
    chooseSize: "Choose size:",
    calcBtn: "Calculate"
  },
  es: {
    heroTitle: "Oferta Relámpago",
    heroSubtitle: "Colección Streetwear",
    heroDesc: "Obtenga prendas streetwear importadas exclusivas con stock físico sincronizado en tiempo real.",
    shopNow: "Comprar Ahora",
    categoriesTitle: "Categorías",
    categoriesSub: "Buscar ropa y accesorios",
    showcaseTitle: "Escaparate Streetwear",
    showcaseSub: "artículos encontrados",
    filters: "Filtros",
    cartTitle: "Bolsa de Compras",
    cartEmpty: "La bolsa está vacía. Añade artículos de la tienda.",
    shippingLabel: "Cálculo de Envío (Código Postal):",
    subtotal: "Total parcial:",
    checkoutBtn: "Finalizar Compra Segura",
    checkoutRedirecting: "Redireccionando...",
    leadTitle: "Miembro de PR Store",
    leadDesc: "Ingrese su WhatsApp a continuación para recibir noticias exclusivas y desbloquear un cupón de bienvenida de 10%.",
    leadBtn: "Canjear Cupón de Lujo",
    leadSuccess: "¡Miembro Activado! Su cupón de 10% ha sido registrado.",
    sizeLabel: "Añadir a la Bolsa:",
    chooseSize: "Elija el tamaño:",
    calcBtn: "Calcular"
  }
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState<'pt' | 'en' | 'es'>('pt');

  const t = TRANSLATIONS[language];

  const products = MOCK_PRODUCTS.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
    return true;
  });
  
  // Interactive Elements States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLeadOpen, setIsLeadOpen] = useState(false);
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Chat Widget States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{sender: 'user' | 'ai', text: string}[]>([
    { sender: 'ai', text: 'Olá! Sou o assistente de IA da PR Store. Tem dúvidas sobre tamanhos ou estoque?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Shipping Calculator States
  const [cepInput, setCepInput] = useState('');
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingMethod, setShippingMethod] = useState<string>('');
  
  // Promotion Countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 1, hours: 19, minutes: 23, seconds: 47 });

  // Load lead modal after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!localStorage.getItem('pr_lead_submitted')) {
        setIsLeadOpen(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer clock tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return { days: 1, hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Lead Submission
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leadPhone.length >= 10) {
      localStorage.setItem('pr_lead_submitted', 'true');
      setLeadSubmitted(true);
      setTimeout(() => {
        setIsLeadOpen(false);
      }, 2000);
    }
  };

  // Cart Interactions
  const addToCart = (product: Product, size: string) => {
    const existing = cart.find(item => item.product.id === product.id && item.selectedSize === size);
    if (existing) {
      setCart(cart.map(item => 
        (item.product.id === product.id && item.selectedSize === size) 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, selectedSize: size }]);
    }
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, size: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id && item.selectedSize === size) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (id: string, size: string) => {
    setCart(cart.filter(item => !(item.product.id === id && item.selectedSize === size)));
  };

  const getSubtotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.product.promoPrice || item.product.price;
      return acc + (price * item.quantity);
    }, 0);
  };

  const getCartTotalItems = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  // Mock Shipping Calculation
  const calculateShipping = () => {
    if (cepInput.length >= 8) {
      if (cepInput.startsWith('85')) {
        setShippingCost(15.00);
        setShippingMethod('Moto Frete Regional (Expresso)');
      } else {
        setShippingCost(29.90);
        setShippingMethod('Correios PAC Nacional');
      }
    }
  };

  // Stripe Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    try {
      const checkoutItems = cart.map(item => ({
        name: item.product.name,
        price: item.product.promoPrice || item.product.price,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          paymentMethod: 'CARD',
        }),
      });

      const data = await response.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert('Erro ao iniciar o checkout. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao iniciar o checkout.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // AI Chat Submission
  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let reply = 'Interessante! Nossos tênis da Nike e Adidas estão com alta procura. Você pode conferir os tamanhos na vitrine.';
      if (userMsg.toLowerCase().includes('tamanho') || userMsg.toLowerCase().includes('grade')) {
        reply = 'Oferecemos grades do 38 ao 43 para calçados e M ao GG para vestuários. As numerações estão atualizadas no banco de dados.';
      } else if (userMsg.toLowerCase().includes('estoque') || userMsg.toLowerCase().includes('disponivel')) {
        reply = 'Todos os produtos exibidos na tela estão com estoque físico sincronizado no nosso ERP.';
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 1000);
  };

  // Render vector placeholders for luxury streetwear catalog items
  const renderProductImage = (imageId: string) => {
    switch (imageId) {
      case '#jordan':
        return (
          <svg className="w-40 h-40 text-[#d4af37] transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_10px_15px_rgba(212,175,55,0.2)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.015 9.015 0 0 1 8.716 6.747M12 3a9.015 9.015 0 0 0-8.716 6.747" />
            <path d="M19 12H5M12 19V5M16 10l-4 4-4-4" />
          </svg>
        );
      case '#hoodie':
        return (
          <svg className="w-36 h-36 text-zinc-400 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21m3.813-5.096L15 21m-4.5-7.5L12 9.75M9 6.75h6m-6 3h6m-9 9.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V6.75A2.25 2.25 0 0 0 15.75 4.5H8.25A2.25 2.25 0 0 0 6 6.75v10.5Z" />
          </svg>
        );
      case '#yeezy':
        return (
          <svg className="w-40 h-40 text-zinc-500 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_10px_15px_rgba(255,255,255,0.05)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
          </svg>
        );
      case '#necklace':
        return (
          <svg className="w-32 h-32 text-amber-500 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3Z" />
          </svg>
        );
      default:
        return (
          <svg className="w-36 h-36 text-zinc-500 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 17v-4h6v4M12 9v4" />
          </svg>
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-[#09090b] text-[#f4f4f5]' : 'bg-white text-zinc-900'
    }`}>
      
      {/* HEADER INTEGRATION */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
        isDarkMode ? 'bg-[#09090b]/90 border-zinc-800/80' : 'bg-white/95 border-zinc-200'
      } px-6 py-4 flex items-center justify-between`}>
        <Link href="/" className="flex items-center gap-3 group">
          {/* Official Logo: Rounded gold badge with "PR", crown tilted, and subtitles */}
          <div className="flex flex-col items-center">
            <div className="relative bg-gradient-to-r from-amber-400 to-[#d4af37] w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-[#d4af37]/15">
              <span className="text-2xl font-serif font-black text-[#09090b]">PR</span>
              <span className="absolute -top-1.5 -right-1.5 text-lg rotate-[15deg]">👑</span>
            </div>
          </div>
          <div>
            <span className={`text-lg font-black tracking-widest uppercase block transition-colors ${
              isDarkMode ? 'text-white group-hover:text-[#d4af37]' : 'text-[#09090b] group-hover:text-amber-600'
            }`}>STORE</span>
            <span className="text-[7.5px] font-bold tracking-widest uppercase block -mt-1 text-zinc-500">
              Moda Masculina e Acessórios
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className={`hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-wider ${
          isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
        }`}>
          <Link href="/?category=Marcas" className="hover:text-[#d4af37] transition-colors">Marcas</Link>
          <Link href="/?category=Tenis" className="hover:text-[#d4af37] transition-colors">Tênis</Link>
          <Link href="/?category=Roupas" className="hover:text-[#d4af37] transition-colors">Vestuário</Link>
          <Link href="/?category=All" className="hover:text-[#d4af37] transition-colors">Categorias</Link>
          <Link href="/?category=Acessorios" className="hover:text-[#d4af37] transition-colors">Acessórios</Link>
        </nav>

        {/* Actions, Theme Switcher & Language Toggles */}
        <div className="flex items-center gap-5">
          {/* Language toggles */}
          <div className={`flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border text-[9px] font-extrabold ${
            isDarkMode ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-400 bg-zinc-100'
          }`}>
            <button onClick={() => setLanguage('pt')} className={`px-2 py-0.5 rounded transition-all ${language === 'pt' ? 'bg-[#d4af37] text-[#09090b] font-black' : 'hover:text-white'}`}>PT-BR</button>
            <button onClick={() => setLanguage('en')} className={`px-2 py-0.5 rounded transition-all ${language === 'en' ? 'bg-[#d4af37] text-[#09090b] font-black' : 'hover:text-white'}`}>EN</button>
            <button onClick={() => setLanguage('es')} className={`px-2 py-0.5 rounded transition-all ${language === 'es' ? 'bg-[#d4af37] text-[#09090b] font-black' : 'hover:text-white'}`}>ES</button>
          </div>

          {/* Theme switcher */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={`p-2 rounded-full border transition-colors ${
              isDarkMode ? 'border-zinc-800 text-[#d4af37] hover:bg-zinc-900' : 'border-zinc-200 text-amber-600 hover:bg-zinc-100'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Search bar button */}
          <button className={`p-2 rounded-full border transition-colors ${
            isDarkMode ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-900' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-100'
          }`}>
            <Search className="w-4 h-4" />
          </button>

          {/* Shopping Bag Button (Working Cart trigger) */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className={`p-2.5 rounded-full border transition-all relative ${
              isDarkMode ? 'border-zinc-800 text-[#d4af37] hover:bg-zinc-900' : 'border-zinc-200 text-amber-600 hover:bg-zinc-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {getCartTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d4af37] text-[#09090b] text-[8px] font-black rounded-full flex items-center justify-center animate-bounce">
                {getCartTotalItems()}
              </span>
            )}
          </button>

          {/* ERP access */}
          <Link 
            href="/admin" 
            className={`hidden sm:flex items-center gap-1.5 text-[9px] font-black uppercase border rounded-full px-3 py-1.5 transition-all ${
              isDarkMode ? 'border-zinc-800 text-zinc-500 hover:text-[#d4af37] hover:border-[#d4af37]/30' : 'border-zinc-250 text-zinc-600 hover:text-amber-600 hover:border-amber-600/30'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            ERP Painel
          </Link>
        </div>
      </header>

      {/* 1. Lightning Deal / Promoção Relâmpago Section */}
      <section className={`relative overflow-hidden border-b transition-colors py-16 px-6 lg:px-12 ${
        isDarkMode ? 'bg-gradient-to-b from-[#121214] via-[#09090b] to-[#09090b] border-zinc-900' : 'bg-gradient-to-b from-zinc-50 via-white to-white border-zinc-200'
      }`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Details & Clock */}
          <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
            <span className="inline-flex self-center lg:self-start items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-[#d4af37]/5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> {t.heroTitle}
            </span>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-4 ${
              isDarkMode ? 'text-white' : 'text-zinc-950'
            }`}>
              {t.heroTitle} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-[#d4af37]">
                {t.heroSubtitle}
              </span>
            </h1>
            <p className={`mt-2 text-sm lg:text-base max-w-lg mb-8 leading-relaxed ${
              isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              {t.heroDesc}
            </p>

            {/* Premium Countdown Clock */}
            <div className="flex justify-center lg:justify-start items-center gap-4 mb-8">
              <div className={`flex flex-col items-center border rounded-xl px-4 py-3 min-w-[70px] ${
                isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <span className="text-2xl lg:text-3xl font-black text-[#d4af37] tracking-tighter">
                  {timeLeft.days.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase font-extrabold mt-1">Dias</span>
              </div>
              <span className="text-xl font-bold text-zinc-700">:</span>
              <div className={`flex flex-col items-center border rounded-xl px-4 py-3 min-w-[70px] ${
                isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <span className="text-2xl lg:text-3xl font-black text-[#d4af37] tracking-tighter">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase font-extrabold mt-1">Horas</span>
              </div>
              <span className="text-xl font-bold text-zinc-700">:</span>
              <div className={`flex flex-col items-center border rounded-xl px-4 py-3 min-w-[70px] ${
                isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <span className="text-2xl lg:text-3xl font-black text-[#d4af37] tracking-tighter">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase font-extrabold mt-1">Minutos</span>
              </div>
              <span className="text-xl font-bold text-zinc-700">:</span>
              <div className={`flex flex-col items-center border rounded-xl px-4 py-3 min-w-[70px] ${
                isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <span className="text-2xl lg:text-3xl font-black text-[#d4af37] tracking-tighter">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase font-extrabold mt-1">Segundos</span>
              </div>
            </div>

            {/* Quick checkout CTA */}
            <div className="flex justify-center lg:justify-start">
              <button 
                onClick={() => {
                  const element = document.getElementById('catalog');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#d4af37] hover:bg-amber-400 text-[#09090b] font-black text-xs px-8 py-4 rounded-lg tracking-widest uppercase transition-all shadow-lg shadow-[#d4af37]/15 flex items-center gap-2"
              >
                {t.shopNow} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Large Prototype Sneaker Graphic representation */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="absolute w-72 h-72 rounded-full bg-[#d4af37]/5 blur-3xl -z-10" />
            <div className={`border p-8 rounded-2xl shadow-2xl relative w-full max-w-sm aspect-square flex items-center justify-center group overflow-hidden ${
              isDarkMode ? 'bg-gradient-to-tr from-zinc-900 to-zinc-950/60 border-zinc-800' : 'bg-gradient-to-tr from-zinc-100 to-zinc-50 border-zinc-200'
            }`}>
              <div className="absolute top-4 right-4 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md text-[10px] font-black text-[#d4af37] tracking-wider uppercase">
                Edição de Luxo
              </div>
              <svg className="w-52 h-52 text-[#d4af37] drop-shadow-[0_15px_30px_rgba(212,175,55,0.25)] transition-transform duration-700 group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.015 9.015 0 0 1 8.716 6.747M12 3a9.015 9.015 0 0 0-8.716 6.747" />
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Horizontal Categories list */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col mb-6">
          <h2 className={`text-lg font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{t.categoriesTitle}</h2>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mt-0.5">{t.categoriesSub}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Todas Peças', id: 'All', icon: '🛍️' },
            { label: 'Calçados', id: 'Tenis', icon: '👟' },
            { label: 'Vestuário', id: 'Roupas', icon: '👕' },
            { label: 'Acessórios', id: 'Acessorios', icon: '🕶️' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-zinc-900 border-[#d4af37] text-[#d4af37]' 
                  : isDarkMode 
                    ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                    : 'bg-zinc-50 border-zinc-200 hover:border-zinc-350 text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-wider">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Catalog Section with Product Grid */}
      <section id="catalog" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-20">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
          <div>
            <h3 className={`text-lg font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{t.showcaseTitle}</h3>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-0.5 block">
              Mostrando {products.length} {t.showcaseSub}
            </span>
          </div>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`flex items-center gap-2 border hover:border-[#d4af37]/40 hover:text-[#d4af37] rounded-lg px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
              isDarkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> {t.filters}
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => {
            const hasPromo = !!product.promoPrice;
            const priceToDisplay = product.promoPrice || product.price;

            return (
              <div 
                key={product.id}
                className={`border rounded-xl overflow-hidden shadow-xl group hover:border-[#d4af37]/35 transition-all duration-300 flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#121214] border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                {/* Visual Image container */}
                <div className={`h-64 flex items-center justify-center relative border-b overflow-hidden ${
                  isDarkMode ? 'bg-zinc-950 border-zinc-900/60' : 'bg-zinc-100 border-zinc-200'
                }`}>
                  {renderProductImage(product.images[0])}
                  {hasPromo && (
                    <span className="absolute top-4 left-4 bg-[#d4af37] text-[#09090b] text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider shadow-lg shadow-[#d4af37]/10">
                      OFF
                    </span>
                  )}
                  <span className="absolute bottom-4 right-4 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 px-2 py-0.5 rounded text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                    Qtd: {product.stock}
                  </span>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-[#d4af37] font-black uppercase tracking-widest block mb-1">
                      {product.brand}
                    </span>
                    <h4 className={`text-sm font-black group-hover:text-[#d4af37] transition-colors leading-snug line-clamp-2 ${
                      isDarkMode ? 'text-[#f4f4f5]' : 'text-zinc-900'
                    }`}>
                      {product.name}
                    </h4>
                    
                    {/* Price block */}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-black text-[#d4af37]">
                        R$ {priceToDisplay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      {hasPromo && (
                        <span className="text-xs text-zinc-500 line-through">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Size buttons (Cart trigger) */}
                  <div className="mt-6 pt-4 border-t border-zinc-900/40">
                    <span className="text-[9px] text-zinc-500 uppercase block mb-2 font-black tracking-widest">
                      {t.sizeLabel}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => addToCart(product, size)}
                          className={`px-3 py-1.5 rounded-lg border hover:border-[#d4af37] hover:text-[#d4af37] text-[10px] font-bold transition-all ${
                            isDarkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-white'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. WhatsApp capturing popup dialog */}
      {isLeadOpen && (
        <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-8 max-w-md w-full relative shadow-2xl">
            <button 
              onClick={() => setIsLeadOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {!leadSubmitted ? (
              <form onSubmit={handleLeadSubmit} className="text-center">
                <span className="text-3xl block mb-4">👑</span>
                <h3 className="text-xl font-black text-[#f4f4f5] uppercase tracking-wider">{t.leadTitle}</h3>
                <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto leading-relaxed">
                  {t.leadDesc}
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                      <Phone className="w-4 h-4 text-[#d4af37]" />
                    </span>
                    <input 
                      type="tel"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="WhatsApp (ex: 4599999999)"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:border-[#d4af37] focus:outline-none transition-colors text-white"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-[#d4af37] text-[#09090b] font-black text-xs py-3 rounded-lg hover:bg-amber-400 tracking-wider uppercase transition-colors"
                  >
                    {t.leadBtn}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-[#d4af37] mx-auto mb-4" />
                <h3 className="text-lg font-black text-[#f4f4f5] uppercase tracking-wider">{t.leadTitle}</h3>
                <p className="text-xs text-zinc-400 mt-2">
                  {t.leadSuccess}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Filter sidebar Drawer Sheet */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex justify-end">
          <div className="bg-[#121214] border-l border-zinc-800 w-full max-w-sm h-full p-8 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-6">
                <h3 className="text-lg font-black uppercase tracking-wider text-[#f4f4f5]">Filtros do Catálogo</h3>
                <button onClick={() => setIsFilterOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category selector */}
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-3">Categorias</h4>
                <div className="flex flex-col gap-2">
                  {['All', 'Roupas', 'Tenis', 'Acessorios'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left text-xs font-semibold py-2 px-3 rounded-lg border transition-all ${
                        selectedCategory === cat 
                          ? 'bg-[#d4af37]/10 border-[#d4af37]/50 text-[#d4af37]' 
                          : 'border-zinc-800/80 hover:border-zinc-700 bg-zinc-950 text-zinc-400'
                      }`}
                    >
                      {cat === 'All' ? 'Todas as Categorias' : cat === 'Tenis' ? 'Tênis' : cat === 'Roupas' ? 'Vestuário' : 'Acessórios'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand selector */}
              <div>
                <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-3">Marcas</h4>
                <div className="flex flex-col gap-2">
                  {['All', 'Nike Jordan', 'Supreme', 'Adidas', 'PR Store', 'Off-White'].map(brand => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`text-left text-xs font-semibold py-2 px-3 rounded-lg border transition-all ${
                        selectedBrand === brand 
                          ? 'bg-[#d4af37]/10 border-[#d4af37]/50 text-[#d4af37]' 
                          : 'border-zinc-800/80 hover:border-zinc-700 bg-zinc-950 text-zinc-400'
                      }`}
                    >
                      {brand === 'All' ? 'Todas as Marcas' : brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsFilterOpen(false)}
              className="w-full bg-[#d4af37] text-[#09090b] text-xs font-black py-3.5 rounded-lg hover:bg-amber-400 tracking-wider uppercase transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* 6. Shopping Cart Drawer Sheet */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex justify-end">
          <div className="bg-[#121214] border-l border-zinc-800 w-full max-w-md h-full p-8 flex flex-col justify-between shadow-2xl">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-6">
                <h3 className="text-lg font-black uppercase tracking-wider text-[#f4f4f5] flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#d4af37]" /> {t.cartTitle}
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs">
                    <span className="text-4xl block mb-2">🛍️</span>
                    {t.cartEmpty}
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl relative">
                      <div className="w-16 h-16 bg-zinc-950 rounded-lg flex items-center justify-center text-2xl border border-zinc-800">
                        {item.product.images[0] === '#jordan' ? '👟' : item.product.images[0] === '#hoodie' ? '👕' : '💎'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#f4f4f5] truncate">{item.product.name}</h4>
                        <span className="text-[10px] text-[#d4af37] font-black uppercase block mt-1">
                          Tamanho: {item.selectedSize}
                        </span>
                        <div className="flex justify-between items-center mt-2.5">
                          {/* Quantity selector increment/decrement */}
                          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-0.5">
                            <button onClick={() => updateQuantity(item.product.id, item.selectedSize, -1)} className="text-zinc-400 hover:text-white text-xs font-bold px-1">-</button>
                            <span className="text-xs font-black text-[#d4af37]">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.selectedSize, 1)} className="text-zinc-400 hover:text-white text-xs font-bold px-1">+</button>
                          </div>
                          <span className="text-xs font-black text-[#d4af37]">
                            R$ {((item.product.promoPrice || item.product.price) * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-zinc-650 hover:text-red-500 p-1 absolute top-2 right-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Shipping & Checkout area */}
            <div className="border-t border-zinc-800/80 pt-6 mt-6">
              {/* Shipping Calculator */}
              <div className="mb-4">
                <span className="text-[10px] text-zinc-500 uppercase block mb-1.5 font-black tracking-widest">
                  {t.shippingLabel}
                </span>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={cepInput}
                    onChange={(e) => setCepInput(e.target.value)}
                    placeholder="Ex: 85851000"
                    maxLength={8}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs focus:border-[#d4af37] focus:outline-none text-white font-medium"
                  />
                  <button 
                    onClick={calculateShipping}
                    className="bg-zinc-800 border border-zinc-700 hover:border-[#d4af37] hover:text-[#d4af37] text-xs px-3 rounded-lg transition-colors font-bold uppercase tracking-wider"
                  >
                    {t.calcBtn}
                  </button>
                </div>
                {shippingCost !== null && (
                  <div className="mt-2 text-[11px] text-zinc-400 flex justify-between items-center bg-zinc-900/40 p-2.5 rounded border border-zinc-800/40">
                    <span>{shippingMethod}</span>
                    <span className="font-black text-[#d4af37]">R$ {shippingCost.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-xs text-zinc-400 font-black uppercase tracking-wider">{t.subtotal}</span>
                <span className="text-2xl font-black text-[#d4af37]">R$ {getSubtotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Actions */}
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || isCheckingOut}
                className="w-full bg-[#d4af37] text-[#09090b] font-black text-xs py-3.5 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/10 tracking-widest uppercase"
              >
                {isCheckingOut ? t.checkoutRedirecting : t.checkoutBtn} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Floating support Chat & WhatsApp Widget */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Chat window */}
        {isChatOpen && (
          <div className="bg-[#121214] border border-zinc-800 w-[320px] sm:w-[360px] h-[400px] rounded-xl shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div>
                  <h4 className="text-xs font-black text-[#f4f4f5] uppercase tracking-wider">PR Support Agent</h4>
                  <span className="text-[9px] text-green-500 font-semibold block -mt-0.5">Online Serverless</span>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-[#d4af37] text-[#09090b] font-black rounded-br-none' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleChatSend} className="p-3 border-t border-zinc-800 bg-zinc-950 flex gap-2">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Perguntar sobre estoque ou grade..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:border-[#d4af37] focus:outline-none text-white"
              />
              <button 
                type="submit"
                className="bg-[#d4af37] hover:bg-amber-400 text-[#09090b] p-1.5 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Action button */}
        <div className="flex gap-2">
          {/* WhatsApp Direct button */}
          <a
            href="https://wa.me/5545999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center shadow-lg hover:bg-green-500 transition-colors border border-green-500/30 text-white font-bold"
          >
            💬
          </a>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-12 h-12 rounded-full bg-[#d4af37] flex items-center justify-center shadow-lg hover:bg-amber-400 transition-colors border border-amber-600/30 text-[#09090b]"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>
      </div>

    </div>
  );
}
