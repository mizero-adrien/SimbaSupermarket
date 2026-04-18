'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Truck, ShieldCheck, CreditCard, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CategoryGrid from '@/components/CategoryGrid';
import { useLanguage } from '@/context/LanguageContext';
import { getCategories, deterministicShuffle } from '@/lib/products';
import { Product } from '@/types';
import productsData from '../../public/simba_products.json';

const allProducts = productsData as Product[];

export default function HomePage() {
  const { t } = useLanguage();

  const categories = useMemo(() => getCategories(allProducts), []);

  const featuredProducts = useMemo(() => {
    const shuffled = deterministicShuffle(allProducts, 42);
    return shuffled.slice(0, 12);
  }, []);

  return (
    <div className="page-transition bg-light-bg dark:bg-dark-bg">

      {/* Top trust bar */}
      <div className="bg-[#16a34a] text-white text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <Truck size={13} />
            Free delivery over 50,000 RWF
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <ShieldCheck size={13} />
            Verified products
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard size={13} />
            MTN &amp; Airtel MoMo
          </span>
        </div>
      </div>

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-[#16a34a] uppercase tracking-widest mb-1">🇷🇼 Kigali&apos;s Online Supermarket</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-light-text dark:text-dark-text">
            What are you shopping for today?
          </h1>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-sm font-semibold text-[#16a34a] hover:underline shrink-0"
        >
          Browse all 552 products <ArrowRight size={14} />
        </Link>
      </div>

      {/* Category Grid */}
      <div className="bg-light-bg dark:bg-dark-bg">
        <CategoryGrid categories={categories} />
      </div>

      {/* Delivery promo strip */}
      <div className="mx-4 lg:mx-auto max-w-7xl my-2">
        <div className="rounded-card bg-gradient-to-r from-[#0f172a] to-[#1e3a5f] dark:from-[#1e293b] dark:to-[#0f172a] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-white">
            <span className="text-2xl">🚚</span>
            <div>
              <p className="font-bold text-sm">Free delivery on your first order</p>
              <p className="text-white/60 text-xs">Use code <span className="font-mono font-bold text-[#f59e0b]">SIMBA1</span> at checkout</p>
            </div>
          </div>
          <Link
            href="/products"
            className="shrink-0 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-sm px-5 py-2 rounded-btn transition-colors"
          >
            {t('Shop Now')}
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Hand-picked for you today</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm text-[#16a34a] font-semibold hover:underline"
            >
              View All <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom value props */}
      <section className="px-4 pb-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🚚', title: 'Fast Delivery', desc: 'Same-day delivery across Kigali' },
            { icon: '✅', title: 'Verified Products', desc: '552 quality-checked items' },
            { icon: '💳', title: 'Easy Payment', desc: 'MTN MoMo, Airtel & cash' },
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
