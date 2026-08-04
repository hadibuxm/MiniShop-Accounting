import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getRangeReport } from '@/lib/reportQueries';
import { customReportQuerySchema, BILINGUAL_ERRORS } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = customReportQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? BILINGUAL_ERRORS.endBeforeStart;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { start_date, end_date } = parsed.data;
  const range = getRangeReport(user.id, start_date, end_date);

  return NextResponse.json(
    {
      start_date,
      end_date,
      total_income: range.total_income,
      total_expenses: range.total_expenses,
      net: range.net,
      income_by_category: range.income_by_category,
      expense_by_category: range.expense_by_category,
    },
    { status: 200 }
  );
}
