'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Search,
  X,
  Sun,
  Moon,
  ChevronDown,
  Globe,
  Loader2,
  UserRound,
  LayoutDashboard,
  Package,
  CreditCard,
  LifeBuoy,
  LogOut,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getMasterProducts } from '@/lib/productData';
import { formatPrice } from '@/lib/formatPrice';
import { Language } from '@/types';
import { Product } from '@/types';
import FloatingAiAssistant from '@/components/FloatingAiAssistant';

export default function Navbar() {
  const { totalItems } = useCart();
  const { language, setLanguage, t, translateCategory } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [aiReply, setAiReply] = useState('');
  const [aiError, setAiError] = useState('');
  const [aiResults, setAiResults] = useState<Product[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setProducts(getMasterProducts());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setAiQuery('');
        setAiReply('');
        setAiError('');
        setAiResults([]);
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
  const quickCategories = categories.slice(0, 10);
  const profileInitial = user?.name?.trim()?.charAt(0).toUpperCase() ?? '';

  async function runAiSearch(query: string) {
    const clean = query.trim();
    if (clean.length < 2) {
      setAiError('Type a bit more so I can help you find products.');
      return;
    }

    setAiError('');
    setAiReply('');
    setAiResults([]);
    setAiLoading(true);

    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: clean }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAiError(data?.error ?? 'Search failed. Please try again.');
        return;
      }

      setAiReply(data.reply ?? 'Here are your best product matches.');
      setAiResults(Array.isArray(data.products) ? data.products : []);
    } catch {
      setAiError('I could not reach AI search right now. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-navy/90 backdrop-blur-md border-b border-light-border dark:border-dark-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-center gap-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#16a34a] shrink-0">
          Simba
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-5 shrink-0">
          <Link href="/" className="text-sm font-medium text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors whitespace-nowrap">
            {t('Home')}
          </Link>
          <Link href="/products" className="text-sm font-medium text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors whitespace-nowrap">
            {t('Products')}
          </Link>
          <Link href="/about" className="text-sm font-medium text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors whitespace-nowrap">
            {t('About Us')}
          </Link>
          <Link href="/branches" className="text-sm font-medium text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors whitespace-nowrap">
            {t('Branches')}
          </Link>
        </div>

        {/* Persistent search bar — desktop */}
        <div ref={searchRef} className="hidden md:block flex-1 max-w-xl relative">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); void runAiSearch(aiQuery); }
                if (e.key === 'Escape') { setSearchOpen(false); setAiQuery(''); setAiReply(''); setAiError(''); setAiResults([]); }
              }}
              placeholder={t('Search products...')}
              className="w-full pl-9 pr-20 py-2 text-sm border border-light-border dark:border-dark-border rounded-full bg-gray-50 dark:bg-slate-800 text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none focus:border-[#16a34a] focus:bg-white dark:focus:bg-dark-card transition-colors"
              aria-label="Search products"
            />
            {aiQuery && (
              <button
                onClick={() => { setAiQuery(''); setAiReply(''); setAiError(''); setAiResults([]); setSearchOpen(false); }}
                className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
            <button
              onClick={() => void runAiSearch(aiQuery)}
              disabled={aiLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 disabled:opacity-60 transition-colors"
            >
              {aiLoading ? <Loader2 size={12} className="animate-spin" /> : 'Search'}
            </button>
          </div>

          {/* Search dropdown */}
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card shadow-xl z-50 overflow-hidden">
              {/* AI suggestions row */}
              {!aiQuery && (
                <div className="px-4 py-3 border-b border-light-border dark:border-dark-border">
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Try asking</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Fresh milk', 'Baby products', 'Breakfast options', 'Snacks under 2000'].map(s => (
                      <button key={s} onClick={() => { setAiQuery(s); void runAiSearch(s); }}
                        className="text-[11px] px-2.5 py-1 rounded-full border border-light-border dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-[#16a34a] hover:text-[#16a34a] transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiLoading && (
                <div className="flex items-center gap-2 px-4 py-3 text-xs text-gray-500">
                  <Loader2 size={13} className="animate-spin text-[#16a34a]" /> Searching…
                </div>
              )}

              {aiError && <p className="px-4 py-3 text-xs text-red-500">{aiError}</p>}
              {aiReply && <p className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 border-b border-light-border dark:border-dark-border">{aiReply}</p>}

              {aiResults.length > 0 && (
                <ul className="max-h-64 overflow-y-auto divide-y divide-light-border dark:divide-dark-border">
                  {aiResults.map(product => (
                    <li key={product.id}>
                      <Link href={`/products/${product.id}`}
                        onClick={() => { setSearchOpen(false); setAiQuery(''); setAiReply(''); setAiError(''); setAiResults([]); }}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-light-text dark:text-dark-text line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{translateCategory(product.category)}</p>
                        </div>
                        <span className="text-xs font-semibold text-[#f59e0b] shrink-0 ml-3">{formatPrice(product.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {!aiLoading && aiReply && aiResults.length === 0 && (
                <p className="px-4 py-3 text-xs text-gray-400">No exact matches. Try different keywords.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <div className="hidden md:flex items-center gap-2 mr-1">
            {user ? (
              <div className="relative group">
                <button
                  className="h-10 w-10 rounded-full border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-sm flex items-center justify-center overflow-hidden hover:border-[#16a34a] transition-colors"
                  aria-label="Open profile menu"
                >
                  {profileInitial ? (
                    <span className="text-sm font-bold text-[#16a34a]">{profileInitial}</span>
                  ) : (
                    <UserRound size={18} className="text-gray-500" />
                  )}
                </button>

                <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 z-50">
                  <div className="w-56 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card shadow-xl py-2">
                    <div className="px-4 pb-2 mb-1 border-b border-light-border dark:border-dark-border">
                      <p className="text-sm font-semibold text-light-text dark:text-dark-text line-clamp-1">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{user.email}</p>
                    </div>

                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-[#16a34a] transition-colors">
                      <LayoutDashboard size={15} /> {t('Dashboard')}
                    </Link>
                    <Link href="/dashboard/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-[#16a34a] transition-colors">
                      <Package size={15} /> {t('My Orders')}
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-[#16a34a] transition-colors">
                      <CreditCard size={15} /> {t('Payment Settings')}
                    </Link>
                    <Link href="/about" className="flex items-center gap-2 px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-[#16a34a] transition-colors">
                      <LifeBuoy size={15} /> {t('Help Center')}
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <LogOut size={15} /> {t('Logout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="px-3 py-1.5 text-xs font-semibold rounded-btn text-light-text dark:text-dark-text border border-light-border dark:border-dark-border hover:border-[#16a34a] hover:text-[#16a34a] transition-colors">
                  {t('Login')}
                </Link>
                <Link href="/auth/signup" className="px-3 py-1.5 text-xs font-semibold rounded-btn text-white bg-black hover:bg-gray-900 transition-colors">
                  {t('Sign Up')}
                </Link>
              </>
            )}
          </div>


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
                    onClick={() => {
                      setLanguage(code);
                      setLangOpen(false);
                    }}
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

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

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

      <div className="hidden md:block border-t border-light-border dark:border-dark-border bg-white/80 dark:bg-navy/80">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-11 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Link href="/products" className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#f59e0b] text-white hover:bg-[#d97706] transition-colors">
              {t('All Categories')}
            </Link>
            {quickCategories.map(cat => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-[#16a34a] hover:text-[#16a34a] hover:bg-[#16a34a]/5 transition-colors"
              >
                {translateCategory(cat)}
              </Link>
            ))}
          </div>
        </div>
      </div>

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
            <Link href="/branches" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-light-text dark:text-dark-text">
              {t('Branches')}
            </Link>
            {!user ? (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-light-text dark:text-dark-text">
                  {t('Login')}
                </Link>
                <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="inline-flex w-fit px-3 py-1.5 rounded-btn text-sm font-semibold text-white bg-black hover:bg-gray-900 transition-colors">
                  {t('Sign Up')}
                </Link>
              </>
            ) : (
              <>
                {user.role !== 'customer' && (
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-light-text dark:text-dark-text">
                    {t('Dashboard')}
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="text-sm font-medium text-red-500 text-left"
                >
                  {t('Logout')}
                </button>
              </>
            )}
            <Link href="/cart" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-light-text dark:text-dark-text">
              {t('Cart')} {totalItems > 0 && `(${totalItems})`}
            </Link>
            <div className="pt-2 border-t border-light-border dark:border-dark-border">
              <p className="text-xs text-gray-500 mb-2">{t('Language')}</p>
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

      <FloatingAiAssistant />
    </nav>
  );
}
