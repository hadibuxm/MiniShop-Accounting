'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ReportContent } from '@/components/reports/ReportContent';
import { downloadReportPdf } from '@/lib/downloadPdf';

const todayString = () => new Date().toISOString().slice(0, 10);

async function fetchDailyReport(date: string) {
  const res = await fetch(`/api/reports/daily?date=${date}`);
  return res.json();
}

async function fetchMe() {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  return data.user;
}

export default function DailyReportPage() {
  const { t } = useTranslation();
  const [date, setDate] = useState(todayString());
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: report } = useQuery({
    queryKey: ['reports-daily', date],
    queryFn: () => fetchDailyReport(date),
  });
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: fetchMe });

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await downloadReportPdf('daily', { date });
    } catch {
      setExportError('PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t('reports.dailyTitle')}</h1>
      <ReportFilters onExport={handleExport} exporting={exporting}>
        <div>
          <label className="mb-1 block text-xs font-medium">{t('reports.selectDate')}</label>
          <input
            type="date"
            value={date}
            max={todayString()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
      </ReportFilters>
      {exportError && <p className="text-sm text-red-600">{exportError}</p>}
      {report && (
        <ReportContent
          shopName={user?.shop_name ?? ''}
          ownerName={user?.full_name ?? ''}
          reportTitle={t('reports.dailyTitle')}
          periodLabel={date}
          totalIncome={report.total_income}
          totalExpenses={report.total_expenses}
          net={report.net_balance}
          netLabel="balance"
          transactions={report.transactions}
        />
      )}
    </div>
  );
}
