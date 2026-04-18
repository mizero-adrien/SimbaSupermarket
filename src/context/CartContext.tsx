'use client';

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { CartItem, Product } from '@/types';

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

interface ToastItem {
  id: number;
  message: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toasts: [], addToast: () => {} });

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('simba_cart');
      if (saved) {
        dispatch({ type: 'LOAD_CART', items: JSON.parse(saved) });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('simba_cart', JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  const addToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const addItem = useCallback((product: Product) => {
    dispatch({ type: 'ADD_ITEM', product });
    addToast(`✅ ${product.name} added to cart`);
  }, [addToast]);

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
    <ToastContext.Provider value={{ toasts, addToast }}>
      <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
        {children}
        <ToastContainer toasts={toasts} />
      </CartContext.Provider>
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="toast-enter bg-[#16a34a] text-white px-4 py-3 rounded-btn shadow-lg text-sm font-medium max-w-xs"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
