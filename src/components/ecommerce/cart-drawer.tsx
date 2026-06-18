'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Trash2, Plus, Minus, CreditCard, QrCode, Clipboard, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';

type CheckoutStep = 'cart' | 'details' | 'pix_screen';

export function CartDrawer() {
  const t = useTranslations('cart');
  const tCheckout = useTranslations('checkout');
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD'>('PIX');
  const [cep, setCep] = useState('');
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingMethod, setShippingMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixDetails, setPixDetails] = useState<{ barcode: string; total: number; orderId: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ orderId: string } | null>(null);

  if (!isOpen) return null;

  const total = subtotal + (shippingCost || 0);

  const calculateShipping = async () => {
    if (cep.length < 8) return;
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep }),
      });
      const data = await res.json();
      if (data.success) {
        setShippingCost(data.cost);
        setShippingMethod(data.method);
      }
    } catch {
      setShippingCost(29.90);
      setShippingMethod('Correios PAC');
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0 || !customerPhone) return;
    setIsProcessing(true);

    try {
      const checkoutItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.promoPrice || item.price,
        quantity: item.quantity,
      }));

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          paymentMethod: paymentMethod === 'CARD' ? 'CARTAO_CREDITO' : 'PIX',
          clientPhone: customerPhone,
          clientName: customerName,
          shippingCost: shippingCost || 0,
          shippingMethod: shippingMethod || 'RETIRADA',
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        if (paymentMethod === 'PIX') {
          setPixDetails({ barcode: data.barcode, total: data.total, orderId: data.pedidoId });
          setStep('pix_screen');
        } else {
          setSuccessInfo({ orderId: data.pedidoId });
          clearCart();
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPixKey = () => {
    if (pixDetails) {
      navigator.clipboard.writeText(pixDetails.barcode);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-black uppercase tracking-wider">{t('title')}</h2>
          <button onClick={closeCart} className="p-1 rounded hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Success Screen */}
        {successInfo && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
            <CheckCircle2 className="w-16 h-16 text-success mb-4" />
            <h3 className="text-lg font-black uppercase tracking-wider mb-2">{tCheckout('successTitle')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{tCheckout('successMessage')}</p>
            <p className="text-[10px] text-muted-foreground">ID: {successInfo.orderId}</p>
            <button
              onClick={() => { setSuccessInfo(null); closeCart(); setStep('cart'); }}
              className="mt-6 bg-primary text-primary-foreground font-black text-xs px-6 py-3 rounded-lg uppercase tracking-wider"
            >
              OK
            </button>
          </div>
        )}

        {/* PIX Screen */}
        {step === 'pix_screen' && pixDetails && !successInfo && (
          <div className="flex-1 p-6 flex flex-col items-center justify-center animate-fadeIn">
            <QrCode className="w-20 h-20 text-primary mb-4" />
            <h3 className="text-sm font-black uppercase tracking-wider mb-2">{tCheckout('pixTitle')}</h3>
            <p className="text-xs text-muted-foreground text-center mb-6">{tCheckout('pixInstructions')}</p>
            <div className="w-full bg-card border border-border rounded-lg p-4 mb-4">
              <p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase">Chave Pix:</p>
              <p className="text-xs font-mono break-all text-foreground">{pixDetails.barcode}</p>
            </div>
            <p className="text-lg font-black text-primary mb-4">{formatCurrency(pixDetails.total)}</p>
            <button
              onClick={copyPixKey}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-black text-xs px-6 py-3 rounded-lg uppercase tracking-wider w-full justify-center"
            >
              <Clipboard className="w-4 h-4" />
              {copiedKey ? tCheckout('copied') : tCheckout('copyKey')}
            </button>
          </div>
        )}

        {/* Cart Items */}
        {step === 'cart' && !successInfo && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t('empty')}</p>
              ) : (
                items.map((item) => {
                  const price = item.promoPrice || item.price;
                  return (
                    <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 border border-border rounded-lg p-3 bg-card">
                      <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                        {item.category === 'Tenis' ? '👟' : item.category === 'Roupas' ? '👕' : '💎'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate">{item.name}</h4>
                        <p className="text-[9px] text-muted-foreground uppercase mt-0.5">
                          Tamanho: {item.selectedSize}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-black text-primary">{formatCurrency(price)}</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, item.selectedSize, -1)} className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-secondary">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.selectedSize, 1)} className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-secondary">
                              <Plus className="w-3 h-3" />
                            </button>
                            <button onClick={() => removeItem(item.id, item.selectedSize)} className="w-6 h-6 rounded flex items-center justify-center text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                {/* Shipping */}
                <div>
                  <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest block mb-1">
                    {t('shippingLabel')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={cep}
                      onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
                      placeholder="00000-000"
                      maxLength={8}
                      className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs focus:border-primary focus:outline-none"
                    />
                    <button
                      onClick={calculateShipping}
                      className="bg-secondary text-foreground font-bold text-xs px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      {t('calculate')}
                    </button>
                  </div>
                  {shippingMethod && (
                    <p className="text-[10px] text-primary mt-1 font-bold">{shippingMethod} — {formatCurrency(shippingCost || 0)}</p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{t('subtotal')}</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  {shippingCost !== null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t('shipping')}</span>
                      <span className="font-bold">{formatCurrency(shippingCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black pt-2 border-t border-border">
                    <span>{t('total')}</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('details')}
                  className="w-full bg-primary text-primary-foreground font-black text-xs py-3.5 rounded-lg hover:bg-primary/90 uppercase tracking-wider transition-colors shadow-lg shadow-primary/15"
                >
                  {t('checkout')}
                </button>
              </div>
            )}
          </>
        )}

        {/* Details Step */}
        {step === 'details' && !successInfo && (
          <div className="flex-1 p-6 space-y-4 overflow-y-auto animate-fadeIn">
            <h3 className="text-sm font-black uppercase tracking-wider">{t('yourDetails')}</h3>
            <div>
              <label className="text-[9px] text-muted-foreground uppercase font-bold block mb-1">{t('fullName')}</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground uppercase font-bold block mb-1">{t('whatsapp')}</label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground uppercase font-bold block mb-1">{t('paymentMethod')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('PIX')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-bold transition-colors ${
                    paymentMethod === 'PIX' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                  }`}
                >
                  <QrCode className="w-4 h-4" /> Pix
                </button>
                <button
                  onClick={() => setPaymentMethod('CARD')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-bold transition-colors ${
                    paymentMethod === 'CARD' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Cartão
                </button>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setStep('cart')}
                className="flex-1 border border-border text-muted-foreground font-bold text-xs py-3 rounded-lg hover:bg-secondary transition-colors uppercase"
              >
                Voltar
              </button>
              <button
                onClick={handleCheckout}
                disabled={isProcessing || !customerPhone}
                className="flex-1 bg-primary text-primary-foreground font-black text-xs py-3 rounded-lg hover:bg-primary/90 uppercase tracking-wider transition-colors disabled:opacity-50 shadow-lg shadow-primary/15"
              >
                {isProcessing ? t('processing') : t('continue')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
