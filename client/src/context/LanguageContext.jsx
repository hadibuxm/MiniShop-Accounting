import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEY } from '../i18n';

const LanguageContext = createContext(null);

const DIRECTIONS = { en: 'ltr', ur: 'rtl' };

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');

  const applyDocumentAttributes = useCallback((lang) => {
    document.documentElement.lang = lang;
    document.documentElement.dir = DIRECTIONS[lang] || 'ltr';
  }, []);

  useEffect(() => {
    applyDocumentAttributes(language);
  }, [language, applyDocumentAttributes]);

  const changeLanguage = useCallback(
    (lang) => {
      i18n.changeLanguage(lang);
      window.localStorage.setItem(STORAGE_KEY, lang);
      setLanguage(lang);
    },
    [i18n]
  );

  const toggleLanguage = useCallback(() => {
    changeLanguage(language === 'en' ? 'ur' : 'en');
  }, [language, changeLanguage]);

  const value = useMemo(
    () => ({
      language,
      dir: DIRECTIONS[language] || 'ltr',
      changeLanguage,
      toggleLanguage,
    }),
    [language, changeLanguage, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
