'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, ArrowRight } from 'lucide-react';

interface HeroProps {
  promoProduct?: {
    name: string;
    slug: string;
    promoPrice?: number | null;
    promoUntil?: Date | string | null;
  };
  serverTime: string;
}

export function HeroSection({ promoProduct, serverTime }: HeroProps) {
  const t = useTranslations('hero');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const endDate = promoProduct?.promoUntil
      ? new Date(promoProduct.promoUntil)
      : new Date(new Date(serverTime).getTime() + 2 * 24 * 60 * 60 * 1000);

    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, endDate.getTime() - now.getTime());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [promoProduct, serverTime]);

  const scrollToCatalog = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const timeUnits = [
    { value: timeLeft.days, label: t('days') },
    { value: timeLeft.hours, label: t('hours') },
    { value: timeLeft.minutes, label: t('minutes') },
    { value: timeLeft.seconds, label: t('seconds') },
  ];

  return (
    <section className="relative overflow-hidden border-b border-border py-16 px-6 lg:px-12 bg-gradient-to-b from-card via-background to-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Content */}
        <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left animate-fadeIn">
          <span className="inline-flex self-center lg:self-start items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-primary/5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> {t('badge')}
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-4">
            {t('title')}<br />
            <span className="text-gold-gradient">{t('subtitle')}</span>
          </h1>

          <p className="mt-2 text-sm lg:text-base max-w-lg mb-8 leading-relaxed text-muted-foreground">
            {t('description')}
          </p>

          {/* Countdown */}
          <div className="flex justify-center lg:justify-start items-center gap-4 mb-8">
            {timeUnits.map((unit, idx) => (
              <div key={unit.label} className="flex items-center gap-4">
                <div className="flex flex-col items-center border border-border rounded-xl px-4 py-3 min-w-[70px] bg-card/90">
                  <span className="text-2xl lg:text-3xl font-black text-primary tracking-tighter">
                    {unit.value.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase font-extrabold mt-1">
                    {unit.label}
                  </span>
                </div>
                {idx < timeUnits.length - 1 && (
                  <span className="text-xl font-bold text-muted-foreground">:</span>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex justify-center lg:justify-start">
            <button
              onClick={scrollToCatalog}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs px-8 py-4 rounded-lg tracking-widest uppercase transition-all shadow-lg shadow-primary/15 flex items-center gap-2 animate-pulse-gold"
            >
              {t('cta')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="lg:col-span-5 flex justify-center items-center relative">
          <div className="absolute w-72 h-72 rounded-full bg-primary/5 blur-3xl -z-10" />
          <div className="border border-border p-8 rounded-2xl shadow-2xl relative w-full max-w-sm aspect-square flex items-center justify-center group overflow-hidden bg-gradient-to-tr from-card to-card/60">
            <div className="absolute top-4 right-4 bg-card border border-border px-2.5 py-1 rounded-md text-[10px] font-black text-primary tracking-wider uppercase">
              {t('luxuryEdition')}
            </div>
            <svg
              className="w-52 h-52 text-primary drop-shadow-[0_15px_30px_rgba(212,175,55,0.25)] transition-transform duration-700 group-hover:scale-105 animate-float"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.015 9.015 0 0 1 8.716 6.747M12 3a9.015 9.015 0 0 0-8.716 6.747" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
