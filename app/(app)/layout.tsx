import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUserFromCookieStore } from '@/lib/session';
import { NavBar } from '@/components/NavBar';
import { LanguageInit } from '@/components/LanguageInit';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUserFromCookieStore(cookies());
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <LanguageInit fallbackLanguage={user.language_preference} />
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
