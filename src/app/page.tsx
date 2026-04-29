'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, MapPin, ShieldCheck, ShoppingCart, Truck, CreditCard, Clock3, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CategoryGrid from '@/components/CategoryGrid';
import { useLanguage } from '@/context/LanguageContext';
import { getCategories, deterministicShuffle, getSaleInfo, getProductImage } from '@/lib/products';
import { formatPrice } from '@/lib/formatPrice';
import { getMasterProducts } from '@/lib/productData';
import { getAllBranches } from '@/lib/branches';
import Image from 'next/image';
import { Product } from '@/types';

export default function HomePage() {
  const { t } = useLanguage();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [branchCount, setBranchCount] = useState(0);
  const [countdown, setCountdown] = useState('00:00:00');
  const dealsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllProducts(getMasterProducts());
    setBranchCount(getAllBranches().length);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 0);
      const diff = Math.max(0, end.getTime() - now.getTime());
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const categories = useMemo(() => getCategories(allProducts), [allProducts]);
  const featuredProducts = useMemo(() => deterministicShuffle(allProducts, 42), [allProducts]);
  const dealProducts = featuredProducts.slice(0, 8);

  // Return the landing page JSX directly
  return (
    <div className="page-transition bg-light-bg dark:bg-dark-bg">
      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&h=900&fit=crop')",
          }}
        />
        <div className="absolute inset-0 dark:hidden bg-[linear-gradient(135deg,rgba(15,23,42,0.58)_0%,rgba(30,41,59,0.50)_48%,rgba(15,23,42,0.62)_100%)]" />
        <div className="absolute inset-0 hidden dark:block bg-[linear-gradient(135deg,rgba(2,6,23,0.82)_0%,rgba(15,23,42,0.72)_48%,rgba(17,24,39,0.88)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.20),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_30%)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-20">
          <div className="grid grid-cols-1 gap-8 items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur">
                <ShieldCheck size={13} className="text-amber-400" />
                {t("Rwanda's trusted supermarket network")}
              </div>

              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl md:text-5xl font-black leading-tight text-balance drop-shadow-lg">
                  {t('Simba Supermarket, built for fast shopping across Kigali.')}
                </h1>
                <p className="max-w-lg text-base md:text-lg text-slate-200">
                  {t('Fresh groceries, everyday essentials, branch pickup, and fast delivery in one place. Start with the brand people already trust.')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-btn bg-[#f59e0b] px-7 py-3 text-lg font-extrabold shadow-lg hover:bg-[#d97706] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/60 transition-all"
                >
                  <ShoppingCart size={20} />
                  {t('Start Shopping')}
                </Link>
                <Link
                  href="/branches"
                  className="inline-flex items-center justify-center gap-2 rounded-btn border border-white/15 bg-white/10 px-7 py-3 text-lg font-semibold text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                >
                  <MapPin size={20} />
                  {t('Find a Branch')}
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                {[
                  { value: `${branchCount}+`, label: t('Branches across Rwanda') },
                  { value: '45 min', label: t('Fast Kigali delivery') },
                  { value: 'MoMo', label: t('Easy payment options') },
                ].map(item => (
                  <div key={item.label} className="rounded-card border border-white/10 bg-white/10 px-6 py-4 backdrop-blur shadow">
                    <p className="text-2xl font-extrabold text-white drop-shadow">{item.value}</p>
                    <p className="text-sm text-slate-200">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="border-b border-light-border dark:border-dark-border bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5"><Truck size={13} className="text-[#f59e0b]" /> {t('Free delivery over 50,000 RWF')}</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#f59e0b]" /> {t('Verified products')}</span>
          <span className="flex items-center gap-1.5"><CreditCard size={13} className="text-[#f59e0b]" /> MTN &amp; Airtel MoMo</span>
        </div>
      </div>

      {/* Today's deals */}
      <section className="px-4 pt-8 pb-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-light-text dark:text-dark-text">
                {t("Today's deals")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('Top picks, limited time')}</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#16a34a] hover:underline hidden sm:inline-flex">
              {t('Shop now')}
            </Link>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-4">
            <div className="rounded-[1.75rem] border border-light-border dark:border-dark-border bg-white dark:bg-dark-card p-6 text-light-text dark:text-dark-text shadow-sm overflow-hidden relative">
              <p className="text-xs uppercase tracking-[0.3em] text-[#f59e0b] font-semibold">{t('Limited offer')}</p>
              <h3 className="mt-3 text-3xl font-black leading-tight">{t('SuperDeals')}</h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs">{t('Save big on selected products')}</p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-light-border dark:border-dark-border px-4 py-2 text-light-text dark:text-dark-text">
                <Clock3 size={16} className="text-red-500" />
                <span className="text-sm font-semibold">{t('Ends in')} {countdown}</span>
              </div>

              <Link href="/products" className="mt-6 inline-flex items-center justify-center rounded-btn bg-[#16a34a] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#15803d]">
                {t('Shop now')}
              </Link>
            </div>

            <div className="relative">
              <button
                onClick={() => dealsRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                className="hidden xl:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/90 dark:bg-dark-card shadow-lg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:scale-105"
                aria-label="Scroll deals left"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={() => dealsRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                className="hidden xl:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/90 dark:bg-dark-card shadow-lg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:scale-105"
                aria-label="Scroll deals right"
              >
                <ChevronRight size={22} />
              </button>

              <div
                ref={dealsRef}
                className="flex gap-4 overflow-x-auto scroll-smooth pb-2 pr-1 snap-x snap-mandatory"
              >
                {dealProducts.map(product => {
                  const sale = getSaleInfo(product);
                  const image = getProductImage(product);
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="min-w-[230px] max-w-[230px] sm:min-w-[250px] sm:max-w-[250px] snap-start group bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-[1.35rem] overflow-hidden shadow-sm hover:shadow-xl transition-all"
                    >
                      <div className="relative h-52 bg-gray-50 dark:bg-slate-800 overflow-hidden">
                        <Image src={image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="250px" />
                        <span className="absolute top-3 left-3 bg-[#f43f5e] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          -{sale.savePct}%
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{t(product.category)}</p>
                        <h4 className="mt-1 text-base font-semibold text-light-text dark:text-dark-text line-clamp-2 min-h-[3rem]">{product.name}</h4>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-xl font-black text-[#f59e0b]">{formatPrice(sale.salePrice)}</span>
                          <span className="text-xs text-gray-400 line-through">{formatPrice(sale.originalPrice)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-[#f59e0b] uppercase tracking-widest mb-1">{t("🇷🇼 Kigali's Online Supermarket")}</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-light-text dark:text-dark-text">
            {t('Featured categories and top products')}
          </h2>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-sm font-semibold text-[#f59e0b] hover:underline shrink-0"
        >
          {t('Browse products')} <ArrowRight size={14} />
        </Link>
      </div>

      {/* Category Grid */}
      <div className="bg-light-bg dark:bg-dark-bg">
        <CategoryGrid categories={categories} />
      </div>

      {/* Delivery promo strip */}
      <div className="mx-4 lg:mx-auto max-w-7xl my-2">
        <div className="rounded-card bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-white">
            <span className="text-2xl">🚚</span>
            <div>
              <p className="font-bold text-sm">{t('Free delivery on your first order')}</p>
              <p className="text-white/60 text-xs">{t('Use code')} <span className="font-mono font-bold text-[#f59e0b]">SIMBA1</span> {t('at checkout')}</p>
            </div>
          </div>
          <Link
            href="/products"
            className="shrink-0 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-sm px-5 py-2 rounded-btn transition-colors"
          >
            {t('Start Shopping')}
          </Link>
        </div>
      </div>

      {/* Featured Products */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-light-text dark:text-dark-text">
                {t('Featured Products')}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('Hand-picked for you today')}</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm text-[#16a34a] font-semibold hover:underline"
            >
              {t('View All')} <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 20).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom value props */}
      <section className="px-4 pb-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🚚', title: t('Fast Delivery'), desc: t('Same-day delivery across Kigali') },
            { icon: '✅', title: t('Verified Products'), desc: t('552 quality-checked items') },
            { icon: '💳', title: t('Easy Payment'), desc: t('MTN MoMo, Airtel & cash') },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-4 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card px-5 py-4"
            >
              <span className="text-3xl">{icon}</span>
              <div>
                <p className="font-semibold text-sm text-light-text dark:text-dark-text">{title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
