import { ref } from 'vue';
import type { ExportSettings, PageSize } from '~/types/export';

export const PAGE_SIZES: PageSize[] = [
  { id: 'a4', name: 'A4', widthMm: 210, heightMm: 297 },
  { id: 'a3', name: 'A3', widthMm: 297, heightMm: 420 },
  { id: 'letter', name: 'US Letter', widthMm: 215.9, heightMm: 279.4 },
];

export function useCardExport() {
  const settings = ref<ExportSettings>({
    pageSize: PAGE_SIZES[0],
    marginMm: 10,
    gapMm: 2,
    duplex: true,
    cutLines: true,
    selectedCardIds: []
  });

  const updateSettings = (updates: Partial<ExportSettings>) => {
    settings.value = { ...settings.value, ...updates };
  };

  const print = () => {
    window.print();
  };

  return {
    settings,
    updateSettings,
    print,
    PAGE_SIZES
  };
}
