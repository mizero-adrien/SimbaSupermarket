'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, ShoppingCart, ArrowLeft, CheckCircle, Truck, RotateCcw } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/formatPrice';
import { getProductImage } from '@/lib/products';
import { Product } from '@/types';
import productsData from '../../../../public/simba_products.json';

const allProducts = productsData as Product[];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(() => allProducts.find(p => String(p.id) === id), [id]);

  const related = useMemo(() => {
    if (!product) return [];
    return allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-5xl">🔍</p>
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Product not found</h2>
        <Link href="/products" className="bg-[#16a34a] text-white px-6 py-2 rounded-btn font-semibold hover:bg-green-700 transition-colors">
          {t('Continue Shopping')}
        </Link>
      </div>
    );
  }

  const image = getProductImage(product);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg page-transition">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#16a34a] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#16a34a] transition-colors">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#16a34a] transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-light-text dark:text-dark-text font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Main product layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Image */}
          <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border overflow-hidden">
            <div className="relative h-80 md:h-[400px]">
              <Image
                src={image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="inline-block bg-[#16a34a] text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mb-4">
              {product.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text mb-3 leading-tight">
              {product.name}
            </h1>
            <p className="text-3xl font-extrabold text-[#f59e0b] mb-4">
              {formatPrice(product.price)}
            </p>
            <div className="flex items-center gap-2 text-[#16a34a] text-sm font-medium mb-6">
              <CheckCircle size={16} />
              {t('In Stock')}
            </div>

            <hr className="border-light-border dark:border-dark-border mb-6" />

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-light-text dark:text-dark-text">Quantity:</span>
              <div className="flex items-center border border-light-border dark:border-dark-border rounded-btn overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center text-sm font-semibold bg-transparent text-light-text dark:text-dark-text border-x border-light-border dark:border-dark-border focus:outline-none"
                  min={1}
                />
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold py-3 rounded-btn transition-colors mb-3 text-base"
            >
              <ShoppingCart size={18} />
              {t('Add to Cart')}
            </button>
            <Link
              href="/products"
              className="w-full flex items-center justify-center gap-2 border-2 border-light-border dark:border-dark-border hover:border-[#16a34a] text-light-text dark:text-dark-text font-semibold py-3 rounded-btn transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              {t('Continue Shopping')}
            </Link>

            <hr className="border-light-border dark:border-dark-border my-6" />

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-light-text dark:text-dark-text mb-2">Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Tags / policies */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-btn px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                <Truck size={14} className="text-[#16a34a]" />
                Delivery in 1-2 days
              </div>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-btn px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                <RotateCcw size={14} className="text-[#16a34a]" />
                Easy returns
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">
              More from {product.category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
