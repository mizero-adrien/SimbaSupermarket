'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Grid2X2, Search, ShoppingCart, User, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getMasterProducts } from '@/lib/productData';
import { translateCategory } from '@/lib/translations';
import { Product } from '@/types';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    setProducts(getMasterProducts());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length > 1) {
        const q = query.toLowerCase();
        setResults(
          products
            .filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
            .slice(0, 6)
        );
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, products]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false);
    setQuery('');
    setResults([]);
  }, [pathname]);

  function closeSearch() {
    setSearchOpen(false);
    setQuery('');
    setResults([]);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      closeSearch();
    }
  }

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : (pathname ?? '').startsWith(path);

  const navItems = [
    { label: t('Home'), icon: Home, href: '/' },
    { label: t('Products'), icon: Grid2X2, href: '/products' },
    { label: t('Search'), icon: Search, href: null },
    { label: t('Cart'), icon: ShoppingCart, href: '/cart' },
    {
      label: user ? (user.role === 'customer' ? t('Profile') : t('Dashboard')) : t('Login'),
      icon: User,
      href: user ? (user.role === 'customer' ? '/about' : '/dashboard') : '/auth/login',
    },
  ];

  return (
    <>
      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeSearch} />

          {/* Search panel — slides up from bottom */}
          <div className="absolute bottom-16 left-0 right-0 bg-white dark:bg-dark-card rounded-t-2xl shadow-2xl overflow-hidden">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 px-4 py-4 border-b border-light-border dark:border-dark-border">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`${t('Search')} 552 ${t('products')}...`}
                className="flex-1 text-base bg-transparent text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none"
              />
              <button type="button" onClick={closeSearch} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </form>

            {results.length > 0 && (
              <ul className="max-h-72 overflow-y-auto divide-y divide-light-border dark:divide-dark-border">
                {results.map(p => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.id}`}
                      onClick={closeSearch}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 active:bg-gray-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-light-text dark:text-dark-text line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category}</p>
                      </div>
                      <span className="text-xs text-[#f59e0b] font-semibold shrink-0 ml-2">
                        {new Intl.NumberFormat('en-RW').format(p.price)} RWF
                      </span>
                    </Link>
                  </li>
                ))}
                {query.trim().length > 1 && (
                  <li>
                    <Link
                      href={`/products?search=${encodeURIComponent(query)}`}
                      onClick={closeSearch}
                      className="block px-4 py-3 text-sm text-[#16a34a] font-semibold bg-gray-50 dark:bg-slate-800 text-center"
                    >
                        {t('View All')} &ldquo;{query}&rdquo; →
                    </Link>
                  </li>
                )}
              </ul>
            )}

            {query.trim().length > 1 && results.length === 0 && (
                <p className="px-4 py-5 text-sm text-center text-gray-400">{t('No results found')} &ldquo;{query}&rdquo;</p>
            )}

            {query.trim().length === 0 && (
              <div className="px-4 py-4">
                  <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">{t('Popular Categories')}</p>
                <div className="flex flex-wrap gap-2">
                  {['Beverages', 'Dairy', 'Snacks', 'Fruits & Vegetables', 'Meat & Fish'].map(cat => (
                    <Link
                      key={cat}
                      href={`/products?category=${encodeURIComponent(cat)}`}
                      onClick={closeSearch}
                      className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-[#16a34a] hover:text-white transition-colors"
                    >
                        {translateCategory(cat, language)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-dark-card border-t border-light-border dark:border-dark-border">
        <div className="flex items-stretch h-16">
          {navItems.map(({ label, icon: Icon, href }) => {
            const active = href ? isActive(href) : searchOpen;

            if (!href) {
              // Search button
              return (
                <button
                  key={label}
                  onClick={() => setSearchOpen(v => !v)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 relative"
                  aria-label="Search"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    searchOpen ? 'bg-[#16a34a] text-white' : 'text-gray-400'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <span className={`text-[10px] font-medium leading-none ${searchOpen ? 'text-[#16a34a]' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={label}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative"
                aria-label={label}
              >
                {/* Cart badge */}
                {label === 'Cart' && totalItems > 0 && (
                  <span className="absolute top-2 right-1/2 translate-x-3 bg-[#f59e0b] text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 leading-none">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  active ? 'bg-[#16a34a]/10 text-[#16a34a]' : 'text-gray-400'
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`text-[10px] font-medium leading-none ${active ? 'text-[#16a34a]' : 'text-gray-400'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
        {/* Safe area spacer for iOS */}
        <div className="h-safe-bottom bg-white dark:bg-dark-card" />
      </nav>

      {/* Push page content up so bottom nav doesn't overlap — mobile only */}
      <div className="md:hidden h-16" aria-hidden="true" />
    </>
  );
}
