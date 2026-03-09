import type { CardSize } from '~/types/card';

export const CARD_SIZES: CardSize[] = [
  {
    id: 'mtg',
    name: 'MTG Standard (63 × 88 mm)',
    widthMm: 63,
    heightMm: 88,
    widthInch: 2.5,
    heightInch: 3.5,
  },
  {
    id: 'tarot',
    name: 'Tarot (70 × 120 mm)',
    widthMm: 70,
    heightMm: 120,
    widthInch: 2.76,
    heightInch: 4.72,
  },
  {
    id: 'poker',
    name: 'Poker (63.5 × 89 mm)',
    widthMm: 63.5,
    heightMm: 89,
    widthInch: 2.5,
    heightInch: 3.5,
  },
  {
    id: 'mini',
    name: 'Mini Card (44 × 63 mm)',
    widthMm: 44,
    heightMm: 63,
    widthInch: 1.73,
    heightInch: 2.48,
  },
  {
    id: 'square',
    name: 'Square (70 × 70 mm)',
    widthMm: 70,
    heightMm: 70,
    widthInch: 2.76,
    heightInch: 2.76,
  },
];
