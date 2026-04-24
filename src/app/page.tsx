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
  const { t, language } = useLanguage();
  const tr = (en: string, fr: string, rw: string) =>
    language === 'fr' ? fr : language === 'rw' ? rw : en;
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [branchCount, setBranchCount] = useState(0);
  const [countdown, setCountdown] = useState('00:00:00');
  const dealsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllProducts(getMasterProducts());
    setBranchCount(getAllBranches().length);
  }, []);

  const categories = useMemo(() => getCategories(allProducts), [allProducts]);

  const featuredProducts = useMemo(() => {
    const shuffled = deterministicShuffle(allProducts, 42);
    return shuffled.slice(0, 20);
  }, [allProducts]);

  const dealProducts = useMemo(() => {
    const deals = featuredProducts.filter(product => getSaleInfo(product).onSale);
    return deals.length >= 4 ? deals.slice(0, 8) : featuredProducts.slice(0, 8);
  }, [featuredProducts]);

  useEffect(() => {
    const computeCountdown = () => {
      const nextMidnight = new Date();
      nextMidnight.setHours(23, 59, 59, 999);
      const diff = Math.max(0, nextMidnight.getTime() - Date.now());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown([hours, minutes, seconds].map(value => String(value).padStart(2, '0')).join(':'));
    };

    computeCountdown();
    const timer = window.setInterval(computeCountdown, 1000);
    return () => window.clearInterval(timer);
  }, []);

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
        <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur">
                <ShieldCheck size={13} className="text-amber-400" />
                {tr("Rwanda's trusted supermarket network", 'Réseau de supermarchés de confiance au Rwanda', 'Urusobe rwa supermarket rwizewe mu Rwanda')}
              </div>

              <div className="space-y-3">
                <h1 className="max-w-xl text-3xl md:text-4xl font-black leading-tight text-balance">
                  {tr('Simba Supermarket, built for fast shopping across Kigali.', 'Simba Supermarket, conçu pour des achats rapides à Kigali.', 'Simba Supermarket, yubakiwe guhaha vuba i Kigali.')}
                </h1>
                <p className="max-w-lg text-sm md:text-base text-slate-300">
                  {tr('Fresh groceries, everyday essentials, branch pickup, and fast delivery in one place. Start with the brand people already trust.', 'Produits frais, essentiels du quotidien, retrait en succursale et livraison rapide en un seul endroit. Commencez avec une marque déjà fiable.', 'Ibiribwa bishya, ibikenerwa buri munsi, gufatira ku ishami no koherezwa vuba byose hamwe. Tangira n\'ikirango abantu basanzwe bizeye.')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-btn bg-[#f59e0b] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#d97706]"
                >
                  <ShoppingCart size={16} />
                  {tr('Start Shopping', 'Commencer vos achats', 'Tangira guhaha')}
                </Link>
                <Link
                  href="/branches"
                  className="inline-flex items-center justify-center gap-2 rounded-btn border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <MapPin size={16} />
                  {tr('Find a Branch', 'Trouver une succursale', 'Shaka ishami')}
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {[
                  { value: `${branchCount}+`, label: tr('Branches across Rwanda', 'Succursales à travers le Rwanda', 'Amashami hirya no hino mu Rwanda') },
                  { value: '45 min', label: tr('Fast Kigali delivery', 'Livraison rapide à Kigali', 'Kohereza vuba i Kigali') },
                  { value: 'MoMo', label: tr('Easy payment options', 'Options de paiement faciles', 'Uburyo bworoshye bwo kwishyura') },
                ].map(item => (
                  <div key={item.label} className="rounded-card border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                    <p className="text-lg font-extrabold text-white">{item.value}</p>
                    <p className="text-xs text-slate-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-amber-400/20 blur-2xl" />
              <div className="absolute -right-6 bottom-0 h-32 w-32 rounded-full bg-sky-400/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-900/80 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">{tr('Trusted by', 'Approuvé par', 'Byizewe na')}</p>
                    <p className="mt-2 text-2xl font-black text-white">{tr('Shoppers', 'Clients', 'Abaguzi')}</p>
                    <p className="mt-1 text-sm text-slate-300">{tr('From city center to neighborhood branches.', 'Du centre-ville aux succursales de quartier.', 'Kuva hagati mu mujyi kugera ku mashami yo mu duce.')}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-500/15 p-4 border border-amber-400/20">
                    <p className="text-xs uppercase tracking-wide text-amber-300">{tr('Quick start', 'Démarrage rapide', 'Gutangira vuba')}</p>
                    <p className="mt-2 text-2xl font-black text-white">1 click</p>
                    <p className="mt-1 text-sm text-slate-300">{tr('Browse, choose, and checkout fast.', 'Parcourez, choisissez et payez rapidement.', 'Reba, hitamo kandi wishyure vuba.')}</p>
                  </div>
                  <div className="col-span-2 rounded-2xl bg-slate-900/80 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">{tr('Best for', 'Idéal pour', 'Bikwiriye')}</p>
                      <p className="mt-1 text-lg font-bold text-white">{tr('Fresh products, pickup, and home delivery', 'Produits frais, retrait et livraison à domicile', 'Ibiribwa bishya, gufata no kohereza mu rugo')}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs text-slate-200">
                      <CreditCard size={14} className="text-amber-400" />
                      MTN / Airtel MoMo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="border-b border-light-border dark:border-dark-border bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5"><Truck size={13} className="text-[#f59e0b]" /> {tr('Free delivery over 50,000 RWF', 'Livraison gratuite au-delà de 50 000 RWF', 'Kohereza ubuntu hejuru ya 50,000 RWF')}</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#f59e0b]" /> {tr('Verified products', 'Produits vérifiés', 'Ibicuruzwa byagenzuwe')}</span>
          <span className="flex items-center gap-1.5"><CreditCard size={13} className="text-[#f59e0b]" /> MTN &amp; Airtel MoMo</span>
        </div>
      </div>

      {/* Today's deals */}
      <section className="px-4 pt-8 pb-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-light-text dark:text-dark-text">
                {tr("Today's deals", 'Offres du jour', 'Imyanya y\'uyu munsi')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tr('Top picks, limited time', 'Meilleurs choix, offre limitée', 'Ibyiza byatoranyijwe, igihe gito')}</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#16a34a] hover:underline hidden sm:inline-flex">
              {t('Shop now')}
            </Link>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-4">
            <div className="rounded-[1.75rem] border border-light-border dark:border-dark-border bg-white dark:bg-dark-card p-6 text-light-text dark:text-dark-text shadow-sm overflow-hidden relative">
              <p className="text-xs uppercase tracking-[0.3em] text-[#f59e0b] font-semibold">{t('Limited offer')}</p>
              <h3 className="mt-3 text-3xl font-black leading-tight">{t('SuperDeals')}</h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs">{tr('Save big on selected products', 'Économisez sur une sélection de produits', 'Uzigame cyane ku bicuruzwa byatoranyijwe')}</p>

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
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{tr(product.category, product.category, product.category)}</p>
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
          <p className="text-xs font-semibold text-[#f59e0b] uppercase tracking-widest mb-1">{tr("🇷🇼 Kigali's Online Supermarket", '🇷🇼 Supermarché en ligne de Kigali', '🇷🇼 Supermarket yo kuri internet i Kigali')}</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-light-text dark:text-dark-text">
            {tr('Featured categories and top products', 'Catégories vedettes et meilleurs produits', 'Ibyiciro byihariye n\'ibicuruzwa byatoranyijwe')}
          </h2>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-sm font-semibold text-[#f59e0b] hover:underline shrink-0"
        >
          {tr('Browse products', 'Parcourir les produits', 'Reba ibicuruzwa')} <ArrowRight size={14} />
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
              <p className="font-bold text-sm">{tr('Free delivery on your first order', 'Livraison gratuite sur votre première commande', 'Kohereza ubuntu ku itegeko ryawe rya mbere')}</p>
              <p className="text-white/60 text-xs">{tr('Use code', 'Utilisez le code', 'Koresha kode')} <span className="font-mono font-bold text-[#f59e0b]">SIMBA1</span> {tr('at checkout', 'au paiement', 'kuri checkout')}</p>
            </div>
          </div>
          <Link
            href="/products"
            className="shrink-0 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-sm px-5 py-2 rounded-btn transition-colors"
          >
            {tr('Start Shopping', 'Commencer vos achats', 'Tangira guhaha')}
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tr('Hand-picked for you today', 'Sélectionnés pour vous aujourd\'hui', 'Byatoranyijwe ku bwawe uyu munsi')}</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm text-[#16a34a] font-semibold hover:underline"
            >
              {t('View All')} <ArrowRight size={13} />
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
            { icon: '🚚', title: tr('Fast Delivery', 'Livraison rapide', 'Kohereza vuba'), desc: tr('Same-day delivery across Kigali', 'Livraison le jour même à Kigali', 'Kohereza uwo munsi muri Kigali') },
            { icon: '✅', title: tr('Verified Products', 'Produits vérifiés', 'Ibicuruzwa byagenzuwe'), desc: tr('552 quality-checked items', '552 articles contrôlés', 'Ibicuruzwa 552 byagenzuwe') },
            { icon: '💳', title: tr('Easy Payment', 'Paiement facile', 'Kwishyura byoroshye'), desc: tr('MTN MoMo, Airtel & cash', 'MTN MoMo, Airtel et espèces', 'MTN MoMo, Airtel n\'amafaranga') },
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
