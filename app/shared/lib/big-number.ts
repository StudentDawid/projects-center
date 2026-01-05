/**
 * Big Number utilities for handling large numbers in idle games
 * Uses break_infinity.js for numbers > 10^308
 */
import Decimal from 'break_infinity.js';

export { Decimal };

// Type alias for cleaner code
export type BigNum = Decimal;

/**
 * Create a new Decimal from various inputs
 */
export function bn(value: number | string | Decimal): Decimal {
  return new Decimal(value);
}

/**
 * Format large numbers for display
 * Examples: 1000 -> "1.00K", 1000000 -> "1.00M"
 */
export function formatNumber(value: Decimal | number, precision: number = 2): string {
  const decimal = value instanceof Decimal ? value : new Decimal(value);

  if (decimal.lt(1000)) {
    return decimal.toFixed(precision);
  }

  const suffixes = [
    '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
    'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg',
  ];

  const exponent = decimal.exponent;
  const suffixIndex = Math.floor(exponent / 3);

  if (suffixIndex >= suffixes.length) {
    return decimal.toExponential(precision);
  }

  const mantissa = decimal.div(Decimal.pow(1000, suffixIndex));
  return `${mantissa.toFixed(precision)}${suffixes[suffixIndex]}`;
}

/**
 * Format number with commas for smaller values
 */
export function formatWithCommas(value: Decimal | number): string {
  const decimal = value instanceof Decimal ? value : new Decimal(value);

  if (decimal.gte(1e6)) {
    return formatNumber(decimal);
  }

  return decimal.toNumber().toLocaleString('pl-PL', {
    maximumFractionDigits: 0,
  });
}

/**
 * Calculate cost with exponential scaling
 * Formula: baseCost * multiplier ^ currentCount
 */
export function calculateCost(
  baseCost: Decimal | number,
  multiplier: number,
  currentCount: number
): Decimal {
  const base = baseCost instanceof Decimal ? baseCost : new Decimal(baseCost);
  return base.mul(Decimal.pow(multiplier, currentCount));
}

/**
 * Calculate how many items can be bought with given currency
 */
export function calculateMaxBuyable(
  currency: Decimal,
  baseCost: Decimal | number,
  multiplier: number,
  currentCount: number
): number {
  let count = 0;
  let totalCost = new Decimal(0);
  let nextCost = calculateCost(baseCost, multiplier, currentCount);

  while (currency.gte(totalCost.add(nextCost))) {
    totalCost = totalCost.add(nextCost);
    count++;
    nextCost = calculateCost(baseCost, multiplier, currentCount + count);

    // Safety limit
    if (count > 1000) break;
  }

  return count;
}

/**
 * Calculate production per second
 */
export function calculateProduction(
  baseProduction: Decimal | number,
  count: number,
  multiplier: number = 1
): Decimal {
  const base = baseProduction instanceof Decimal ? baseProduction : new Decimal(baseProduction);
  return base.mul(count).mul(multiplier);
}

