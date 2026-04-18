'use client';

import Link from 'next/link';
import { categoryEmojis } from '@/lib/products';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryItem {
  name: string;
  count: number;
}

interface Props {
  categories: CategoryItem[];
}

export default function CategoryGrid({ categories }: Props) {
  const { t } = useLanguage();

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-8 text-center">
          {t('Shop by Category')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.name}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card p-6 flex flex-col items-center gap-3 hover:border-[#16a34a] hover:shadow-md transition-all duration-200"
            >
              <span className="text-4xl">{categoryEmojis[cat.name] ?? '🛒'}</span>
              <div className="text-center">
                <p className="font-semibold text-light-text dark:text-dark-text group-hover:text-[#16a34a] transition-colors">
                  {cat.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {cat.count} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
