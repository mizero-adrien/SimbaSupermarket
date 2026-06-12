'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bot, Send, X, Sparkles, ShoppingCart, ExternalLink } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/formatPrice';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

interface NavLink {
  label: string;
  href: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'products' | 'text' | 'guide';
  products?: Product[];
  links?: NavLink[];
}

const STARTERS = [
  'How do I shop here?',
  'How does checkout work?',
  'Show me fresh produce',
  "What's in my cart?",
];

export default function FloatingAiAssistant() {
  const { translateCategory } = useLanguage();
  const { items: cartItems, totalItems, totalPrice, addItem } = useCart();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true;
      setMessages([{
        role: 'assistant',
        type: 'text',
        content: "Hi! I'm your Simba assistant. I can help you find products, guide you through shopping and checkout, answer questions about delivery, payment, your cart, and more. What can I help you with?",
      }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(text: string) {
    const clean = text.trim();
    if (clean.length < 2 || loading) return;

    const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, { role: 'user', content: clean }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          history,
          cart: {
            items: cartItems.map(i => ({ name: i.product.name, quantity: i.quantity, price: i.product.price })),
            totalItems,
            totalPrice,
          },
        }),
      });

      const data = (await res.json()) as {
        type?: string;
        reply: string;
        products?: Product[];
        links?: NavLink[];
        error?: string;
      };

      setMessages(prev => [...prev, {
        role: 'assistant',
        type: (data.type as Message['type']) ?? 'text',
        content: data.error ?? data.reply,
        products: data.products,
        links: data.links,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        type: 'text',
        content: 'Network error. Please check your connection and try again.',
      }]);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <>
      {open && (
        <div
          className="fixed bottom-[6.25rem] right-3 sm:right-4 md:bottom-6 md:right-6 z-[70] w-[min(92vw,390px)] rounded-2xl border border-light-border dark:border-dark-border bg-white/95 dark:bg-dark-card/95 backdrop-blur shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: 'min(82vh, 600px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-dark-card border-b border-light-border dark:border-dark-border shrink-0">
            <div className="flex items-center gap-2 text-light-text dark:text-dark-text">
              <Sparkles size={16} className="text-[#6366f1]" />
              <span className="text-sm font-bold">Simba AI Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-400 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i}>
                {/* Bubble row */}
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-5 h-5 rounded-full bg-[#6366f1] flex items-center justify-center mr-1.5 mt-0.5 shrink-0">
                      <Bot size={11} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[84%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-[#6366f1] text-white rounded-tr-sm'
                        : 'bg-gray-100 dark:bg-slate-700 text-light-text dark:text-dark-text rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>

                {/* Navigation link chips for guide responses */}
                {msg.links && msg.links.length > 0 && (
                  <div className="ml-7 mt-2 flex flex-wrap gap-1.5">
                    {msg.links.map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-[#6366f1]/10 text-[#4f46e5] dark:text-[#6366f1] border border-[#6366f1]/30 hover:bg-[#6366f1] hover:text-white transition-colors font-medium"
                      >
                        <ExternalLink size={10} />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Product results */}
                {msg.products && msg.products.length > 0 && (
                  <div className="ml-7 mt-1.5 border border-light-border dark:border-dark-border rounded-xl overflow-hidden divide-y divide-light-border dark:divide-dark-border">
                    {msg.products.map(product => (
                      <div key={product.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <Link
                          href={`/products/${product.id}`}
                          onClick={() => setOpen(false)}
                          className="flex-1 min-w-0"
                        >
                          <p className="text-xs font-semibold text-light-text dark:text-dark-text line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {translateCategory(product.category)} · {formatPrice(product.price)}
                          </p>
                        </Link>
                        <button
                          onClick={() => addItem(product)}
                          className="shrink-0 w-7 h-7 rounded-full bg-[#6366f1]/10 hover:bg-[#6366f1] text-[#4f46e5] hover:text-white flex items-center justify-center transition-colors"
                          title="Add to cart"
                        >
                          <ShoppingCart size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {msg.products?.length === 0 && (
                  <p className="ml-7 mt-1 text-xs text-gray-400 dark:text-gray-500">
                    No matching products found.
                  </p>
                )}

                {/* Quick starter prompts after the welcome message */}
                {i === 0 && messages.length === 1 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {STARTERS.map(s => (
                      <button
                        key={s}
                        onClick={() => void handleSend(s)}
                        className="text-[11px] px-2.5 py-1 rounded-full border border-light-border dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-[#6366f1] hover:text-[#4f46e5] transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#6366f1] flex items-center justify-center shrink-0">
                  <Bot size={11} className="text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-slate-700 px-3 py-2.5 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-light-border dark:border-dark-border shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); void handleSend(query); }
                }}
                placeholder="Ask anything — shopping, products, help..."
                className="flex-1 px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-[#6366f1]"
              />
              <button
                onClick={() => void handleSend(query)}
                disabled={loading || query.trim().length < 2}
                className="w-9 h-9 rounded-btn bg-[#6366f1] hover:bg-[#4f46e5] text-white flex items-center justify-center disabled:opacity-50 transition-colors"
                aria-label="Send"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-[5rem] right-3 sm:right-4 md:bottom-6 md:right-6 z-[70] w-14 h-14 rounded-full shadow-2xl bg-[#6366f1] hover:bg-[#4f46e5] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        aria-label="Open AI Assistant"
      >
        <Bot size={24} />
      </button>
    </>,
    document.body
  );
}
