import { defineStore } from 'pinia';
import type { Card, CardElement } from '~/types/card';

export const useCardsStore = defineStore('rpg-cards', {
  state: () => ({
    cards: [] as Card[],
    currentEditId: null as string | null,
  }),

  getters: {
    allCards: (state) => state.cards,
    currentCard: (state) => state.cards.find(c => c.id === state.currentEditId) ?? null,
    cardById: (state) => (id: string) => state.cards.find(c => c.id === id),
  },

  actions: {
    addCard(card: Card) {
      this.cards.push(card);
    },
    updateCard(id: string, updates: Partial<Card>) {
      const idx = this.cards.findIndex(c => c.id === id);
      if (idx !== -1) {
        this.cards[idx] = { ...this.cards[idx], ...updates, updatedAt: Date.now() };
      }
    },
    deleteCard(id: string) {
      this.cards = this.cards.filter(c => c.id !== id);
    },
    duplicateCard(id: string) {
      const card = this.cards.find(c => c.id === id);
      if (card) {
        const clone: Card = {
          ...JSON.parse(JSON.stringify(card)),
          id: crypto.randomUUID(),
          name: `${card.name} (kopia)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        this.cards.push(clone);
      }
    },
    setCurrentEdit(id: string | null) {
      this.currentEditId = id;
    },

    // Elementy na karcie
    addElement(cardId: string, element: CardElement) {
      const card = this.cards.find(c => c.id === cardId);
      if (card) {
        card.elements.push(element);
        card.updatedAt = Date.now();
      }
    },
    updateElement(cardId: string, elementId: string, updates: Partial<CardElement>) {
      const card = this.cards.find(c => c.id === cardId);
      if (card) {
        const elIdx = card.elements.findIndex(e => e.id === elementId);
        if (elIdx !== -1) {
          card.elements[elIdx] = { ...card.elements[elIdx], ...updates } as typeof card.elements[0];
          card.updatedAt = Date.now();
        }
      }
    },
    removeElement(cardId: string, elementId: string) {
      const card = this.cards.find(c => c.id === cardId);
      if (card) {
        card.elements = card.elements.filter(e => e.id !== elementId);
        card.updatedAt = Date.now();
      }
    }
  },

  persist: {
    key: 'rpg-card-generator-cards',
  },
});
