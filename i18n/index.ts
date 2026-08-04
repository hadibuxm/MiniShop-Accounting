'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ur from './ur.json';

export type Language = 'en' | 'ur';

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

export function getStoredLanguage(): Language | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem('lang');
  return stored === 'en' || stored === 'ur' ? stored : null;
}

export function storeLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('lang', lang);
}

export function applyDocumentDirection(lang: Language): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
}

export default i18next;
