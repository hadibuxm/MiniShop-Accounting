import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DailyReport from '../components/reports/DailyReport';
import MonthlyReport from '../components/reports/MonthlyReport';
import RangeReport from '../components/reports/RangeReport';

const TABS = ['daily', 'monthly', 'range'];

export default function ReportsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('daily');

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('reports.title')}</h1>
      </div>

      <div className="report-tabs">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            className={tab === key ? 'active' : ''}
            onClick={() => setTab(key)}
          >
            {t(`reports.${key}`)}
          </button>
        ))}
      </div>

      {tab === 'daily' && <DailyReport />}
      {tab === 'monthly' && <MonthlyReport />}
      {tab === 'range' && <RangeReport />}
    </div>
  );
}
