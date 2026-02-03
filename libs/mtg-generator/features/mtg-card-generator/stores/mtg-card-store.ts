import { defineStore } from 'pinia';
import type { RpgCard } from '../types';

export const useMtgCardStore = defineStore('mtg-card-store', {
  state: () => ({
    cards: [] as RpgCard[],
  }),
  actions: {
    addCard(card: Omit<RpgCard, 'id'>) {
      const newCard = { ...card, id: crypto.randomUUID() };
      this.cards.push(newCard);
      return newCard;
    },
    duplicateCard(id: string) {
      const card = this.cards.find((c) => c.id === id);
      if (card) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...rest } = card;
        const newCard: RpgCard = {
          ...rest,
          id: crypto.randomUUID(),
          name: `${card.name} (Copy)`,
          stats: card.stats ? [...card.stats] : [],
          tags: card.tags ? [...card.tags] : [],
        };
        this.cards.push(newCard);
      }
    },
    updateCard(id: string, updates: Partial<Omit<RpgCard, 'id'>>) {
      const index = this.cards.findIndex((c) => c.id === id);
      if (index !== -1) {
        this.cards[index] = {
          ...this.cards[index],
          ...updates,
          id: this.cards[index].id,
        };
      }
    },
    deleteCard(id: string) {
      this.cards = this.cards.filter((c) => c.id !== id);
    },
    getCard(id: string) {
      return this.cards.find((c) => c.id === id);
    },
  },
  persist: true,
});
