'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, X, Sun, Moon, ChevronDown, Globe } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/types';
import productsData from '../../public/simba_products.json';
import { Product } from '@/types';

const products = productsData as Product[];

export default function Navbar() {
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        const q = searchQuery.toLowerCase();
        setSearchResults(
          products.filter(p =>
            p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
          ).slice(0, 6)
        );
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const langs: { code: Language; label: string; full: string }[] = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'fr', label: 'FR', full: 'Français' },
    { code: 'rw', label: 'RW', full: 'Kinyarwanda' },
  ];

  const currentLang = langs.find(l => l.code === language)!;

  return (
    <nav className="sticky top-0 z-40 h-16 bg-white/90 dark:bg-navy/90 backdrop-blur-md border-b border-light-border dark:border-dark-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#16a34a] shrink-0">
          🛒 Simba
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <Link href="/" className="text-sm font-medium text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors">
            {t('Home')}
          </Link>
          <Link href="/products" className="text-sm font-medium text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors">
            {t('Products')}
          </Link>
          <Link href="/about" className="text-sm font-medium text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors">
            {t('About Us')}
          </Link>

          {/* Categories — hover to open */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-medium text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors py-5">
              {t('Categories')}
              <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
            </button>
            {/* Dropdown: visible on group hover */}
            <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
              <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card shadow-xl py-2 min-w-[200px]">
                {categories.map(cat => (
                  <Link
                    key={cat}
                    href={`/products?category=${encodeURIComponent(cat)}`}
                    className="block px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-[#16a34a] transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Search */}
          <div ref={searchRef} className="relative">
            {searchOpen ? (
              <div className="flex items-center">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('Search products...')}
                  className="w-48 md:w-64 px-3 py-1.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a]"
                  aria-label="Search products"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }} className="ml-1 p-1 text-gray-500">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors"
                aria-label="Open search"
              >
                <Search size={18} />
              </button>
            )}
            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="absolute top-10 right-0 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card shadow-xl py-2 w-72 z-50">
                <p className="px-4 py-1 text-xs text-gray-500">{searchResults.length} results found</p>
                {searchResults.map(p => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-light-text dark:text-dark-text line-clamp-1">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.category}</p>
                    </div>
                  </Link>
                ))}
                {searchQuery.trim().length > 1 && (
                  <Link
                    href={`/products?search=${encodeURIComponent(searchQuery)}`}
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                    className="block px-4 py-2 text-xs text-[#16a34a] font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 border-t border-light-border dark:border-dark-border"
                  >
                    See all results →
                  </Link>
                )}
              </div>
            )}
            {searchOpen && searchQuery.trim().length > 1 && searchResults.length === 0 && (
              <div className="absolute top-10 right-0 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card shadow-xl py-4 w-60 z-50 text-center text-sm text-gray-500">
                No results found
              </div>
            )}
          </div>

          {/* Language dropdown */}
          <div ref={langRef} className="relative hidden sm:block">
            <button
              onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-btn border border-light-border dark:border-dark-border text-xs font-semibold text-light-text dark:text-dark-text hover:border-[#16a34a] hover:text-[#16a34a] transition-colors"
              aria-label="Select language"
              aria-expanded={langOpen}
            >
              <Globe size={13} />
              {currentLang.label}
              <ChevronDown size={11} className={`transition-transform duration-150 ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card shadow-xl py-1 min-w-[140px] z-50">
                {langs.map(({ code, label, full }) => (
                  <button
                    key={code}
                    onClick={() => { setLanguage(code); setLangOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                      language === code
                        ? 'text-[#16a34a] font-semibold bg-[#16a34a]/5'
                        : 'text-light-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{full}</span>
                    <span className="text-xs font-bold text-gray-400">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark mode toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          {/* Cart icon — desktop only; mobile uses BottomNav */}
          <Link href="/cart" className="hidden md:flex relative p-2 text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors" aria-label={`Cart, ${totalItems} items`}>
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#f59e0b] text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-card border-t border-light-border dark:border-dark-border shadow-lg">
          <div className="px-4 py-4 flex flex-col gap-4">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-light-text dark:text-dark-text">
              {t('Home')}
            </Link>
            <Link href="/products" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-light-text dark:text-dark-text">
              {t('Products')}
            </Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-light-text dark:text-dark-text">
              {t('About Us')}
            </Link>
            <Link href="/cart" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-light-text dark:text-dark-text">
              {t('Cart')} {totalItems > 0 && `(${totalItems})`}
            </Link>
            <div className="pt-2 border-t border-light-border dark:border-dark-border">
              <p className="text-xs text-gray-500 mb-2">Language</p>
              <div className="flex gap-2">
                {langs.map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => setLanguage(code)}
                    className={`px-3 py-1 text-xs font-semibold rounded-btn border ${
                      language === code
                        ? 'bg-[#16a34a] text-white border-[#16a34a]'
                        : 'border-light-border dark:border-dark-border text-light-text dark:text-dark-text'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
