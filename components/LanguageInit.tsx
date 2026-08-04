'use client';

import { useEffect } from 'react';
import i18next, { applyDocumentDirection, getStoredLanguage, Language } from '@/i18n';

export function LanguageInit({ fallbackLanguage }: { fallbackLanguage: Language }) {
  useEffect(() => {
    const stored = getStoredLanguage();
    if (!stored) {
      i18next.changeLanguage(fallbackLanguage);
      applyDocumentDirection(fallbackLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
