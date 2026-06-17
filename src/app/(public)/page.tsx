'use client';

import React, { useState, useEffect } from 'react';
import { 
  Filter, Clock, Sparkles, Phone, ShoppingCart, 
  Trash2, X, Send, HelpCircle, ArrowRight, CheckCircle2 
} from 'lucide-react';

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
    images: ['/next.svg'],
    stock: 5,
  },
  {
    id: '2',
    name: 'Supreme Box Logo Luxury Hoodie Black/Gold',
    slug: 'supreme-bogo-gold',
    price: 1499.90,
    category: 'Roupas',
    brand: 'Supreme',
    sizes: ['M', 'G', 'GG'],
    images: ['/next.svg'],
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
    images: ['/next.svg'],
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
    images: ['/next.svg'],
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
    images: ['/next.svg'],
    stock: 2,
  }
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');

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
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 59, seconds: 59 });

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
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 }; // Loop back for mock purposes
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

  const removeFromCart = (id: string, size: string) => {
    setCart(cart.filter(item => !(item.product.id === id && item.selectedSize === size)));
  };

  const getSubtotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.product.promoPrice || item.product.price;
      return acc + (price * item.quantity);
    }, 0);
  };

  // Mock Shipping Calculation
  const calculateShipping = () => {
    if (cepInput.length >= 8) {
      // Local boundary ZIP code shipping mock
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

    // Mock AI reply simulating client-side GPT assistant
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

  return (
    <div className="flex-1 bg-[#09090b]">
      
      {/* Banner / Promotion Highlight */}
      <section className="relative bg-gradient-to-r from-amber-500/10 via-yellow-600/5 to-transparent border-y border-zinc-800/60 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Promoção Relâmpago Exclusiva
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#f4f4f5] leading-tight max-w-lg">
              Estilo Streetwear de Luxo com Preço Especial Sincronizado
            </h2>
            <p className="text-zinc-400 mt-2 text-sm max-w-md">
              Coleções exclusivas limitadas. Descontos de até 20% aplicados no catálogo abaixo.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center min-w-[280px]">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Expira em:
            </span>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-amber-500 tracking-tighter">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase font-semibold">Horas</span>
              </div>
              <span className="text-2xl font-black text-zinc-600">:</span>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-amber-500 tracking-tighter">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase font-semibold">Minutos</span>
              </div>
              <span className="text-2xl font-black text-zinc-600">:</span>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-amber-500 tracking-tighter">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase font-semibold">Segundos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Filters & Products */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 border-b border-zinc-900 pb-4">
          <h3 className="text-xl font-bold text-[#f4f4f5]">Vitrine Streetwear</h3>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 border border-zinc-800 rounded-lg px-4 py-2 text-xs font-semibold hover:border-amber-500/50 hover:text-amber-500 transition-colors"
          >
            <Filter className="w-4 h-4" /> Filtros Dinâmicos
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
                className="bg-[#121214] border border-zinc-800/60 rounded-xl overflow-hidden shadow-lg group hover:border-amber-500/30 transition-all flex flex-col justify-between"
              >
                {/* Image Placeholder Container */}
                <div className="bg-zinc-900/60 h-64 flex items-center justify-center relative border-b border-zinc-900">
                  <div className="text-zinc-600 font-bold text-center p-4">
                    <span className="text-4xl block mb-2">👟</span>
                    <span className="text-xs uppercase tracking-widest block">{product.brand}</span>
                  </div>
                  {hasPromo && (
                    <span className="absolute top-4 left-4 bg-amber-500 text-[#09090b] text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                      OFF
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest block mb-1">
                      {product.category}
                    </span>
                    <h4 className="text-base font-bold text-[#f4f4f5] group-hover:text-amber-400 transition-colors line-clamp-2">
                      {product.name}
                    </h4>
                    
                    {/* Price block */}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-black text-amber-500">
                        R$ {priceToDisplay.toFixed(2)}
                      </span>
                      {hasPromo && (
                        <span className="text-xs text-zinc-500 line-through">
                          R$ {product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 uppercase block mb-2 font-bold tracking-wider">
                      Escolha o tamanho:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => addToCart(product, size)}
                          className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-amber-500 bg-zinc-950 text-xs font-semibold transition-all hover:text-amber-500"
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

      {/* LEAD MODAL (WhatsApp capture) */}
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
                <span className="text-3xl block mb-4">🎁</span>
                <h3 className="text-xl font-extrabold text-[#f4f4f5]">Libere 10% de Desconto</h3>
                <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto leading-relaxed">
                  Digite seu WhatsApp abaixo para receber novidades exclusivas e destravar seu cupom de boas-vindas.
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input 
                      type="tel"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="WhatsApp (ex: 4599999999)"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-amber-500 text-[#09090b] font-bold text-sm py-2.5 rounded-lg hover:bg-amber-400 transition-colors"
                  >
                    Resgatar Cupom de Luxo
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#f4f4f5]">Cupom Ativado!</h3>
                <p className="text-xs text-zinc-400 mt-2">
                  Seu cupom de 10% foi registrado. Use nas compras finalizadas hoje.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FILTER DRAWER */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex justify-end">
          <div className="bg-[#121214] border-l border-zinc-800 w-full max-w-sm h-full p-8 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-6">
                <h3 className="text-lg font-extrabold text-[#f4f4f5]">Filtros do Catálogo</h3>
                <button onClick={() => setIsFilterOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category selector */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-wider mb-3">Categorias</h4>
                <div className="flex flex-col gap-2">
                  {['All', 'Roupas', 'Tenis', 'Acessorios'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left text-xs font-semibold py-2 px-3 rounded-lg border transition-all ${
                        selectedCategory === cat 
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' 
                          : 'border-zinc-800/80 hover:border-zinc-700 bg-zinc-950 text-zinc-400'
                      }`}
                    >
                      {cat === 'All' ? 'Todas as Categorias' : cat === 'Tenis' ? 'Tênis' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand selector */}
              <div>
                <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-wider mb-3">Marcas</h4>
                <div className="flex flex-col gap-2">
                  {['All', 'Nike Jordan', 'Supreme', 'Adidas', 'PR Store', 'Off-White'].map(brand => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`text-left text-xs font-semibold py-2 px-3 rounded-lg border transition-all ${
                        selectedBrand === brand 
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' 
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
              className="w-full bg-amber-500 text-[#09090b] text-xs font-bold py-3 rounded-lg hover:bg-amber-400 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* SHOPPING CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex justify-end">
          <div className="bg-[#121214] border-l border-zinc-800 w-full max-w-md h-full p-8 flex flex-col justify-between shadow-2xl">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-6">
                <h3 className="text-lg font-extrabold text-[#f4f4f5] flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-500" /> Sacola de Compras
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500">
                    <span className="text-4xl block mb-2">🛍️</span>
                    Sacola vazia. Adicione itens da vitrine.
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl relative">
                      <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center text-2xl">
                        👟
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#f4f4f5] truncate">{item.product.name}</h4>
                        <span className="text-[10px] text-amber-500 font-bold uppercase block mt-1">
                          Tamanho: {item.selectedSize}
                        </span>
                        <div className="flex justify-between items-baseline mt-2">
                          <span className="text-xs text-zinc-500">Qtd: {item.quantity}</span>
                          <span className="text-xs font-black text-amber-500">
                            R$ {((item.product.promoPrice || item.product.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-zinc-600 hover:text-red-500 p-1 absolute top-2 right-2 transition-colors"
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
                <span className="text-[10px] text-zinc-500 uppercase block mb-1.5 font-bold tracking-wider">
                  Cálculo de Envio (CEP):
                </span>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={cepInput}
                    onChange={(e) => setCepInput(e.target.value)}
                    placeholder="Ex: 85851000"
                    maxLength={8}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <button 
                    onClick={calculateShipping}
                    className="bg-zinc-800 border border-zinc-700 hover:border-amber-500 hover:text-amber-500 text-xs px-3 rounded-lg transition-colors font-semibold"
                  >
                    Calcular
                  </button>
                </div>
                {shippingCost !== null && (
                  <div className="mt-2 text-[11px] text-zinc-400 flex justify-between items-center bg-zinc-900/40 p-2 rounded border border-zinc-800/40">
                    <span>{shippingMethod}</span>
                    <span className="font-bold text-amber-500">R$ {shippingCost.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Subtotal:</span>
                <span className="text-2xl font-black text-amber-500">R$ {getSubtotal().toFixed(2)}</span>
              </div>

              {/* Actions */}
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || isCheckingOut}
                className="w-full bg-amber-500 text-[#09090b] font-black text-xs py-3.5 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
              >
                {isCheckingOut ? 'Redirecionando...' : 'Finalizar Compra Segura'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING AI CHAT ASSISTANT WIDGET */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Chat window */}
        {isChatOpen && (
          <div className="bg-[#121214] border border-zinc-800 w-[320px] sm:w-[360px] h-[400px] rounded-xl shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div>
                  <h4 className="text-xs font-bold text-[#f4f4f5]">PR Support Agent</h4>
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
                        ? 'bg-amber-500 text-[#09090b] font-semibold rounded-br-none' 
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
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
              />
              <button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-[#09090b] p-1.5 rounded-lg transition-colors"
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
            className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shadow-lg hover:bg-amber-400 transition-colors border border-amber-600/30 text-[#09090b]"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>
      </div>

    </div>
  );
}
