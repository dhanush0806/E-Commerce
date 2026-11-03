import { describe, it, expect } from 'vitest';
import { formatCurrency, calculateDiscount } from '../utils/formatters';

describe('Formatters Utility', () => {
  it('should format numbers into Indian Rupees currency', () => {
    expect(formatCurrency(26990)).toContain('26,990');
    expect(formatCurrency(0)).toContain('0');
  });

  it('should calculate discount percentages correctly', () => {
    expect(calculateDiscount(15000, 20000)).toBe(25);
  });
});
