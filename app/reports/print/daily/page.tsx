import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUserFromCookieStore } from '@/lib/session';
import { getDailyReport } from '@/lib/reportQueries';
import { ReportContent } from '@/components/reports/ReportContent';

export default async function DailyPrintPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const user = await getSessionUserFromCookieStore(cookies());
  if (!user) redirect('/login');

  const date = searchParams.date ?? new Date().toISOString().slice(0, 10);
  const report = getDailyReport(user.id, date);

  return (
    <ReportContent
      shopName={user.shop_name}
      ownerName={user.full_name}
      reportTitle="Daily Summary Report / روزانہ خلاصہ رپورٹ"
      periodLabel={date}
      totalIncome={report.total_income}
      totalExpenses={report.total_expenses}
      net={report.net_balance}
      netLabel="balance"
      transactions={report.transactions}
    />
  );
}
