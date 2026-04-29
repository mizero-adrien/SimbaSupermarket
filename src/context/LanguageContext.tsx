'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Language } from '@/types';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateCategory: (category: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  translateCategory: (category) => category,
});

const LANGUAGE_STORAGE_KEY = 'simba_language';
const CACHE_STORAGE_KEY = 'simba_groq_cache';

type LangCache = Record<string, string>;
type AllCache = Partial<Record<Language, LangCache>>;

function readCache(): AllCache {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AllCache) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: AllCache) {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
  } catch {}
}

async function groqTranslateBatch(
  texts: string[],
  language: Language
): Promise<Record<string, string>> {
  if (texts.length === 0) return {};
  try {
    const res = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, texts }),
    });
    if (!res.ok) return {};
    const data = (await res.json()) as { translations?: string[] };
    const arr = Array.isArray(data.translations) ? data.translations : [];
    return Object.fromEntries(texts.map((text, i) => [text, arr[i] ?? text]));
  } catch {
    return {};
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [cache, setCache] = useState<AllCache>({});
  const pendingRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const langRef = useRef<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (saved && ['en', 'fr', 'rw'].includes(saved)) {
        setLanguageState(saved);
        langRef.current = saved;
      }
      setCache(readCache());
    } catch {}
  }, []);

  const flushPending = useCallback(async (lang: Language) => {
    if (inFlightRef.current || pendingRef.current.size === 0) return;
    const batch = Array.from(pendingRef.current);
    pendingRef.current.clear();
    inFlightRef.current = true;

    const result = await groqTranslateBatch(batch, lang);

    inFlightRef.current = false;

    if (Object.keys(result).length > 0) {
      setCache(prev => {
        const next: AllCache = {
          ...prev,
          [lang]: { ...(prev[lang] ?? {}), ...result },
        };
        writeCache(next);
        return next;
      });
    }

    // More strings queued while request was in flight — flush again
    if (pendingRef.current.size > 0 && langRef.current === lang) {
      void flushPending(lang);
    }
  }, []);

  const scheduleFlush = useCallback(
    (lang: Language) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void flushPending(lang), 350);
    },
    [flushPending]
  );

  // Reset queue when language changes
  useEffect(() => {
    langRef.current = language;
    pendingRef.current.clear();
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    langRef.current = lang;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {}
    // Reload cache so newly cached strings are immediately available
    setCache(readCache());
  };

  const t = useCallback(
    (key: string): string => {
      if (!key) return key;
      if (language === 'en') return key;

      const langCache = cache[language] ?? {};
      const hit = langCache[key];
      if (hit) return hit;

      // Queue this key for the next Groq batch call
      pendingRef.current.add(key);
      scheduleFlush(language);

      // Return English while Groq processes the translation
      return key;
    },
    [language, cache, scheduleFlush]
  );

  const translateCategory = useCallback((category: string) => t(category), [t]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateCategory }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
