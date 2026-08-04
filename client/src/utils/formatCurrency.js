export function formatCurrency(amount) {
  const numeric = Number(amount) || 0;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(numeric));
  return `PKR ${formatted}`;
}
