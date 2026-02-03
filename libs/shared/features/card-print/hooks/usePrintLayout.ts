import { ref, computed } from 'vue';
import type {
  Card,
  PrintLayoutSettings,
} from '@shared/entities/card';

/**
 * Hook do zarządzania układem do druku
 */
export function usePrintLayout() {
  const selectedCardIds = ref<Set<string>>(new Set());
  const layoutSettings = ref<PrintLayoutSettings>({
    columns: 3,
    rows: 3,
    margins: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
    orientation: 'portrait',
    showBorders: true,
    showCutLines: true,
  });

  // Computed
  const selectedCardsCount = computed(() => selectedCardIds.value.size);
  const maxCardsPerPage = computed(() => layoutSettings.value.columns * layoutSettings.value.rows);

  const pages = computed(() => {
    const totalSelected = selectedCardIds.value.size;
    if (totalSelected === 0) return [];
    return Math.ceil(totalSelected / maxCardsPerPage.value);
  });

  // Methods
  function toggleCardSelection(cardId: string): void {
    if (selectedCardIds.value.has(cardId)) {
      selectedCardIds.value.delete(cardId);
    } else {
      selectedCardIds.value.add(cardId);
    }
  }

  function selectAll(cards: Card[]): void {
    selectedCardIds.value = new Set(cards.map((c) => c.id));
  }

  function deselectAll(): void {
    selectedCardIds.value.clear();
  }

  function isCardSelected(cardId: string): boolean {
    return selectedCardIds.value.has(cardId);
  }

  function getCardsForPage(cards: Card[], page: number): Card[] {
    const startIndex = (page - 1) * maxCardsPerPage.value;
    const endIndex = startIndex + maxCardsPerPage.value;
    const selectedCardsArray = Array.from(selectedCardIds.value);
    const filteredCards = cards.filter((c) => selectedCardsArray.includes(c.id));
    return filteredCards.slice(startIndex, endIndex);
  }

  function updateLayoutSettings(settings: Partial<PrintLayoutSettings>): void {
    layoutSettings.value = {
      ...layoutSettings.value,
      ...settings,
    };
  }

  function calculateCardSize(): { width: number; height: number } {
    const a4Width = layoutSettings.value.orientation === 'portrait' ? 210 : 297; // mm
    const a4Height = layoutSettings.value.orientation === 'portrait' ? 297 : 210; // mm

    const usableWidth =
      a4Width - layoutSettings.value.margins.left - layoutSettings.value.margins.right;
    const usableHeight =
      a4Height - layoutSettings.value.margins.top - layoutSettings.value.margins.bottom;

    const cardWidth = usableWidth / layoutSettings.value.columns;
    const cardHeight = usableHeight / layoutSettings.value.rows;

    return {
      width: cardWidth,
      height: cardHeight,
    };
  }

  function reset(): void {
    selectedCardIds.value.clear();
    layoutSettings.value = {
      columns: 3,
      rows: 3,
      margins: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
      orientation: 'portrait',
      showBorders: true,
      showCutLines: true,
    };
  }

  return {
    selectedCardIds,
    layoutSettings,
    selectedCardsCount,
    maxCardsPerPage,
    pages,
    toggleCardSelection,
    selectAll,
    deselectAll,
    isCardSelected,
    getCardsForPage,
    updateLayoutSettings,
    calculateCardSize,
    reset,
  };
}

