/**
 * Currency utilities for Indonesian Rupiah (IDR)
 */

export const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const idrNumberFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format a number as Rupiah (e.g. "Rp 1.500.000" or "1.500.000")
 */
export function formatRupiah(amount: number, withPrefix = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return withPrefix ? 'Rp 0' : '0';
  }
  if (withPrefix) {
    return idrFormatter.format(amount);
  }
  return idrNumberFormatter.format(amount);
}

/**
 * Parse a string or formatted number into an integer nominal
 * e.g. "1.500.000" -> 1500000
 * e.g. "Rp 25.000" -> 25000
 */
export function parseRupiah(input: string | number): number {
  if (typeof input === 'number') return Math.round(input);
  if (!input) return 0;

  // Remove any non-digits
  const clean = input.replace(/\D/g, '');
  if (!clean) return 0;

  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format input value as user types digits with thousand separators
 */
export function formatRupiahInput(value: string | number): string {
  const num = parseRupiah(value);
  if (num === 0 && (value === '' || value === '0')) return '';
  return idrNumberFormatter.format(num);
}
