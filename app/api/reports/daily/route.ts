import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getDailyReport } from '@/lib/reportQueries';
import { dailyReportQuerySchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = dailyReportQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  const report = getDailyReport(user.id, parsed.data.date);
  return NextResponse.json(report, { status: 200 });
}
