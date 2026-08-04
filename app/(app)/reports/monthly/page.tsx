'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ReportContent } from '@/components/reports/ReportContent';
import { downloadReportPdf } from '@/lib/downloadPdf';

const now = new Date();

async function fetchMonthlyReport(year: number, month: number) {
  const res = await fetch(`/api/reports/monthly?year=${year}&month=${month}`);
  return res.json();
}

async function fetchMe() {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  return data.user;
}

export default function MonthlyReportPage() {
  const { t } = useTranslation();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: report } = useQuery({
    queryKey: ['reports-monthly', year, month],
    queryFn: () => fetchMonthlyReport(year, month),
  });
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: fetchMe });

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await downloadReportPdf('monthly', { year: String(year), month: String(month) });
    } catch {
      setExportError('PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t('reports.monthlyTitle')}</h1>
      <ReportFilters onExport={handleExport} exporting={exporting}>
        <div>
          <label className="mb-1 block text-xs font-medium">{t('reports.selectMonth')}</label>
          <input
            type="month"
            value={`${year}-${String(month).padStart(2, '0')}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-').map(Number);
              setYear(y);
              setMonth(m);
            }}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
      </ReportFilters>
      {exportError && <p className="text-sm text-red-600">{exportError}</p>}
      {report && (
        <ReportContent
          shopName={user?.shop_name ?? ''}
          ownerName={user?.full_name ?? ''}
          reportTitle={t('reports.monthlyTitle')}
          periodLabel={`${year}-${String(month).padStart(2, '0')}`}
          totalIncome={report.total_income}
          totalExpenses={report.total_expenses}
          net={report.net}
          netLabel="profitLoss"
          incomeByCategory={report.income_by_category}
          expenseByCategory={report.expense_by_category}
        />
      )}
    </div>
  );
}
