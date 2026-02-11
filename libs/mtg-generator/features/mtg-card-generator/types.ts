export interface RpgCard {
  id: string;
  name: string;
  description?: string;
  image?: string;
  colorTheme?: string;
  tags: string[];
  stats: Array<{ label?: string; value?: string | number }>;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

