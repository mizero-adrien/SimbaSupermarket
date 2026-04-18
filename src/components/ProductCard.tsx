'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/formatPrice';
import { getProductImage } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const image = getProductImage(product);

  return (
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
          <span className="absolute top-2 left-2 bg-[#16a34a] text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        </div>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-semibold text-light-text dark:text-dark-text line-clamp-2 mb-1 hover:text-[#16a34a] transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-[#f59e0b] font-bold text-base mt-auto mb-3">
          {formatPrice(product.price)}
        </p>
        <button
          onClick={() => addItem(product)}
          className="w-full flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold text-sm py-2 rounded-btn transition-colors duration-150"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart size={14} />
          {t('Add to Cart')}
        </button>
      </div>
    </div>
  );
}
