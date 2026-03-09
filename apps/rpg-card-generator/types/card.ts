export interface CardSize {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  widthInch: number;
  heightInch: number;
}

export interface CardTextElement {
  id: string;
  type: 'text';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  rotation: number;
  zIndex: number;
}

export interface CardImageElement {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  objectFit: 'cover' | 'contain' | 'fill';
  rotation: number;
  zIndex: number;
  opacity: number;
}

export type CardElement = CardTextElement | CardImageElement;

export interface CardBackground {
  id: string;
  name: string;
  type: 'color' | 'gradient' | 'image';
  value: string;
}

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  size: CardSize;
  background: CardBackground;
  backBackground: CardBackground;
  elements: CardElement[];
}

export interface Card {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  size: CardSize;
  background: CardBackground;
  backBackground: CardBackground;
  elements: CardElement[];
  templateId: string | null;
}
