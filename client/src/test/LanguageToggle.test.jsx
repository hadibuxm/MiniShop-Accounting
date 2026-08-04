import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import '../i18n';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';

function TestComponent() {
  const { t } = useTranslation();
  const { toggleLanguage } = useLanguage();
  return (
    <div>
      <span data-testid="label">{t('nav.dashboard')}</span>
      <button type="button" onClick={toggleLanguage}>
        toggle
      </button>
    </div>
  );
}

describe('language toggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('switches UI text and document direction instantly without a reload', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('label')).toHaveTextContent('Dashboard');
    expect(document.documentElement.dir).toBe('ltr');

    fireEvent.click(screen.getByText('toggle'));

    expect(screen.getByTestId('label')).toHaveTextContent('ڈیش بورڈ');
    expect(document.documentElement.dir).toBe('rtl');
    expect(window.localStorage.getItem('accounting_book_language')).toBe('ur');
  });
});
