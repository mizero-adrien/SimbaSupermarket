'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bot, Send, X, Loader2, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/formatPrice';
import { useLanguage } from '@/context/LanguageContext';
import { translateCategory } from '@/lib/translations';

interface AiSearchResult {
  reply: string;
  products: Product[];
}

const STARTER_PROMPTS = [
  'Do you have fresh milk?',
  'I need something for breakfast',
  'Show me healthy snacks',
];

export default function FloatingAiAssistant() {
  const { language } = useLanguage();
  const tr = (en: string, fr: string, rw: string) =>
    language === 'fr' ? fr : language === 'rw' ? rw : en;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AiSearchResult | null>(null);

  const title = tr('AI Product Assistant', 'Assistant produit IA', 'Umufasha wa AI mu bicuruzwa');

  async function handleAsk(message: string) {
    const clean = message.trim();
    if (clean.length < 2) {
      setError(tr('Please type your request.', 'Veuillez saisir votre demande.', 'Andika icyo ushaka.'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: clean }),
      });

      const data = (await response.json()) as AiSearchResult & { error?: string };

      if (!response.ok) {
        setError(data.error ?? tr('Search failed. Try again.', 'La recherche a échoué. Réessayez.', 'Gushakisha byanze. Ongera ugerageze.'));
        return;
      }

      setResult({
        reply: data.reply,
        products: Array.isArray(data.products) ? data.products : [],
      });
    } catch {
      setError(tr('Network error. Please try again.', 'Erreur réseau. Veuillez réessayer.', 'Ikosa rya network. Ongera ugerageze.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 md:right-6 z-50 w-[min(92vw,370px)] rounded-2xl border border-light-border dark:border-dark-border bg-white/95 dark:bg-dark-card/95 backdrop-blur shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <p className="text-sm font-bold">{title}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
              aria-label={tr('Close assistant', "Fermer l'assistant", 'Funga umufasha')}
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-3 space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {tr(
                'Ask naturally and I will find products from Simba catalog.',
                'Posez votre question naturellement et je trouverai des produits du catalogue Simba.',
                'Baza mu buryo busanzwe ndagushakira ibicuruzwa muri katalogi ya Simba.'
              )}
            </p>

            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => {
                    setQuery(prompt);
                    void handleAsk(prompt);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-light-border dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-[#16a34a] hover:text-[#16a34a]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleAsk(query);
                  }
                }}
                placeholder={tr('Type your request...', 'Tapez votre demande...', 'Andika icyo ushaka...')}
                className="flex-1 px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a]"
              />
              <button
                onClick={() => void handleAsk(query)}
                disabled={loading}
                className="w-9 h-9 rounded-btn bg-[#16a34a] hover:bg-[#15803d] text-white flex items-center justify-center disabled:opacity-60"
                aria-label={tr('Send', 'Envoyer', 'Ohereza')}
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>

            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

            {result && (
              <div className="space-y-2">
                <p className="text-sm text-light-text dark:text-dark-text">{result.reply}</p>

                <div className="border border-light-border dark:border-dark-border rounded-btn divide-y divide-light-border dark:divide-dark-border max-h-64 overflow-y-auto">
                  {result.products.map(product => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <p className="text-sm font-semibold text-light-text dark:text-dark-text line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {translateCategory(product.category, language)} • {formatPrice(product.price)}
                      </p>
                    </Link>
                  ))}
                  {result.products.length === 0 && (
                    <p className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                      {tr('No matching products found.', 'Aucun produit correspondant trouvé.', 'Nta bicuruzwa bihuye byabonetse.')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-24 right-4 md:right-6 z-50 w-14 h-14 rounded-full shadow-2xl bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label={title}
      >
        <Bot size={24} />
      </button>
    </>
  );
}
