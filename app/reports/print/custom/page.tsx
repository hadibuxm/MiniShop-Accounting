import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUserFromCookieStore } from '@/lib/session';
import { getRangeReport } from '@/lib/reportQueries';
import { ReportContent } from '@/components/reports/ReportContent';

export default async function CustomPrintPage({
  searchParams,
}: {
  searchParams: { start_date?: string; end_date?: string };
}) {
  const user = await getSessionUserFromCookieStore(cookies());
  if (!user) redirect('/login');

  const today = new Date().toISOString().slice(0, 10);
  const startDate = searchParams.start_date ?? today;
  const endDate = searchParams.end_date ?? today;
  const report = getRangeReport(user.id, startDate, endDate);

  return (
    <ReportContent
      shopName={user.shop_name}
      ownerName={user.full_name}
      reportTitle="Custom Date Range Report / مخصوص تاریخ رپورٹ"
      periodLabel={`${startDate} — ${endDate}`}
      totalIncome={report.total_income}
      totalExpenses={report.total_expenses}
      net={report.net}
      netLabel="balance"
      incomeByCategory={report.income_by_category}
      expenseByCategory={report.expense_by_category}
    />
  );
}
