'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import { useLanguage } from '@/context/LanguageContext';
import { getCategories } from '@/lib/products';
import { Product, SortOption } from '@/types';
import productsData from '../../../public/simba_products.json';

const allProducts = productsData as Product[];
const allCategories = getCategories(allProducts);
const PER_PAGE = 24;

function ProductsContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? [searchParams.get('category')!] : []
  );
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [debouncedQuery, selectedCategories, minPrice, maxPrice, sortBy]);

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }
    if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
    }
    return result;
  }, [debouncedQuery, selectedCategories, minPrice, maxPrice, sortBy]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
    setSearchQuery('');
  }, []);

  const hasActiveFilters = selectedCategories.length > 0 || minPrice || maxPrice || debouncedQuery;

  const Sidebar = () => (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-light-text dark:text-dark-text">{t('Filter')}</h3>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-xs text-[#16a34a] hover:underline font-medium">
            Reset all
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Sort By</label>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortOption)}
          className="w-full text-sm border border-light-border dark:border-dark-border rounded-btn px-3 py-2 bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a]"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A-Z</option>
          <option value="name-desc">Name: Z-A</option>
        </select>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Categories</label>
        <div className="space-y-2">
          {allCategories.map(({ name, count }) => (
            <label key={name} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(name)}
                onChange={() => toggleCategory(name)}
                className="w-4 h-4 accent-[#16a34a] rounded"
              />
              <span className="text-sm text-light-text dark:text-dark-text group-hover:text-[#16a34a] transition-colors flex-1">{name}</span>
              <span className="text-xs text-gray-400">({count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t('Price')} Range (RWF)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            className="w-full text-sm border border-light-border dark:border-dark-border rounded-btn px-2 py-2 bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a]"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            className="w-full text-sm border border-light-border dark:border-dark-border rounded-btn px-2 py-2 bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a]"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg page-transition">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-6">{t('All Products')}</h1>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5 sticky top-20">
              <Sidebar />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search + mobile filter trigger */}
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search ${allProducts.length} products...`}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a]"
                />
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-sm font-medium text-light-text dark:text-dark-text"
              >
                <SlidersHorizontal size={16} />
                {t('Filter')}
              </button>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {debouncedQuery && (
                  <span className="flex items-center gap-1 bg-[#16a34a]/10 text-[#16a34a] text-xs font-medium px-3 py-1 rounded-full">
                    Search: {debouncedQuery}
                    <button onClick={() => setSearchQuery('')}><X size={12} /></button>
                  </span>
                )}
                {selectedCategories.map(cat => (
                  <span key={cat} className="flex items-center gap-1 bg-[#16a34a]/10 text-[#16a34a] text-xs font-medium px-3 py-1 rounded-full">
                    {cat}
                    <button onClick={() => toggleCategory(cat)}><X size={12} /></button>
                  </span>
                ))}
                {minPrice && (
                  <span className="flex items-center gap-1 bg-[#16a34a]/10 text-[#16a34a] text-xs font-medium px-3 py-1 rounded-full">
                    Min: {minPrice} RWF
                    <button onClick={() => setMinPrice('')}><X size={12} /></button>
                  </span>
                )}
                {maxPrice && (
                  <span className="flex items-center gap-1 bg-[#16a34a]/10 text-[#16a34a] text-xs font-medium px-3 py-1 rounded-full">
                    Max: {maxPrice} RWF
                    <button onClick={() => setMaxPrice('')}><X size={12} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Results count */}
            <p className="text-sm text-gray-500 mb-4">
              Showing {paginated.length} of {filtered.length} products
              {filtered.length !== allProducts.length && ` (filtered from ${allProducts.length})`}
            </p>

            {/* Product grid */}
            {paginated.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">No products found</p>
                <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search terms.</p>
                <button onClick={resetFilters} className="bg-[#16a34a] text-white px-6 py-2 rounded-btn text-sm font-semibold hover:bg-green-700 transition-colors">
                  Clear Filters
                </button>
              </div>
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={p => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </div>
        </div>
      </div>

      {/* Mobile sidebar bottom sheet */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-card rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-light-text dark:text-dark-text">Filters</h3>
              <button onClick={() => setSidebarOpen(false)} className="p-1"><X size={20} /></button>
            </div>
            <Sidebar />
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full mt-4 bg-[#16a34a] text-white py-3 rounded-btn font-semibold hover:bg-green-700 transition-colors"
            >
              Apply Filters ({filtered.length} results)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
