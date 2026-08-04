import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUserFromCookieStore } from '@/lib/session';
import { getRangeReport, monthRange } from '@/lib/reportQueries';
import { ReportContent } from '@/components/reports/ReportContent';

export default async function MonthlyPrintPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string };
}) {
  const user = await getSessionUserFromCookieStore(cookies());
  if (!user) redirect('/login');

  const now = new Date();
  const year = Number(searchParams.year ?? now.getFullYear());
  const month = Number(searchParams.month ?? now.getMonth() + 1);
  const { start, end } = monthRange(year, month);
  const report = getRangeReport(user.id, start, end);

  return (
    <ReportContent
      shopName={user.shop_name}
      ownerName={user.full_name}
      reportTitle="Monthly Profit & Loss Report / ماہانہ منافع و نقصان رپورٹ"
      periodLabel={`${start} — ${end}`}
      totalIncome={report.total_income}
      totalExpenses={report.total_expenses}
      net={report.net}
      netLabel="profitLoss"
      incomeByCategory={report.income_by_category}
      expenseByCategory={report.expense_by_category}
    />
  );
}
