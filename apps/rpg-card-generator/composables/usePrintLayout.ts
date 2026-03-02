import type { Card } from '~/types/card';
import type { ExportSettings, PrintLayoutResult, PrintPage, PrintCardPlacement } from '~/types/export';

export function calculateLayout(cardsToPrint: Card[], settings: ExportSettings): PrintLayoutResult {
  if (cardsToPrint.length === 0) return { pages: [], totalPages: 0, cardsPerPage: 0 };

  const { widthMm: pageW, heightMm: pageH } = settings.pageSize;
  const margin = settings.marginMm;
  const gap = settings.gapMm;

  // Zakładamy, że wszystkie zaznaczone karty mają rozmiar pierwszej karty w partii
  const cardW = cardsToPrint[0].size.widthMm;
  const cardH = cardsToPrint[0].size.heightMm;

  const availableW = pageW - 2 * margin;
  const availableH = pageH - 2 * margin;

  const cols = Math.floor((availableW + gap) / (cardW + gap));
  const rows = Math.floor((availableH + gap) / (cardH + gap));
  
  const cardsPerPage = cols * rows;
  if (cardsPerPage <= 0) return { pages: [], totalPages: 0, cardsPerPage: 0 };

  const gridW = cols * cardW + (cols - 1) * gap;
  const gridH = rows * cardH + (rows - 1) * gap;
  
  // Centrowanie grida
  const startX = margin + (availableW - gridW) / 2;
  const startY = margin + (availableH - gridH) / 2;

  const pages: PrintPage[] = [];
  let currentCardIdx = 0;
  let pageNum = 1;

  while (currentCardIdx < cardsToPrint.length) {
    const frontPlacements: PrintCardPlacement[] = [];
    const backPlacements: PrintCardPlacement[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (currentCardIdx >= cardsToPrint.length) break;
        
        const card = cardsToPrint[currentCardIdx];
        const x = startX + col * (cardW + gap);
        const y = startY + row * (cardH + gap);
        
        frontPlacements.push({ cardId: card.id, x, y, width: cardW, height: cardH });

        if (settings.duplex) {
          // Lustrzane odbicie kolumny dla tyłu
          const mirrorCol = cols - 1 - col;
          const backX = startX + mirrorCol * (cardW + gap);
          backPlacements.push({ cardId: card.id, x: backX, y, width: cardW, height: cardH });
        }

        currentCardIdx++;
      }
    }

    pages.push({ pageNumber: pageNum++, side: 'front', cards: frontPlacements });
    if (settings.duplex && backPlacements.length > 0) {
      pages.push({ pageNumber: pageNum++, side: 'back', cards: backPlacements });
    }
  }

  return { pages, totalPages: pageNum - 1, cardsPerPage };
}
