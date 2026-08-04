const PdfPrinter = require('pdfmake');

// pdfkit's built-in standard 14 PDF fonts — no external font files needed.
const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

const printer = new PdfPrinter(fonts);

function formatPKR(amount) {
  const rounded = Number(amount || 0).toFixed(2);
  const [whole, decimal] = rounded.split('.');
  const negative = whole.startsWith('-');
  const digits = negative ? whole.slice(1) : whole;
  let grouped;
  if (digits.length <= 3) {
    grouped = digits;
  } else {
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3);
    grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
  }
  return `${negative ? '-' : ''}PKR ${grouped}.${decimal}`;
}

function breakdownTable(title, rows) {
  if (!rows || rows.length === 0) return [];
  return [
    { text: title, style: 'sectionHeader', margin: [0, 12, 0, 4] },
    {
      table: {
        widths: ['*', 'auto'],
        body: [
          [{ text: 'Category', bold: true }, { text: 'Total', bold: true }],
          ...rows.map((r) => [r.category_name, formatPKR(r.total)]),
        ],
      },
    },
  ];
}

function buildReportPdf({ shopName, title, startDate, endDate, report }) {
  const dateRangeText = startDate === endDate ? startDate : `${startDate} - ${endDate}`;

  const content = [
    { text: shopName, style: 'shopName' },
    { text: title, style: 'reportTitle' },
    { text: dateRangeText, style: 'dateRange', margin: [0, 0, 0, 12] },
  ];

  if (report.is_empty) {
    content.push({ text: report.empty_state_message, margin: [0, 12, 0, 0] });
  } else {
    content.push({
      table: {
        widths: ['*', 'auto'],
        body: [
          ['Total Income', formatPKR(report.income)],
          ['Total Expenses', formatPKR(report.expense)],
          ['Net', formatPKR(report.net)],
        ],
      },
    });
    content.push(...breakdownTable('Income by Category', report.income_breakdown));
    content.push(...breakdownTable('Expense by Category', report.expense_breakdown));

    if (report.transactions && report.transactions.length > 0) {
      content.push({ text: 'Transactions', style: 'sectionHeader', margin: [0, 12, 0, 4] });
      content.push({
        table: {
          widths: ['auto', 'auto', 'auto', '*', 'auto'],
          body: [
            [
              { text: 'Date', bold: true },
              { text: 'Type', bold: true },
              { text: 'Category', bold: true },
              { text: 'Description', bold: true },
              { text: 'Amount', bold: true },
            ],
            ...report.transactions.map((t) => [
              t.date,
              t.type,
              t.Category ? t.Category.name : '',
              t.description || '',
              formatPKR(t.amount),
            ]),
          ],
        },
      });
    }
  }

  const docDefinition = {
    content,
    styles: {
      shopName: { fontSize: 16, bold: true },
      reportTitle: { fontSize: 13, margin: [0, 4, 0, 0] },
      dateRange: { fontSize: 10, color: '#555555' },
      sectionHeader: { fontSize: 12, bold: true },
    },
    defaultStyle: { fontSize: 10 },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  return pdfDoc;
}

module.exports = { buildReportPdf, formatPKR };
