import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Card,
  CardFilters,
} from '~/entities/card';
import { CardType } from '~/entities/card';

export const useCardStore = defineStore(
  'fabula-ultima-cards',
  () => {
    // State
    const cards = ref<Card[]>([]);

    // Getters
    const allCards = computed(() => cards.value);

    const cardsByType = computed(() => {
      const grouped: Record<CardType, Card[]> = {
        [CardType.EQUIPMENT]: [],
        [CardType.SPELL]: [],
        [CardType.SKILL]: [],
        [CardType.QUEST]: [],
        [CardType.ITEM]: [],
        [CardType.NPC]: [],
        [CardType.LOCATION]: [],
      };

      cards.value.forEach((card) => {
        grouped[card.type].push(card);
      });

      return grouped;
    });

    const totalCards = computed(() => cards.value.length);

    // Actions
    /**
     * Dodaje nową kartę
     */
    function addCard(card: Card): void {
      const now = new Date();
      const newCard: Card = {
        ...card,
        id: card.id || generateId(),
        createdAt: card.createdAt || now,
        updatedAt: now,
      };
      cards.value.push(newCard);
    }

    /**
     * Aktualizuje istniejącą kartę
     */
    function updateCard(id: string, updates: Partial<Card>): void {
      const index = cards.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        cards.value[index] = {
          ...cards.value[index],
          ...updates,
          id, // Zapewniamy, że ID się nie zmieni
          updatedAt: new Date(),
        } as Card;
      }
    }

    /**
     * Usuwa kartę
     */
    function deleteCard(id: string): void {
      const index = cards.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        cards.value.splice(index, 1);
      }
    }

    /**
     * Duplikuje kartę
     */
    function duplicateCard(id: string): void {
      const card = cards.value.find((c) => c.id === id);
      if (card) {
        const duplicated: Card = {
          ...card,
          id: generateId(),
          name: `${card.name} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        cards.value.push(duplicated);
      }
    }

    /**
     * Pobiera kartę po ID
     */
    function getCardById(id: string): Card | undefined {
      return cards.value.find((c) => c.id === id);
    }

    /**
     * Filtruje karty zgodnie z kryteriami
     */
    function getFilteredCards(filters: CardFilters = {}): Card[] {
      let filtered = [...cards.value];

      // Filtrowanie po typach
      if (filters.types && filters.types.length > 0) {
        filtered = filtered.filter((card) =>
          filters.types!.includes(card.type)
        );
      }

      // Filtrowanie po tagach
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter((card) =>
          filters.tags!.some((tag) => card.tags.includes(tag))
        );
      }

      // Wyszukiwarka po nazwie
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (card) =>
            card.name.toLowerCase().includes(searchLower) ||
            card.description.toLowerCase().includes(searchLower) ||
            card.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }

      // Sortowanie
      if (filters.sortBy) {
        filtered.sort((a, b) => {
          let aValue: string | Date;
          let bValue: string | Date;

          switch (filters.sortBy) {
            case 'name':
              aValue = a.name;
              bValue = b.name;
              break;
            case 'type':
              aValue = a.type;
              bValue = b.type;
              break;
            case 'createdAt':
              aValue = a.createdAt;
              bValue = b.createdAt;
              break;
            case 'updatedAt':
              aValue = a.updatedAt;
              bValue = b.updatedAt;
              break;
            default:
              return 0;
          }

          if (aValue < bValue) {
            return filters.sortOrder === 'desc' ? 1 : -1;
          }
          if (aValue > bValue) {
            return filters.sortOrder === 'desc' ? -1 : 1;
          }
          return 0;
        });
      }

      return filtered;
    }

    /**
     * Pobiera wszystkie tagi używane w kartach
     */
    function getAllTags(): string[] {
      const tagSet = new Set<string>();
      cards.value.forEach((card) => {
        card.tags.forEach((tag) => tagSet.add(tag));
      });
      return Array.from(tagSet).sort();
    }

    /**
     * Eksportuje wszystkie karty do JSON
     */
    function exportCards(): string {
      return JSON.stringify(cards.value, null, 2);
    }

    /**
     * Importuje karty z JSON
     */
    function importCards(json: string): void {
      try {
        const imported = JSON.parse(json) as Card[];
        // Konwertujemy daty z stringów na obiekty Date
        const parsed = imported.map((card) => ({
          ...card,
          createdAt: new Date(card.createdAt),
          updatedAt: new Date(card.updatedAt),
        }));
        cards.value = parsed;
      } catch (error) {
        console.error('Błąd importu kart:', error);
        throw new Error('Nieprawidłowy format danych');
      }
    }

    /**
     * Czyści wszystkie karty
     */
    function clearAllCards(): void {
      cards.value = [];
    }

    /**
     * Generuje unikalne ID
     */
    function generateId(): string {
      return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    return {
      // State
      cards,
      // Getters
      allCards,
      cardsByType,
      totalCards,
      // Actions
      addCard,
      updateCard,
      deleteCard,
      getCardById,
      getFilteredCards,
      getAllTags,
      exportCards,
      importCards,
      clearAllCards,
      generateId,
      duplicateCard,
    };
  },
  {
    persist: {
      key: 'fabula-ultima-cards',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
    },
  }
);

