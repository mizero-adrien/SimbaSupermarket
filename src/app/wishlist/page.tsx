'use client';

import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { getProductImage, getSaleInfo } from '@/lib/products';
import { formatPrice } from '@/lib/formatPrice';

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist, clearWishlist, count } = useWishlist();
  const { addItem } = useCart();
  const { t, translateCategory } = useLanguage();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg page-transition">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Heart size={24} className="text-red-500" fill="currentColor" />
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">
              My Wishlist
              {count > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">({count} {count === 1 ? 'item' : 'items'})</span>
              )}
            </h1>
          </div>
          {count > 0 && (
            <button
              onClick={clearWishlist}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              <Trash2 size={15} />
              Clear all
            </button>
          )}
        </div>

        {/* Empty state */}
        {count === 0 && (
          <div className="text-center py-24">
            <Heart size={56} className="mx-auto mb-4 text-gray-200 dark:text-gray-700" />
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Save items you love by tapping the heart on any product.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#16a34a] text-white px-6 py-2.5 rounded-btn font-semibold text-sm hover:bg-green-700 transition-colors"
            >
              <ShoppingCart size={16} />
              Start Shopping
            </Link>
          </div>
        )}

        {/* Wishlist grid */}
        {count > 0 && (
          <>
            {/* Add all to cart */}
            <div className="flex justify-center sm:justify-end mb-4">
              <button
                onClick={() => wishlistItems.forEach(p => addItem(p))}
                className="flex items-center gap-2 bg-[#16a34a] text-white px-5 py-2 rounded-btn font-semibold text-sm hover:bg-green-700 transition-colors"
              >
                <ShoppingCart size={15} />
                Add all to cart
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {wishlistItems.map(product => {
                const { onSale, salePrice, originalPrice, savePct } = getSaleInfo(product);
                return (
                  <div key={product.id} className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                    {/* Image */}
                    <Link href={`/products/${product.id}`} className="relative block h-44 bg-gray-100 dark:bg-slate-800 overflow-hidden group">
                      <Image
                        src={getProductImage(product)}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <span className="absolute top-2 left-2 bg-slate-700 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {translateCategory(product.category)}
                      </span>
                      {onSale && (
                        <span className="absolute bottom-2 right-2 bg-[#f59e0b] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          Save {savePct}%
                        </span>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="p-3 flex flex-col flex-1">
                      <Link href={`/products/${product.id}`}>
                        <h3 className="text-sm font-semibold text-light-text dark:text-dark-text line-clamp-2 mb-2 hover:text-[#16a34a] transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mt-auto">
                        {onSale ? (
                          <div className="flex items-baseline gap-1.5 mb-3">
                            <span className="text-base font-bold text-[#16a34a]">{formatPrice(salePrice)}</span>
                            <span className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</span>
                          </div>
                        ) : (
                          <p className="text-[#f59e0b] font-bold text-base mb-3">{formatPrice(product.price)}</p>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => addItem(product)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-[#16a34a] hover:bg-green-700 text-white font-semibold text-xs py-2 rounded-btn transition-colors"
                          >
                            <ShoppingCart size={13} />
                            {t('Add to Cart')}
                          </button>
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            aria-label="Remove from wishlist"
                            className="p-2 rounded-btn border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Heart size={15} fill="currentColor" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
