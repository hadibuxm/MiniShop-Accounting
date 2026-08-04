'use client';

import { useTranslation } from 'react-i18next';
import i18next, { applyDocumentDirection, storeLanguage, Language } from '@/i18n';

export function LanguageToggle() {
  const { t } = useTranslation();

  const toggle = () => {
    const next: Language = i18next.language === 'ur' ? 'en' : 'ur';
    i18next.changeLanguage(next);
    applyDocumentDirection(next);
    storeLanguage(next);

    fetch('/api/users/language', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language_preference: next }),
    }).catch(() => {
      // Sync failure is silent to the user.
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100"
    >
      {t('nav.languageToggle')}
    </button>
  );
}
