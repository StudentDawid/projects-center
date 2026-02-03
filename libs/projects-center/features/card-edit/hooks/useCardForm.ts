import { ref, computed } from 'vue';
import type { Card, CardType } from '@projects-center/entities/card';
import { CardType as CardTypeEnum, Rarity as RarityEnum } from '@projects-center/entities/card';
import { useCardStore } from '@projects-center/entities/card/lib/useCardStore';

/**
 * Hook do zarządzania formularzem karty
 */
export function useCardForm(initialCard?: Card) {
  const cardStore = useCardStore();

  // Form state
  const formData = ref<Partial<Card>>(
    initialCard
      ? { ...initialCard }
      : {
          name: '',
          type: CardTypeEnum.EQUIPMENT,
          description: '',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCj7YlMf8R-HRaoS0_Fxl2H3wSEOWSDM7l9vLXS3ggeDKXH62lIFUWFPqN5gN6ZaAf69q5wcwfEQIE7FDtuGCobNQ46MqiQwayhkCgu_99fAX1s9SptKPP0qSNW9RI5vvLSc1vNWBGAY0waXYPzfERe8IPsIfsKDCID20g3htbDp5lynRGFUTlGYmAEg5zBTwAUrdUpBxHIN6aq0fLj19oL-0amb1nfWhqC4HiO7Dfl_C45kiKudddOxoSML8jqzEH2Z7ga6m7SvaM',
          tags: [],
          buyValue: 100,
          rarity: RarityEnum.COMMON,
        }
  );

  const errors = ref<Record<string, string>>({});

  // Computed
  const isEditing = computed(() => !!initialCard?.id);
  const isValid = computed(() => {
    return (
      !!formData.value.type &&
      Object.keys(errors.value).length === 0
    );
  });

  // Methods
  function validate(): boolean {
    errors.value = {};

    if (!formData.value.type) {
      errors.value.type = 'Typ karty jest wymagany';
    }

    return Object.keys(errors.value).length === 0;
  }

  function setField(field: string, value: any): void {
    // For nested objects like stats, create a completely new object to ensure reactivity
    if (field === 'stats' && typeof value === 'object' && value !== null) {
      // Use JSON parse/stringify to create a completely new object reference
      const newValue = JSON.parse(JSON.stringify(value));
      (formData.value as any)[field] = newValue;
    } else {
      (formData.value as any)[field] = value;
    }
    // Wyczyść błąd dla tego pola
    if (errors.value[field]) {
      delete errors.value[field];
    }
  }

  function addTag(tag: string): void {
    if (!formData.value.tags) {
      formData.value.tags = [];
    }
    if (tag.trim() && !formData.value.tags.includes(tag.trim())) {
      formData.value.tags.push(tag.trim());
    }
  }

  function removeTag(tag: string): void {
    if (formData.value.tags) {
      const index = formData.value.tags.indexOf(tag);
      if (index > -1) {
        formData.value.tags.splice(index, 1);
      }
    }
  }

  function save(): Card {
    if (!validate()) {
      throw new Error('Formularz zawiera błędy');
    }

    const cardToSave = {
      ...formData.value,
      id: initialCard?.id || cardStore.generateId(),
      createdAt: initialCard?.createdAt || new Date(),
      updatedAt: new Date(),
    } as Card;

    if (isEditing.value) {
      cardStore.updateCard(cardToSave.id, cardToSave);
    } else {
      cardStore.addCard(cardToSave);
    }

    return cardToSave;
  }

  function reset(): void {
    formData.value = initialCard
      ? { ...initialCard }
      : {
          name: '',
          type: CardTypeEnum.EQUIPMENT,
          description: '',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCj7YlMf8R-HRaoS0_Fxl2H3wSEOWSDM7l9vLXS3ggeDKXH62lIFUWFPqN5gN6ZaAf69q5wcwfEQIE7FDtuGCobNQ46MqiQwayhkCgu_99fAX1s9SptKPP0qSNW9RI5vvLSc1vNWBGAY0waXYPzfERe8IPsIfsKDCID20g3htbDp5lynRGFUTlGYmAEg5zBTwAUrdUpBxHIN6aq0fLj19oL-0amb1nfWhqC4HiO7Dfl_C45kiKudddOxoSML8jqzEH2Z7ga6m7SvaM',
          tags: [],
          buyValue: 100,
          rarity: RarityEnum.COMMON,
        };
    errors.value = {};
  }

  return {
    formData,
    errors,
    isEditing,
    isValid,
    validate,
    setField,
    addTag,
    removeTag,
    save,
    reset,
  };
}

