'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '@/types';
import { getMasterProducts } from '@/lib/productData';

interface WishlistContextType {
  count: number;
  wishlistItems: Product[];
  isWishlisted: (id: string | number) => boolean;
  toggleWishlist: (id: string | number) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<(string | number)[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => { setAllProducts(getMasterProducts()); }, []);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('simba_wishlist') ?? '[]');
      if (Array.isArray(saved) && saved.length > 0) setIds(saved);
    } catch {}
  }, []);
  useEffect(() => { localStorage.setItem('simba_wishlist', JSON.stringify(ids)); }, [ids]);

  const wishlistItems = allProducts.filter(p => ids.includes(p.id));

  function toggleWishlist(id: string | number) {
    setIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function isWishlisted(id: string | number) { return ids.includes(id); }
  function clearWishlist() { setIds([]); }

  return (
    <WishlistContext.Provider value={{ count: ids.length, wishlistItems, isWishlisted, toggleWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider');
  return ctx;
}
