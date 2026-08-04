import { describe, expect, it } from 'vitest';
import { formatCurrency } from '../utils/formatCurrency';

describe('formatCurrency', () => {
  it('formats amounts using lakh-style comma grouping', () => {
    expect(formatCurrency(125000)).toBe('PKR 1,25,000');
  });

  it('formats small amounts without extra separators', () => {
    expect(formatCurrency(500)).toBe('PKR 500');
  });

  it('rounds decimal amounts to the nearest whole rupee', () => {
    expect(formatCurrency(999.6)).toBe('PKR 1,000');
  });

  it('treats missing or invalid input as zero', () => {
    expect(formatCurrency(undefined)).toBe('PKR 0');
  });
});
