'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/formatPrice';
import { getProductImage, getSaleInfo } from '@/lib/products';
import { translateCategory } from '@/lib/translations';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import QuickViewModal from './QuickViewModal';

interface Props {
  product: Product;
}


export default function ProductCard({ product }: Props) {
  const { addItem, updateQuantity, items } = useCart();
  const { t, language } = useLanguage();
  const image = getProductImage(product);
  const [showModal, setShowModal] = useState(false);
  const { onSale, originalPrice, salePrice, savePct } = getSaleInfo(product);
  const cartItem = items?.find(i => i.product.id === product.id);
  const [quantity, setQuantity] = useState(cartItem ? cartItem.quantity : 1);

  const handleAddToCart = () => {
    // If already in cart, update quantity, else add item with quantity
    if (cartItem) {
      updateQuantity(product.id, quantity);
    } else {
      for (let i = 0; i < quantity; i++) addItem(product);
    }
  };

  return (
    <>
      <div className="group bg-white dark:bg-dark-card rounded-card shadow-sm border border-light-border dark:border-dark-border hover:shadow-lg hover:scale-[1.02] transition-all duration-200 overflow-hidden flex flex-col">
        <Link href={`/products/${product.id}`} className="block relative">
          <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-slate-800">
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
              onError={() => {}}
            />

            {/* Badges */}
            <span className="absolute top-2 left-2 bg-[#16a34a] text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {translateCategory(product.category, language)}
            </span>
            {onSale && (
              <span className="absolute top-2 right-2 bg-[#f59e0b] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Save {savePct}%
              </span>
            )}

            {/* Quick View overlay */}
            <button
              onClick={e => { e.preventDefault(); setShowModal(true); }}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20"
              aria-label={`Quick view ${product.name}`}
            >
              <span className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md hover:bg-[#16a34a] hover:text-white transition-colors">
                <Eye size={13} />
                {t('Quick View')}
              </span>
            </button>
          </div>
        </Link>

        <div className="p-3 flex flex-col flex-1">
          <Link href={`/products/${product.id}`}>
            <h3 className="text-sm font-semibold text-light-text dark:text-dark-text line-clamp-2 mb-1 hover:text-[#16a34a] transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="mt-auto mb-3">
            {onSale ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-red-500">{formatPrice(salePrice)}</span>
                <span className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</span>
              </div>
            ) : (
              <p className="text-[#f59e0b] font-bold text-base">{formatPrice(product.price)}</p>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-l-btn text-lg font-bold border border-light-border dark:border-dark-border"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-12 text-center border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text"
              aria-label="Quantity"
            />
            <button
              type="button"
              className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-r-btn text-lg font-bold border border-light-border dark:border-dark-border"
              onClick={() => setQuantity(q => q + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold text-sm py-2 rounded-btn transition-colors duration-150"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={14} />
            {t('Add to Cart')}
          </button>
        </div>
      </div>

      {showModal && <QuickViewModal product={product} onClose={() => setShowModal(false)} />}
    </>
  );
}
