import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMonthlyReport, exportMonthlyPdf } from '../../api/reports';
import { formatCurrency } from '../../utils/formatCurrency';

function currentYear() {
  return new Date().getFullYear();
}

function currentMonth() {
  return new Date().getMonth() + 1;
}

export default function MonthlyReport() {
  const { t } = useTranslation();
  const [year, setYear] = useState(currentYear());
  const [month, setMonth] = useState(currentMonth());
  const [report, setReport] = useState(null);

  async function handleGenerate() {
    const data = await getMonthlyReport(year, month);
    setReport(data);
  }

  return (
    <div className="report-panel">
      <div className="report-controls">
        <label>
          {t('reports.select_year')}
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        </label>
        <label>
          {t('reports.select_month')}
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={handleGenerate}>
          {t('reports.generate')}
        </button>
        {report && (
          <button type="button" onClick={() => exportMonthlyPdf(year, month)}>
            {t('reports.export_pdf')}
          </button>
        )}
      </div>

      {report && (
        <div className="report-results">
          {report.is_empty ? (
            <p className="empty-state">{report.empty_state_message}</p>
          ) : (
            <>
              <div className="report-totals">
                <div>
                  {t('reports.total_income')}: {formatCurrency(report.income)}
                </div>
                <div>
                  {t('reports.total_expense')}: {formatCurrency(report.expense)}
                </div>
                <div className={report.net >= 0 ? 'net-profit' : 'net-loss'}>
                  {report.net >= 0 ? t('reports.net_profit') : t('reports.net_loss')}: {formatCurrency(report.net)}
                </div>
              </div>

              <div className="breakdown-columns">
                <div>
                  <h3>{t('reports.income_breakdown')}</h3>
                  <ul>
                    {report.income_breakdown.map((row) => (
                      <li key={row.category_id}>
                        {row.category_name}: {formatCurrency(row.total)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>{t('reports.expense_breakdown')}</h3>
                  <ul>
                    {report.expense_breakdown.map((row) => (
                      <li key={row.category_id}>
                        {row.category_name}: {formatCurrency(row.total)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
