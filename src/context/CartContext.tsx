'use client';

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { CartItem, Product } from '@/types';
import { useToast } from '@/context/ToastContext';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string | number }
  | { type: 'UPDATE_QUANTITY'; productId: string | number; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.product.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { product: action.product, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter(i => i.product.id !== action.productId) };
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return { items: state.items.filter(i => i.product.id !== action.productId) };
      }
      return {
        items: state.items.map(i =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      };
    }
    case 'CLEAR_CART':
      return { items: [] };
    case 'LOAD_CART':
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const toast = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('simba_cart');
      if (saved) dispatch({ type: 'LOAD_CART', items: JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('simba_cart', JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  const addItem = useCallback((product: Product) => {
    dispatch({ type: 'ADD_ITEM', product });
    toast.success(`${product.name} added to cart`);
  }, [toast]);

  const removeItem = useCallback((productId: string | number) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
  }, []);

  const updateQuantity = useCallback((productId: string | number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
