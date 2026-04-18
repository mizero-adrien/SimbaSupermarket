'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, Shield, RotateCcw } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/formatPrice';
import { getProductImage } from '@/lib/products';

const DELIVERY_FEE = 2000;
const FREE_DELIVERY_THRESHOLD = 50000;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { t } = useLanguage();

  const deliveryFee = totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const grandTotal = totalPrice + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center gap-4 px-4 page-transition">
        <div className="text-6xl">🛒</div>
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Your cart is empty</h2>
        <p className="text-gray-500 text-sm">Add some products to get started.</p>
        <Link
          href="/products"
          className="bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold px-8 py-3 rounded-btn transition-colors mt-2"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg page-transition">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">
            {t('Your Cart')} ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
          >
            <Trash2 size={14} />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => {
              const image = getProductImage(product);
              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-4 flex gap-4"
                >
                  <Link href={`/products/${product.id}`} className="shrink-0">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800">
                      <Image src={image} alt={product.name} fill className="object-cover" sizes="80px" />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-sm text-light-text dark:text-dark-text hover:text-[#16a34a] transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                    <p className="text-xs text-gray-500">{formatPrice(product.price)} each</p>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <p className="font-bold text-[#f59e0b] text-sm">
                      {formatPrice(product.price * quantity)}
                    </p>
                    <div className="flex items-center border border-light-border dark:border-dark-border rounded-btn overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-3 py-1 text-sm font-semibold text-light-text dark:text-dark-text min-w-[32px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Increase"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={12} />
                      {t('Remove')}
                    </button>
                  </div>
                </div>
              );
            })}

            <Link
              href="/products"
              className="flex items-center gap-2 text-sm text-[#16a34a] font-semibold hover:underline mt-2"
            >
              <ShoppingBag size={14} />
              {t('Continue Shopping')}
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-6 sticky top-20">
              <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">{t('Order Summary')}</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal ({totalItems} items)</span>
                  <span className="font-medium text-light-text dark:text-dark-text">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('Delivery')}</span>
                  {deliveryFee === 0 ? (
                    <span className="font-medium text-[#16a34a]">{t('Free')}</span>
                  ) : (
                    <span className="font-medium text-light-text dark:text-dark-text">{formatPrice(deliveryFee)}</span>
                  )}
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-gray-400">
                    Add {formatPrice(FREE_DELIVERY_THRESHOLD - totalPrice)} more for free delivery
                  </p>
                )}
              </div>

              <div className="border-t border-light-border dark:border-dark-border pt-3 mb-6">
                <div className="flex justify-between">
                  <span className="font-bold text-light-text dark:text-dark-text">{t('Total')}</span>
                  <span className="font-extrabold text-xl text-[#f59e0b]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full text-center bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold py-3 rounded-btn transition-colors"
              >
                {t('Proceed to Checkout')}
              </Link>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield size={12} className="text-[#16a34a]" />
                  Secure checkout
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <RotateCcw size={12} className="text-[#16a34a]" />
                  Easy returns
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
