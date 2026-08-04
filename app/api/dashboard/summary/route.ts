import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { sumByType, monthRange } from '@/lib/reportQueries';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const { start, end } = monthRange(now.getFullYear(), now.getMonth() + 1);

  const todayIncome = sumByType(user.id, today, today, 'income');
  const todayExpenses = sumByType(user.id, today, today, 'expense');
  const monthIncome = sumByType(user.id, start, end, 'income');
  const monthExpenses = sumByType(user.id, start, end, 'expense');

  return NextResponse.json(
    {
      today: { income: todayIncome, expenses: todayExpenses, net: todayIncome - todayExpenses },
      month: { income: monthIncome, expenses: monthExpenses, net: monthIncome - monthExpenses },
    },
    { status: 200 }
  );
}
