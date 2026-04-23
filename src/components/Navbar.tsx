'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, X, Sun, Moon, ChevronDown, Globe, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getMasterProducts } from '@/lib/productData';
import { formatPrice } from '@/lib/formatPrice';
import { translateCategory } from '@/lib/translations';
import { Language } from '@/types';
import { Product } from '@/types';

export default function Navbar() {
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();
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

  useEffect(() => { setMounted(true); }, []);

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
        headers: {
          'Content-Type': 'application/json',
        },
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
          <Link href="/branches" className="text-sm font-medium text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors">
            {t('Branches')}
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
                    {translateCategory(cat, language)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Auth actions */}
          <div className="hidden md:flex items-center gap-2 mr-1">
            {user ? (
              <>
                {user.role !== 'customer' && (
                  <Link
                    href="/dashboard"
                    className="px-3 py-1.5 text-xs font-semibold rounded-btn text-[#16a34a] border border-[#16a34a]/40 hover:bg-[#16a34a]/10 transition-colors"
                  >
                    {t('Dashboard')}
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-semibold rounded-btn text-red-500 border border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  {t('Logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 text-xs font-semibold rounded-btn text-light-text dark:text-dark-text border border-light-border dark:border-dark-border hover:border-[#16a34a] hover:text-[#16a34a] transition-colors"
                >
                  {t('Login')}
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-3 py-1.5 text-xs font-semibold rounded-btn text-white bg-[#16a34a] hover:bg-[#15803d] transition-colors"
                >
                  {t('Sign Up')}
                </Link>
              </>
            )}
          </div>

          {/* Search */}
          <div ref={searchRef} className="relative">
            {searchOpen ? (
              <div className="absolute top-0 right-0 w-[340px] md:w-[420px] bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card shadow-xl p-3 z-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[#16a34a]">AI Product Assistant</p>
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setAiQuery('');
                      setAiReply('');
                      setAiError('');
                      setAiResults([]);
                    }}
                    className="p-1 text-gray-500"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void runAiSearch(aiQuery);
                      }
                    }}
                    placeholder="Ask naturally: Do you have fresh milk?"
                    className="flex-1 px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a]"
                    aria-label="Conversational product search"
                  />
                  <button
                    onClick={() => void runAiSearch(aiQuery)}
                    disabled={aiLoading}
                    className="px-3 py-2 text-xs font-semibold rounded-btn bg-[#16a34a] text-white hover:bg-[#15803d] disabled:opacity-60"
                  >
                    {aiLoading ? 'Searching...' : 'Ask'}
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['I need breakfast options', 'Do you have fresh milk?', 'Show baby products'].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setAiQuery(suggestion);
                        void runAiSearch(suggestion);
                      }}
                      className="text-[11px] px-2 py-1 rounded-full border border-light-border dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-[#16a34a] hover:text-[#16a34a]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {aiLoading && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <Loader2 size={14} className="animate-spin" />
                    Thinking through your request...
                  </div>
                )}

                {aiError && (
                  <p className="mt-3 text-xs text-red-600 dark:text-red-400">{aiError}</p>
                )}

                {aiReply && (
                  <p className="mt-3 text-sm text-light-text dark:text-dark-text">{aiReply}</p>
                )}

                {aiResults.length > 0 && (
                  <div className="mt-3 border border-light-border dark:border-dark-border rounded-btn overflow-hidden">
                    {aiResults.map(product => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setAiQuery('');
                          setAiReply('');
                          setAiError('');
                          setAiResults([]);
                        }}
                        className="block px-3 py-2 border-b last:border-b-0 border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <p className="text-sm font-medium text-light-text dark:text-dark-text line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500">{translateCategory(product.category, language)} • {formatPrice(product.price)}</p>
                      </Link>
                    ))}
                  </div>
                )}

                {!aiLoading && aiReply && aiResults.length === 0 && (
                  <p className="mt-3 text-xs text-gray-500">No exact products found. Try another request.</p>
                )}
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors"
                aria-label="Open AI product search"
              >
                <Search size={18} />
              </button>
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

      {/* Category quick links bar */}
      <div className="hidden md:block border-t border-light-border dark:border-dark-border bg-white/80 dark:bg-navy/80">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-11 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Link
              href="/products"
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#f59e0b] text-white hover:bg-[#d97706] transition-colors"
            >
              {t('All Categories')}
            </Link>
            {quickCategories.map(cat => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-[#16a34a] hover:text-[#16a34a] hover:bg-[#16a34a]/5 transition-colors"
              >
                {translateCategory(cat, language)}
              </Link>
            ))}
          </div>
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
            <Link href="/branches" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-light-text dark:text-dark-text">
              {t('Branches')}
            </Link>
            {!user ? (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-light-text dark:text-dark-text">
                  {t('Login')}
                </Link>
                <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-[#16a34a]">
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
    </nav>
  );
}
