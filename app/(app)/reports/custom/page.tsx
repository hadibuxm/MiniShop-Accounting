'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ReportContent } from '@/components/reports/ReportContent';
import { downloadReportPdf } from '@/lib/downloadPdf';

const todayString = () => new Date().toISOString().slice(0, 10);

async function fetchCustomReport(startDate: string, endDate: string) {
  const res = await fetch(`/api/reports/custom?start_date=${startDate}&end_date=${endDate}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

async function fetchMe() {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  return data.user;
}

export default function CustomReportPage() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(todayString());
  const [endDate, setEndDate] = useState(todayString());
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: report, error } = useQuery({
    queryKey: ['reports-custom', startDate, endDate],
    queryFn: () => fetchCustomReport(startDate, endDate),
    retry: false,
  });
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: fetchMe });

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await downloadReportPdf('custom', { start_date: startDate, end_date: endDate });
    } catch {
      setExportError('PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t('reports.customTitle')}</h1>
      <ReportFilters onExport={handleExport} exporting={exporting}>
        <div>
          <label className="mb-1 block text-xs font-medium">{t('reports.startDate')}</label>
          <input
            type="date"
            value={startDate}
            max={todayString()}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">{t('reports.endDate')}</label>
          <input
            type="date"
            value={endDate}
            max={todayString()}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
      </ReportFilters>
      {(exportError || error) && (
        <p className="text-sm text-red-600">
          {exportError ?? t('reports.errorEndBeforeStart')}
        </p>
      )}
      {report && !error && (
        <ReportContent
          shopName={user?.shop_name ?? ''}
          ownerName={user?.full_name ?? ''}
          reportTitle={t('reports.customTitle')}
          periodLabel={`${startDate} — ${endDate}`}
          totalIncome={report.total_income}
          totalExpenses={report.total_expenses}
          net={report.net}
          netLabel="balance"
          incomeByCategory={report.income_by_category}
          expenseByCategory={report.expense_by_category}
        />
      )}
    </div>
  );
}
