import { defineStore } from 'pinia';
import type { Card, CardElement, CardTemplate } from '~/types/card';

export const useCardsStore = defineStore('rpg-cards', {
  state: () => ({
    cards: [] as Card[],
    templates: [] as CardTemplate[],
    currentEditId: null as string | null,
    isEditingTemplate: false,
  }),

  getters: {
    allCards: (state) => state.cards,
    allTemplates: (state) => state.templates,
    currentCard: (state) => {
      if (state.isEditingTemplate) {
        // Zwracamy rzutowany CardTemplate jako Card by edytor mial te same wlasciwosci (id, name, itp)
        const t = state.templates.find(t => t.id === state.currentEditId);
        if (!t) return null;
        return {
          ...t,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          templateId: null,
        } as Card;
      }
      return state.cards.find(c => c.id === state.currentEditId) ?? null;
    },
    cardById: (state) => (id: string) => state.cards.find(c => c.id === id),
    templateById: (state) => (id: string) => state.templates.find(t => t.id === id),
  },

  actions: {
    addCard(card: Card) {
      this.cards.push(card);
    },
    updateCard(id: string, updates: Partial<Card>) {
      const idx = this.cards.findIndex(c => c.id === id);
      if (idx !== -1) {
        this.cards[idx] = { ...this.cards[idx]!, ...updates, updatedAt: Date.now() } as Card;
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
    setCurrentEdit(id: string | null, isTemplate: boolean = false) {
      this.currentEditId = id;
      this.isEditingTemplate = isTemplate;
    },
    reorderCards(newCards: Card[]) {
      this.cards = newCards;
    },

    // Template Actions
    addTemplate(template: CardTemplate) {
      this.templates.push(template);
    },
    updateTemplate(id: string, updates: Partial<CardTemplate>) {
      const idx = this.templates.findIndex(t => t.id === id);
      if (idx !== -1) {
        this.templates[idx] = { ...this.templates[idx]!, ...updates } as CardTemplate;
      }
    },
    deleteTemplate(id: string) {
      this.templates = this.templates.filter(t => t.id !== id);
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
