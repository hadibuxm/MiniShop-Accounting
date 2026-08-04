'use client';

import { useTranslation } from 'react-i18next';

export function ReportFilters({
  children,
  onExport,
  exporting,
}: {
  children: React.ReactNode;
  onExport: () => void;
  exporting: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-end justify-between gap-3 rounded border border-gray-200 bg-white p-3">
      <div className="flex flex-wrap items-end gap-2">{children}</div>
      <button
        type="button"
        onClick={onExport}
        disabled={exporting}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {t('common.exportPdf')}
      </button>
    </div>
  );
}
