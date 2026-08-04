function formatIndianGrouping(absValue: string): string {
  const [intPart, decimalPart] = absValue.split('.');
  let result: string;
  if (intPart.length <= 3) {
    result = intPart;
  } else {
    const lastThree = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    const restGrouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${restGrouped},${lastThree}`;
  }
  return decimalPart ? `${result}.${decimalPart}` : result;
}

export function formatPKR(amount: number): string {
  const isNegative = amount < 0;
  const fixed = Math.abs(amount).toFixed(2);
  const trimmed = fixed.endsWith('.00') ? fixed.slice(0, -3) : fixed;
  const grouped = formatIndianGrouping(trimmed);
  return `${isNegative ? '−' : ''}PKR ${grouped}`;
}
