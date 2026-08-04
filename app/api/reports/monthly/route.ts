import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getRangeReport, monthRange } from '@/lib/reportQueries';
import { monthlyReportQuerySchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = monthlyReportQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid year/month' }, { status: 400 });
  }

  const { year, month } = parsed.data;
  const { start, end } = monthRange(year, month);
  const range = getRangeReport(user.id, start, end);

  return NextResponse.json(
    {
      year,
      month,
      total_income: range.total_income,
      total_expenses: range.total_expenses,
      net: range.net,
      income_by_category: range.income_by_category,
      expense_by_category: range.expense_by_category,
    },
    { status: 200 }
  );
}
