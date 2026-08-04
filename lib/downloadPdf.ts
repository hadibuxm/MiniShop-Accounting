export async function downloadReportPdf(
  reportType: 'daily' | 'monthly' | 'custom',
  params: Record<string, string>
): Promise<void> {
  const res = await fetch('/api/reports/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_type: reportType, params }),
  });

  if (!res.ok) {
    throw new Error('PDF export failed');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `report-${reportType}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
