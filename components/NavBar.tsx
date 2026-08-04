'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';

const LINKS = [
  { href: '/dashboard', key: 'nav.dashboard' },
  { href: '/transactions', key: 'nav.transactions' },
  { href: '/categories', key: 'nav.categories' },
  { href: '/reports/daily', key: 'nav.reportsDaily' },
  { href: '/reports/monthly', key: 'nav.reportsMonthly' },
  { href: '/reports/custom', key: 'nav.reportsCustom' },
] as const;

export function NavBar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-semibold">{t('app.name')}</span>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href
                ? 'text-sm font-semibold text-gray-900'
                : 'text-sm text-gray-500 hover:text-gray-900'
            }
          >
            {t(link.key)}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <button
          type="button"
          onClick={logout}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100"
        >
          {t('nav.logout')}
        </button>
      </div>
    </nav>
  );
}
