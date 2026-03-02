import { computed } from 'vue';
import { useCardsStore } from '~/stores/cards';
import type { CardElement, CardTemplate, CardSize, CardBackground, CardTextElement, CardImageElement } from '~/types/card';

export function useCardEditor() {
  const store = useCardsStore();
  
  const currentCard = computed(() => store.currentCard);
  
  const addTextElement = () => {
    if (!currentCard.value) return;
    const el: CardTextElement = {
      id: crypto.randomUUID(),
      type: 'text',
      content: 'Nowy tekst',
      x: 10, y: 10, width: 80, height: 10,
      fontSize: 12, fontFamily: 'Roboto',
      fontWeight: 'normal', fontStyle: 'normal',
      textAlign: 'center', color: '#ffffff',
      rotation: 0, zIndex: currentCard.value.elements.length + 1
    };
    store.addElement(currentCard.value.id, el);
  };

  const addImageElement = (src: string) => {
    if (!currentCard.value) return;
    const el: CardImageElement = {
      id: crypto.randomUUID(),
      type: 'image', src,
      x: 10, y: 10, width: 50, height: 50,
      objectFit: 'cover', rotation: 0, zIndex: currentCard.value.elements.length + 1,
      opacity: 1
    };
    store.addElement(currentCard.value.id, el);
  };
  
  const updateElement = (id: string, updates: Partial<CardElement>) => {
    if (!currentCard.value) return;
    store.updateElement(currentCard.value.id, id, updates);
  };

  const removeElement = (id: string) => {
    if (!currentCard.value) return;
    store.removeElement(currentCard.value.id, id);
  };

  const applyTemplate = (template: CardTemplate) => {
    if (!currentCard.value) return;
    store.updateCard(currentCard.value.id, {
      size: template.size,
      background: template.background,
      backBackground: template.backBackground,
      elements: JSON.parse(JSON.stringify(template.elements)),
      templateId: template.id
    });
  };

  const setSize = (size: CardSize) => {
    if (!currentCard.value) return;
    store.updateCard(currentCard.value.id, { size });
  };

  const setBackground = (bg: CardBackground) => {
    if (!currentCard.value) return;
    store.updateCard(currentCard.value.id, { background: bg });
  };

  const setBackBackground = (bg: CardBackground) => {
    if (!currentCard.value) return;
    store.updateCard(currentCard.value.id, { backBackground: bg });
  };

  return {
    currentCard,
    addTextElement,
    addImageElement,
    updateElement,
    removeElement,
    applyTemplate,
    setSize,
    setBackground,
    setBackBackground
  };
}
