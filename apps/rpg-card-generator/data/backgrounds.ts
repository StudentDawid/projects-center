import type { CardBackground } from '~/types/card';

export const CARD_BACKGROUNDS: CardBackground[] = [
  {
    id: 'bg-solid-dark',
    name: 'Dark Solid',
    type: 'color',
    value: '#1e1e1e',
  },
  {
    id: 'bg-gradient-magic',
    name: 'Magic Gradient',
    type: 'gradient',
    value: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  },
  {
    id: 'bg-gradient-fire',
    name: 'Fire Gradient',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff4e50 0%, #f9d423 100%)',
  },
  {
    id: 'bg-gradient-forest',
    name: 'Forest Gradient',
    type: 'gradient',
    value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  },
  {
    id: 'bg-gradient-dark',
    name: 'Dark Void',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  },
  {
    id: 'bg-color-parchment',
    name: 'Pergamin (Color)',
    type: 'color',
    value: '#f1e2c3',
  },
  {
    id: 'bg-image-mtg-template',
    name: 'MTG Template',
    type: 'image',
    value: new URL('../assets/img/card-templates/mtg-card-template.jpeg', import.meta.url).href,
  },
  {
    id: 'bg-color-fabula-front',
    name: 'Fabula Ultima - Front',
    type: 'color',
    value: '#f4f9f5', // Minty off-white background
  }
];

export const CARD_BACKS: CardBackground[] = [
  {
    id: 'back-solid-dark',
    name: 'Dark Back',
    type: 'color',
    value: '#121212',
  },
  {
    id: 'back-gradient-mystic',
    name: 'Mystic Back',
    type: 'gradient',
    value: 'linear-gradient(135deg, #4b1248 0%, #f0c27b 100%)',
  },
  {
    id: 'back-gradient-fabula',
    name: 'Fabula Ultima - Rewers',
    type: 'gradient',
    value: 'linear-gradient(135deg, #1f4234 0%, #35624d 100%)', // Dark green gradient
  }
];
