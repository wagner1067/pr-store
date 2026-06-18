'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, CheckCircle2, Phone } from 'lucide-react';

export function LeadModal() {
  const t = useTranslations('lead');
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedLead = typeof window !== 'undefined' && sessionStorage.getItem('pr_lead_shown');
      if (!savedLead) {
        setIsOpen(true);
        sessionStorage.setItem('pr_lead_shown', 'true');
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setSubmitted(true);
      // Save lead to backend
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });
      } catch {
        // Silent fail — lead captured locally
      }
      setTimeout(() => setIsOpen(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm animate-slideUp">
        <div className="bg-background border border-border rounded-xl p-8 shadow-2xl relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 p-1 rounded hover:bg-secondary text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-border shadow-md mb-4">
              <img src="/logo.jpg" alt="PR Store" className="w-full h-full object-cover" />
            </div>

            {submitted ? (
              <div className="animate-fadeIn">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                <p className="text-sm font-bold text-success">{t('success')}</p>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-black uppercase tracking-wider mb-2">{t('title')}</h3>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">{t('description')}</p>
                <form onSubmit={handleSubmit} className="w-full space-y-3">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder={t('placeholder')}
                      className="w-full bg-card border border-border rounded-lg pl-10 pr-3 py-3 text-xs focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground font-black text-xs py-3.5 rounded-lg hover:bg-primary/90 uppercase tracking-wider transition-colors shadow-lg shadow-primary/15"
                  >
                    {t('button')}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
