'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
const LANGUAGE_TEXT_CACHE_KEY = 'simba_language_text_cache';
const LANGUAGE_CATEGORY_CACHE_KEY = 'simba_language_category_cache';

type TranslationCache = Partial<Record<Language, Record<string, string>>>;

function readCache(key: string): TranslationCache {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as TranslationCache : {};
  } catch {
    return {};
  }
}

function writeCache(key: string, cache: TranslationCache) {
  try {
    localStorage.setItem(key, JSON.stringify(cache));
  } catch {}
}

async function fetchTranslations(texts: string[], language: Language): Promise<Record<string, string>> {
  if (language === 'en' || texts.length === 0) return {};

  const response = await fetch('/api/ai/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, texts }),
  });

  if (!response.ok) {
    throw new Error('Translation request failed.');
  }

  const data = await response.json() as { translations?: string[] };
  const translated = Array.isArray(data.translations) ? data.translations : [];

  return texts.reduce<Record<string, string>>((acc, text, index) => {
    acc[text] = translated[index] ?? text;
    return acc;
  }, {});
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [runtimeTextTranslations, setRuntimeTextTranslations] = useState<Record<string, string>>({});
  const [runtimeCategoryTranslations, setRuntimeCategoryTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (saved && ['en', 'fr', 'rw'].includes(saved)) {
        setLanguageState(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadLanguageRuntime = async () => {
      if (language === 'en') {
        setRuntimeTextTranslations({});
        setRuntimeCategoryTranslations({});
        return;
      }

      const textCache = readCache(LANGUAGE_TEXT_CACHE_KEY);
      const categoryCache = readCache(LANGUAGE_CATEGORY_CACHE_KEY);
      const cachedTexts = textCache[language] ?? {};
      const cachedCategories = categoryCache[language] ?? {};

      if (!cancelled) {
        setRuntimeTextTranslations(cachedTexts);
        setRuntimeCategoryTranslations(cachedCategories);
      }

      // No static translation keys; always use Groq
      const missingTextKeys: string[] = [];
      const missingCategoryKeys: string[] = [];

      if (missingTextKeys.length === 0 && missingCategoryKeys.length === 0) {
        return;
      }

      try {
        const [freshTexts, freshCategories] = await Promise.all([
          fetchTranslations(missingTextKeys, language),
          fetchTranslations(missingCategoryKeys, language),
        ]);

        if (cancelled) return;

        const mergedTexts = { ...cachedTexts, ...freshTexts };
        const mergedCategories = { ...cachedCategories, ...freshCategories };

        setRuntimeTextTranslations(mergedTexts);
        setRuntimeCategoryTranslations(mergedCategories);

        writeCache(LANGUAGE_TEXT_CACHE_KEY, {
          ...textCache,
          [language]: mergedTexts,
        });
        writeCache(LANGUAGE_CATEGORY_CACHE_KEY, {
          ...categoryCache,
          [language]: mergedCategories,
        });
      } catch {
        // Keep static fallback translations if Groq is unavailable.
      }
    };

    void loadLanguageRuntime();

    return () => {
      cancelled = true;
    };
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {}
  };

  const translate = (key: string) => runtimeTextTranslations[key] ?? key;
  const translateCategory = (category: string) =>
    runtimeCategoryTranslations[category] ?? category;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translate, translateCategory }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
