<template>
  <div 
    class="card-element absolute"
    :class="{ 'is-selected': isSelected }"
    :style="elementStyle"
    @mousedown.stop="onMouseDown"
    @click.stop
  >
    <!-- Text rendering -->
    <div 
      v-if="element.type === 'text'" 
      class="element-content text-content" 
      :style="textStyle"
    >
      {{ element.content }}
    </div>
    
    <!-- Image rendering -->
    <img 
      v-else-if="element.type === 'image'" 
      :src="element.src" 
      class="element-content image-content" 
      :style="imageStyle" 
      draggable="false"
    />
    
    <!-- Resize Handles -->
    <template v-if="isSelected && editable">
      <div class="resize-handle top-left" @mousedown.stop="onResizeDown($event, 'tl')"></div>
      <div class="resize-handle top-right" @mousedown.stop="onResizeDown($event, 'tr')"></div>
      <div class="resize-handle bottom-left" @mousedown.stop="onResizeDown($event, 'bl')"></div>
      <div class="resize-handle bottom-right" @mousedown.stop="onResizeDown($event, 'br')"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CardElement as ICardElement, CardTextElement, CardImageElement } from '~/types/card';

const props = defineProps<{
  element: ICardElement;
  isSelected: boolean;
  editable: boolean;
}>();

const emit = defineEmits(['select', 'update']);

// Styles computation
const elementStyle = computed(() => {
  return {
    left: `${props.element.x}%`,
    top: `${props.element.y}%`,
    width: `${props.element.width}%`,
    height: `${props.element.height}%`,
    transform: `rotate(${props.element.rotation}deg)`,
    zIndex: props.element.zIndex,
  };
});

const textStyle = computed(() => {
  if (props.element.type !== 'text') return {};
  const el = props.element as CardTextElement;
  return {
    fontSize: `${el.fontSize}pt`,
    fontFamily: el.fontFamily,
    fontWeight: el.fontWeight,
    fontStyle: el.fontStyle,
    textAlign: el.textAlign as any,
    color: el.color,
  };
});

const imageStyle = computed(() => {
  if (props.element.type !== 'image') return {};
  const el = props.element as CardImageElement;
  return {
    objectFit: el.objectFit as any,
    opacity: el.opacity,
  };
});

// Dragging Logic
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0, elX: 0, elY: 0 });

const onMouseDown = (e: MouseEvent) => {
  if (!props.editable) return;
  emit('select');
  
  isDragging.value = true;
  dragStart.value = {
    x: e.clientX,
    y: e.clientY,
    elX: props.element.x,
    elY: props.element.y
  };
  
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  
  const parent = (e.target as HTMLElement).closest('.card-container');
  if (!parent) return;
  
  const rect = parent.getBoundingClientRect();
  
  // Calculate delta in %
  const dx = ((e.clientX - dragStart.value.x) / rect.width) * 100;
  const dy = ((e.clientY - dragStart.value.y) / rect.height) * 100;
  
  emit('update', { 
    x: dragStart.value.elX + dx, 
    y: dragStart.value.elY + dy 
  });
};

const onMouseUp = () => {
  isDragging.value = false;
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
};

// Resizing Logic (simplified)
const isResizing = ref(false);
const resizeHandle = ref('');

const onResizeDown = (e: MouseEvent, handle: string) => {
  if (!props.editable) return;
  isResizing.value = true;
  resizeHandle.value = handle;
  
  dragStart.value = {
    x: e.clientX,
    y: e.clientY,
    elX: props.element.x,
    elY: props.element.y
  };
  
  // Need to store initial sizes
  (dragStart.value as any).elW = props.element.width;
  (dragStart.value as any).elH = props.element.height;

  window.addEventListener('mousemove', onResizeMove);
  window.addEventListener('mouseup', onResizeUp);
};

const onResizeMove = (e: MouseEvent) => {
  if (!isResizing.value) return;
  const parent = document.querySelector('.card-container');
  if (!parent) return;
  const rect = parent.getBoundingClientRect();
  
  const dx = ((e.clientX - dragStart.value.x) / rect.width) * 100;
  const dy = ((e.clientY - dragStart.value.y) / rect.height) * 100;
  
  let newX = dragStart.value.elX;
  let newY = dragStart.value.elY;
  let newW = (dragStart.value as any).elW;
  let newH = (dragStart.value as any).elH;

  if (resizeHandle.value.includes('r')) newW += dx;
  if (resizeHandle.value.includes('b')) newH += dy;
  if (resizeHandle.value.includes('l')) { newX += dx; newW -= dx; }
  if (resizeHandle.value.includes('t')) { newY += dy; newH -= dy; }

  // Prevent negative widths
  if (newW < 2) newW = 2;
  if (newH < 2) newH = 2;

  emit('update', { x: newX, y: newY, width: newW, height: newH });
};

const onResizeUp = () => {
  isResizing.value = false;
  window.removeEventListener('mousemove', onResizeMove);
  window.removeEventListener('mouseup', onResizeUp);
};
</script>

<style scoped>
.absolute { position: absolute; }
.card-element {
  cursor: grab;
  user-select: none;
}
.card-element:active { cursor: grabbing; }

.element-content {
  width: 100%;
  height: 100%;
  pointer-events: none; /* Let the container handle dragging */
}

.text-content {
  display: flex;
  align-items: center;
  justify-content: inherit;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.is-selected {
  outline: 2px dashed #7C4DFF;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border: 2px solid #7C4DFF;
  border-radius: 50%;
  z-index: 10;
}
.top-left { top: -5px; left: -5px; cursor: nwse-resize; }
.top-right { top: -5px; right: -5px; cursor: nesw-resize; }
.bottom-left { bottom: -5px; left: -5px; cursor: nesw-resize; }
.bottom-right { bottom: -5px; right: -5px; cursor: nwse-resize; }
</style>
