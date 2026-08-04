import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDailyReport, exportDailyPdf } from '../../api/reports';
import { formatCurrency } from '../../utils/formatCurrency';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyReport() {
  const { t } = useTranslation();
  const [date, setDate] = useState(todayISO());
  const [report, setReport] = useState(null);

  async function handleGenerate() {
    const data = await getDailyReport(date);
    setReport(data);
  }

  return (
    <div className="report-panel">
      <div className="report-controls">
        <label>
          {t('reports.select_date')}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button type="button" onClick={handleGenerate}>
          {t('reports.generate')}
        </button>
        {report && (
          <button type="button" onClick={() => exportDailyPdf(date)}>
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

              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>{t('transactions.type')}</th>
                    <th>{t('transactions.category')}</th>
                    <th>{t('transactions.payment_method')}</th>
                    <th>{t('transactions.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td>
                        <span className={`type-badge type-badge--${txn.type}`}>{t(`transactions.${txn.type}`)}</span>
                      </td>
                      <td>{txn.Category ? txn.Category.name : ''}</td>
                      <td>{t(`transactions.${txn.payment_method}`)}</td>
                      <td>{formatCurrency(txn.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
