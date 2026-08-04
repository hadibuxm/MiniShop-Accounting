import client from './client';

export function getDailyReport(date) {
  return client.get('/reports/daily', { params: { date } }).then((res) => res.data.report);
}

export function getMonthlyReport(year, month) {
  return client.get('/reports/monthly', { params: { year, month } }).then((res) => res.data.report);
}

export function getRangeReport(startDate, endDate) {
  return client
    .get('/reports/range', { params: { start_date: startDate, end_date: endDate } })
    .then((res) => res.data.report);
}

async function downloadPdf(url, params, filename) {
  const res = await client.get(url, { params, responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export function exportDailyPdf(date) {
  return downloadPdf('/reports/daily/pdf', { date }, `daily-report-${date}.pdf`);
}

export function exportMonthlyPdf(year, month) {
  return downloadPdf('/reports/monthly/pdf', { year, month }, `monthly-report-${year}-${month}.pdf`);
}

export function exportRangePdf(startDate, endDate) {
  return downloadPdf(
    '/reports/range/pdf',
    { start_date: startDate, end_date: endDate },
    `range-report-${startDate}-to-${endDate}.pdf`
  );
}
