'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/formatPrice';
import { getProductImage, getSaleInfo } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: Props) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const image = getProductImage(product);
  const { onSale, originalPrice, salePrice, savePct } = getSaleInfo(product);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function handleAdd() {
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-white dark:bg-dark-card rounded-card shadow-2xl w-full max-w-lg overflow-hidden modal-enter">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative sm:w-56 h-52 sm:h-auto shrink-0 bg-gray-100 dark:bg-slate-800">
            <Image src={image} alt={product.name} fill className="object-cover" sizes="224px" />
            {onSale && (
              <span className="absolute top-2 left-2 bg-[#f59e0b] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                SALE −{savePct}%
              </span>
            )}
          </div>

          {/* Info */}
          <div className="p-5 flex flex-col flex-1 min-w-0">
            <span className="text-xs text-[#16a34a] font-semibold uppercase tracking-wide mb-1">{product.category}</span>
            <h2 className="text-base font-bold text-light-text dark:text-dark-text leading-snug mb-3">{product.name}</h2>

            {/* Price */}
            <div className="mb-4">
              {onSale ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-red-500">{formatPrice(salePrice)}</span>
                  <span className="text-sm text-gray-400 line-through">{formatPrice(originalPrice)}</span>
                </div>
              ) : (
                <span className="text-xl font-extrabold text-[#f59e0b]">{formatPrice(product.price)}</span>
              )}
            </div>

            {/* Qty selector */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border border-light-border dark:border-dark-border flex items-center justify-center text-light-text dark:text-dark-text hover:border-[#16a34a] hover:text-[#16a34a] transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-bold text-light-text dark:text-dark-text">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-8 h-8 rounded-full border border-light-border dark:border-dark-border flex items-center justify-center text-light-text dark:text-dark-text hover:border-[#16a34a] hover:text-[#16a34a] transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Actions */}
            <button
              onClick={handleAdd}
              className={`w-full flex items-center justify-center gap-2 font-semibold text-sm py-2.5 rounded-btn transition-colors duration-150 mb-2 ${
                added
                  ? 'bg-[#16a34a] text-white'
                  : 'bg-[#f59e0b] hover:bg-[#d97706] text-white'
              }`}
            >
              <ShoppingCart size={15} />
              {added ? '✓ Added!' : t('Add to Cart')}
            </button>
            <Link
              href={`/products/${product.id}`}
              onClick={onClose}
              className="text-center text-xs text-[#16a34a] hover:underline"
            >
              View full details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
