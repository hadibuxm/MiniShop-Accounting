import { formatPKR } from '@/lib/format';

export interface ReportTransactionRow {
  id: string;
  date: string;
  category_name: string;
  payment_method: string;
  amount: number;
  description: string | null;
}

export interface ReportCategoryBreakdown {
  category_name: string;
  total: number;
}

export interface ReportContentProps {
  shopName: string;
  ownerName: string;
  reportTitle: string;
  periodLabel: string;
  totalIncome: number;
  totalExpenses: number;
  net: number;
  netLabel: 'balance' | 'profitLoss';
  transactions?: ReportTransactionRow[];
  incomeByCategory?: ReportCategoryBreakdown[];
  expenseByCategory?: ReportCategoryBreakdown[];
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Cash / نقد',
  bank_transfer: 'Bank Transfer / بینک ٹرانسفر',
  jazzcash: 'JazzCash / جاز کیش',
  easypaisa: 'EasyPaisa / ایزی پیسہ',
};

function netLabelText(net: number, mode: 'balance' | 'profitLoss'): string {
  if (mode === 'balance') return 'Net Balance / خالص بیلنس';
  return net >= 0 ? 'Net Profit / خالص منافع' : 'Net Loss / خالص نقصان';
}

export function ReportContent({
  shopName,
  ownerName,
  reportTitle,
  periodLabel,
  totalIncome,
  totalExpenses,
  net,
  netLabel,
  transactions,
  incomeByCategory,
  expenseByCategory,
}: ReportContentProps) {
  const hasData =
    totalIncome > 0 ||
    totalExpenses > 0 ||
    (transactions && transactions.length > 0) ||
    (incomeByCategory && incomeByCategory.length > 0) ||
    (expenseByCategory && expenseByCategory.length > 0);

  return (
    <div className="space-y-4 bg-white p-6 text-sm">
      <header className="border-b border-gray-200 pb-3">
        <h1 className="text-lg font-semibold">{reportTitle}</h1>
        <p className="text-gray-600">
          {shopName} — {ownerName}
        </p>
        <p className="text-gray-500">{periodLabel}</p>
      </header>

      {!hasData ? (
        <p className="text-gray-500">Is muddat mein koi record nahi mila / No records found for this period</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded border border-gray-200 p-3">
              <p className="text-gray-500">Total Income / کل آمدنی</p>
              <p className="text-base font-semibold">{formatPKR(totalIncome)}</p>
            </div>
            <div className="rounded border border-gray-200 p-3">
              <p className="text-gray-500">Total Expenses / کل اخراجات</p>
              <p className="text-base font-semibold">{formatPKR(totalExpenses)}</p>
            </div>
            <div className="rounded border border-gray-200 p-3">
              <p className="text-gray-500">{netLabelText(net, netLabel)}</p>
              <p className={`text-base font-semibold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPKR(net)}
              </p>
            </div>
          </div>

          {transactions && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="px-2 py-1">Date / تاریخ</th>
                  <th className="px-2 py-1">Category / کیٹیگری</th>
                  <th className="px-2 py-1">Payment Method / ادائیگی کا طریقہ</th>
                  <th className="px-2 py-1">Amount / رقم</th>
                  <th className="px-2 py-1">Description / تفصیل</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-2 py-1">{tx.date}</td>
                    <td className="px-2 py-1">{tx.category_name}</td>
                    <td className="px-2 py-1">{PAYMENT_METHOD_LABELS[tx.payment_method] ?? tx.payment_method}</td>
                    <td className="px-2 py-1">{formatPKR(tx.amount)}</td>
                    <td className="px-2 py-1">{tx.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(incomeByCategory || expenseByCategory) && (
            <div className="grid grid-cols-2 gap-4">
              {incomeByCategory && (
                <div>
                  <h2 className="mb-1 font-medium">Income by Category / کیٹیگری کے لحاظ سے آمدنی</h2>
                  <table className="w-full text-left">
                    <tbody>
                      {incomeByCategory.map((row) => (
                        <tr key={row.category_name} className="border-b border-gray-100 last:border-0">
                          <td className="px-2 py-1">{row.category_name}</td>
                          <td className="px-2 py-1">{formatPKR(row.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {expenseByCategory && (
                <div>
                  <h2 className="mb-1 font-medium">Expense by Category / کیٹیگری کے لحاظ سے اخراجات</h2>
                  <table className="w-full text-left">
                    <tbody>
                      {expenseByCategory.map((row) => (
                        <tr key={row.category_name} className="border-b border-gray-100 last:border-0">
                          <td className="px-2 py-1">{row.category_name}</td>
                          <td className="px-2 py-1">{formatPKR(row.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
