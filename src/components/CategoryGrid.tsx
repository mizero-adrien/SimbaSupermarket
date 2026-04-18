'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryItem {
  name: string;
  count: number;
}

interface Props {
  categories: CategoryItem[];
}

const categoryMeta: Record<string, { emoji: string; image: string; color: string }> = {
  'Beverages':         { emoji: '🥤', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=400&fit=crop', color: '#0ea5e9' },
  'Dairy':             { emoji: '🥛', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&h=400&fit=crop', color: '#f59e0b' },
  'Snacks':            { emoji: '🍿', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=400&fit=crop', color: '#ef4444' },
  'Grains & Cereals':  { emoji: '🌾', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop', color: '#d97706' },
  'Household':         { emoji: '🏠', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', color: '#8b5cf6' },
  'Personal Care':     { emoji: '🧴', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=400&fit=crop', color: '#ec4899' },
  'Fruits & Vegetables': { emoji: '🥦', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&h=400&fit=crop', color: '#16a34a' },
  'Meat & Fish':       { emoji: '🥩', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&h=400&fit=crop', color: '#dc2626' },
  'Baby Products':     { emoji: '👶', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop', color: '#f472b6' },
};

const fallback = { emoji: '🛒', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop', color: '#16a34a' };

export default function CategoryGrid({ categories }: Props) {
  const { t } = useLanguage();

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
            {t('Shop by Category')}
          </h2>
          <Link href="/products" className="text-sm text-[#16a34a] font-semibold hover:underline hidden sm:block">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map(cat => {
            const meta = categoryMeta[cat.name] ?? fallback;
            return (
              <Link
                key={cat.name}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative overflow-hidden rounded-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Background photo */}
                <div className="relative h-36 sm:h-44 overflow-hidden">
                  <Image
                    src={meta.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    loading="lazy"
                    onError={() => {}}
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Colored top-left accent dot */}
                  <div
                    className="absolute top-3 left-3 w-2 h-2 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white font-bold text-sm leading-tight line-clamp-1">
                          {cat.name}
                        </p>
                        <p className="text-white/70 text-xs mt-0.5">
                          {cat.count} products
                        </p>
                      </div>
                      <span className="text-2xl leading-none">{meta.emoji}</span>
                    </div>
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-white text-xs font-bold">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
