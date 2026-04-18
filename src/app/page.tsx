'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ShoppingBag, Grid3X3 } from 'lucide-react';
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
    <div className="page-transition">
      {/* Hero Section */}
      <section className="relative hero-section py-20 px-4 overflow-hidden">
        {/* Light mode blobs */}
        <div className="absolute inset-0 opacity-40 dark:hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#16a34a] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#f59e0b] rounded-full blur-3xl" />
        </div>
        {/* Dark mode blobs */}
        <div className="absolute inset-0 opacity-10 hidden dark:block">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#16a34a] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#f59e0b] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block bg-[#16a34a]/20 dark:bg-[#16a34a]/20 border border-[#16a34a]/40 dark:border-[#16a34a]/30 rounded-full px-4 py-1 text-[#166534] dark:text-[#4ade80] text-sm font-medium mb-6">
            🇷🇼 Rwanda&apos;s Premier Online Supermarket
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-balance text-[#0f172a] dark:text-white">
            Rwanda&apos;s Freshest{' '}
            <span className="text-[#16a34a]">Online Supermarket</span>
          </h1>
          <p className="text-lg md:text-xl text-[#166534] dark:text-gray-300 mb-8 max-w-2xl mx-auto font-medium">
            552 products delivered to your door in Kigali. Shop groceries, fresh produce, and more with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold px-8 py-3 rounded-btn transition-colors shadow-lg"
            >
              <ShoppingBag size={18} />
              {t('Shop Now')}
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 border-2 border-[#0f172a] dark:border-white/40 hover:border-[#16a34a] dark:hover:border-white text-[#0f172a] dark:text-white font-semibold px-8 py-3 rounded-btn transition-colors"
            >
              <Grid3X3 size={18} />
              {t('Browse Categories')}
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-[#166534] dark:text-gray-400 font-medium">
            <span className="flex items-center gap-2">🚚 Fast Delivery</span>
            <span className="flex items-center gap-2">✅ Verified Products</span>
            <span className="flex items-center gap-2">💳 MoMo Payment</span>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <div className="bg-light-bg dark:bg-dark-bg">
        <CategoryGrid categories={categories} />
      </div>

      {/* Featured Products */}
      <section className="py-12 px-4 bg-white dark:bg-dark-card">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
              {t('Featured Products')}
            </h2>
            <Link
              href="/products"
              className="text-sm text-[#16a34a] font-semibold hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-10 px-4 bg-[#16a34a]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
          <p className="text-lg font-semibold text-center sm:text-left">
            🚚 Free delivery on orders over <strong>50,000 RWF</strong>
          </p>
          <Link
            href="/products"
            className="bg-white text-[#16a34a] font-bold px-6 py-2 rounded-btn hover:bg-gray-100 transition-colors shrink-0"
          >
            {t('Shop Now')}
          </Link>
        </div>
      </section>
    </div>
  );
}
