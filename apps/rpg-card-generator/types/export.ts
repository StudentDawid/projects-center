export interface PageSize {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
}

export interface ExportSettings {
  pageSize: PageSize;
  marginMm: number;
  gapMm: number;
  duplex: boolean;
  cutLines: boolean;
  selectedCardIds: string[];
}

export interface PrintCardPlacement {
  cardId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PrintPage {
  pageNumber: number;
  side: 'front' | 'back';
  cards: PrintCardPlacement[];
}

export interface PrintLayoutResult {
  pages: PrintPage[];
  totalPages: number;
  cardsPerPage: number;
}
