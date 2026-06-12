'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  leaving: boolean;
}

interface ToastContextValue {
  success: (message: string) => void;
  error:   (message: string) => void;
  warning: (message: string) => void;
  info:    (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  success: () => {},
  error:   () => {},
  warning: () => {},
  info:    () => {},
});

const CONFIG: Record<ToastType, { Icon: React.ElementType; border: string; iconCls: string }> = {
  success: { Icon: CheckCircle2,  border: 'border-l-[#f59e0b]', iconCls: 'text-[#f59e0b]' },
  error:   { Icon: XCircle,       border: 'border-l-red-500',   iconCls: 'text-red-500'   },
  warning: { Icon: AlertTriangle, border: 'border-l-[#f59e0b]', iconCls: 'text-[#f59e0b]' },
  info:    { Icon: Info,          border: 'border-l-blue-500',  iconCls: 'text-blue-500'  },
};

const DURATION = 4000;
const MAX     = 5;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 280);
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev.slice(-(MAX - 1)), { id, message, type, leaving: false }]);
    setTimeout(() => dismiss(id), DURATION);
  }, [dismiss]);

  const success = useCallback((m: string) => addToast(m, 'success'), [addToast]);
  const error   = useCallback((m: string) => addToast(m, 'error'),   [addToast]);
  const warning = useCallback((m: string) => addToast(m, 'warning'), [addToast]);
  const info    = useCallback((m: string) => addToast(m, 'info'),    [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div
        className="fixed bottom-20 right-3 sm:right-4 md:bottom-6 md:right-6 z-[90] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map(({ id, message, type, leaving }) => {
          const { Icon, border, iconCls } = CONFIG[type];
          return (
            <div
              key={id}
              className={`
                pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl
                shadow-xl border border-light-border dark:border-dark-border border-l-4
                bg-white dark:bg-dark-card
                max-w-[min(88vw,340px)] w-full
                ${border}
                ${leaving ? 'toast-leave' : 'toast-enter'}
              `}
            >
              <Icon size={17} className={`shrink-0 mt-0.5 ${iconCls}`} />
              <p className="flex-1 text-sm text-light-text dark:text-dark-text leading-snug">{message}</p>
              <button
                onClick={() => dismiss(id)}
                className="shrink-0 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Dismiss"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
