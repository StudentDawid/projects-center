import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RpgCard } from '../types';

export const useMtgCardStore = defineStore(
  'mtg-cards',
  () => {
    const cards = ref<RpgCard[]>([]);

    function addCard(card: RpgCard): void {
      const now = new Date();
      cards.value.push({
        ...card,
        id: card.id || generateId(),
        name: card.name || 'Untitled Card',
        tags: card.tags || [],
        stats: card.stats || [],
        createdAt: card.createdAt || now,
        updatedAt: now,
      });
    }

    function updateCard(id: string, updates: Partial<RpgCard>): void {
      const index = cards.value.findIndex((card) => card.id === id);
      if (index !== -1) {
        cards.value[index] = {
          ...cards.value[index],
          ...updates,
          id,
          updatedAt: new Date(),
        };
      }
    }

    function deleteCard(id: string): void {
      cards.value = cards.value.filter((card) => card.id !== id);
    }

    function duplicateCard(id: string): void {
      const existing = cards.value.find((card) => card.id === id);
      if (!existing) {
        return;
      }

      cards.value.push({
        ...existing,
        id: generateId(),
        name: `${existing.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    function getCard(id: string): RpgCard | undefined {
      return cards.value.find((card) => card.id === id);
    }

    function generateId(): string {
      return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    return {
      cards,
      addCard,
      updateCard,
      deleteCard,
      duplicateCard,
      getCard,
    };
  },
  {
    persist: {
      key: 'mtg-cards',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
    },
  }
);

