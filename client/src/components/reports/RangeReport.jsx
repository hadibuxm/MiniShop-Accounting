import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getRangeReport, exportRangePdf } from '../../api/reports';
import { formatCurrency } from '../../utils/formatCurrency';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function RangeReport() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  async function handleGenerate() {
    if (endDate < startDate) {
      setError(t('validation.end_before_start'));
      setReport(null);
      return;
    }
    setError(null);
    const data = await getRangeReport(startDate, endDate);
    setReport(data);
  }

  return (
    <div className="report-panel">
      <div className="report-controls">
        <label>
          {t('reports.start_date')}
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          {t('reports.end_date')}
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button type="button" onClick={handleGenerate}>
          {t('reports.generate')}
        </button>
        {report && (
          <button type="button" onClick={() => exportRangePdf(startDate, endDate)}>
            {t('reports.export_pdf')}
          </button>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

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
