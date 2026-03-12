import { ref, watch } from 'vue';
import { useCardsStore } from '~/stores/cards';
import type { Card, CardElement, CardTemplate, CardSize, CardBackground, CardTextElement, CardImageElement } from '~/types/card';
import { CARD_SIZES } from '~/data/sizes';
import { CARD_BACKGROUNDS, CARD_BACKS } from '~/data/backgrounds';

// Singletons for the editor session
const localCard = ref<Card | null>(null);
const history = ref<string[]>([]);
const historyIndex = ref(-1);
const isUndoing = ref(false);
const isEditingTemplate = ref(false);

export function useCardEditor() {
  const store = useCardsStore();

  const currentCard = localCard;

  const pushHistory = () => {
    if (!localCard.value || isUndoing.value) return;
    const stateStr = JSON.stringify(localCard.value);
    
    // Ignore if identical to current history tip
    if (historyIndex.value >= 0 && history.value[historyIndex.value] === stateStr) return;
    
    // If we're not at the end of history, slice off the future
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1);
    }
    
    history.value.push(stateStr);
    
    if (history.value.length > 50) {
      history.value.shift();
    } else {
      historyIndex.value++;
    }
  };

  const initEditor = (cardId: string | null, asTemplate: boolean = false) => {
    history.value = [];
    historyIndex.value = -1;
    isUndoing.value = false;
    isEditingTemplate.value = asTemplate;

    if (cardId) {
      store.setCurrentEdit(cardId, asTemplate);
      const c = asTemplate ? store.templateById(cardId) : store.cardById(cardId);
      if (c) {
        // Both Card and CardTemplate map nicely into localCard type structure during editing.
        // If it's a template, we spoof createdAt/updatedAt just so localCard fits the Card interface fully
        localCard.value = {
          ...JSON.parse(JSON.stringify(c)),
          createdAt: 'createdAt' in c ? c.createdAt : Date.now(),
          updatedAt: 'updatedAt' in c ? c.updatedAt : Date.now(),
          templateId: 'templateId' in c ? c.templateId : null,
        } as Card;
      }
    } else {
      // Create new locally
      const newId = crypto.randomUUID();
      localCard.value = {
        id: newId,
        name: asTemplate ? 'Nowy Szablon' : 'Nowa Karta',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        size: CARD_SIZES[0]!,
        background: CARD_BACKGROUNDS[0]!,
        backBackground: CARD_BACKS[0]!,
        elements: [],
        templateId: null,
      };
      // We don't save to the store yet!
    }
    // Push initial state
    pushHistory();
  };

  const saveChanges = () => {
    if (localCard.value) {
      localCard.value.updatedAt = Date.now();
      
      if (isEditingTemplate.value) {
        const existingTemplate = store.templateById(localCard.value.id);
        const templateObj: CardTemplate = {
          id: localCard.value.id,
          name: localCard.value.name,
          description: '', // Could add description field in UI later
          thumbnail: '', // Needs canvas rendering logic later
          size: JSON.parse(JSON.stringify(localCard.value.size)),
          background: JSON.parse(JSON.stringify(localCard.value.background)),
          backBackground: JSON.parse(JSON.stringify(localCard.value.backBackground)),
          elements: JSON.parse(JSON.stringify(localCard.value.elements)),
        };

        if (existingTemplate) {
          store.updateTemplate(templateObj.id, templateObj);
        } else {
          store.addTemplate(templateObj);
        }
      } else {
        const existingCard = store.cardById(localCard.value.id);
        if (existingCard) {
          store.updateCard(localCard.value.id, JSON.parse(JSON.stringify(localCard.value)));
        } else {
          store.addCard(JSON.parse(JSON.stringify(localCard.value)));
        }
      }
    }
  };

  const undo = () => {
    if (historyIndex.value > 0) {
      isUndoing.value = true;
      historyIndex.value--;
      localCard.value = JSON.parse(history.value[historyIndex.value]!);
      setTimeout(() => { isUndoing.value = false; }, 0);
    }
  };

  const redo = () => {
    if (historyIndex.value < history.value.length - 1) {
      isUndoing.value = true;
      historyIndex.value++;
      localCard.value = JSON.parse(history.value[historyIndex.value]!);
      setTimeout(() => { isUndoing.value = false; }, 0);
    }
  };

  const addTextElement = () => {
    if (!localCard.value) return;
    const el: CardTextElement = {
      id: crypto.randomUUID(),
      type: 'text',
      content: 'Nowy tekst',
      x: 10, y: 10, width: 80, height: 10,
      fontSize: 12, fontFamily: 'Roboto',
      fontWeight: 'normal', fontStyle: 'normal',
      textAlign: 'center', color: '#ffffff',
      rotation: 0, zIndex: localCard.value.elements.length + 1
    };
    localCard.value.elements.push(el);
    pushHistory();
  };

  const addImageElement = (src: string) => {
    if (!localCard.value) return;
    const el: CardImageElement = {
      id: crypto.randomUUID(),
      type: 'image', src,
      x: 10, y: 10, width: 50, height: 50,
      objectFit: 'cover', rotation: 0, zIndex: localCard.value.elements.length + 1,
      opacity: 1
    };
    localCard.value.elements.push(el);
    pushHistory();
  };
  
  const updateElement = (id: string, updates: Partial<CardElement>) => {
    if (!localCard.value) return;
    const idx = localCard.value.elements.findIndex(e => e.id === id);
    if (idx !== -1) {
      localCard.value.elements[idx] = { ...localCard.value.elements[idx], ...updates } as CardElement;
      pushHistory();
    }
  };

  const removeElement = (id: string) => {
    if (!localCard.value) return;
    localCard.value.elements = localCard.value.elements.filter(e => e.id !== id);
    pushHistory();
  };

  const applyTemplate = (template: CardTemplate) => {
    if (!localCard.value) return;
    localCard.value.size = template.size;
    localCard.value.background = template.background;
    localCard.value.backBackground = template.backBackground;
    localCard.value.elements = JSON.parse(JSON.stringify(template.elements));
    localCard.value.templateId = template.id;
    pushHistory();
  };

  const setSize = (size: CardSize) => {
    if (!localCard.value) return;
    localCard.value.size = size;
    pushHistory();
  };

  const setBackground = (bg: CardBackground) => {
    if (!localCard.value) return;
    localCard.value.background = bg;
    pushHistory();
  };

  const setBackBackground = (bg: CardBackground) => {
    if (!localCard.value) return;
    localCard.value.backBackground = bg;
    pushHistory();
  };

  const updateName = (name: string) => {
    if (!localCard.value) return;
    localCard.value.name = name;
    // Don't push history on every keystroke, let the blur/drag do it, or just accept many history states
    pushHistory();
  };

  const updateElementsOrder = (elements: CardElement[]) => {
    if (!localCard.value) return;
    localCard.value.elements = elements;
    pushHistory();
  };

  return {
    currentCard,
    historyIndex,
    historyLength: computed(() => history.value.length),
    isEditingTemplate: computed(() => isEditingTemplate.value),
    initEditor,
    saveChanges,
    undo,
    redo,
    addTextElement,
    addImageElement,
    updateElement,
    removeElement,
    applyTemplate,
    setSize,
    setBackground,
    setBackBackground,
    updateName,
    updateElementsOrder
  };
}
