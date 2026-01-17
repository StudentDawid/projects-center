<template>
  <div class="card-generator-workspace">
    <!-- Global Navigation -->
    <nav class="global-nav">
      <div class="nav-brand">
        <span class="material-symbols-outlined">diamond</span>
      </div>
      <div class="nav-items">
        <NuxtLink
          to="/rpg/fabula-ultima-card-generator"
          class="nav-item"
          title="Dashboard"
        >
          <span class="material-symbols-outlined">dashboard</span>
        </NuxtLink>
        <button class="nav-item" title="My Decks">
          <span class="material-symbols-outlined">folder_open</span>
        </button>
        <NuxtLink
          to="/rpg/fabula-ultima-card-generator/print-layout"
          class="nav-item"
          title="Print Layout"
        >
          <span class="material-symbols-outlined">print</span>
        </NuxtLink>
        <button class="nav-item" title="Settings">
          <span class="material-symbols-outlined">settings</span>
        </button>
      </div>
      <div class="nav-footer">
        <div class="user-avatar" />
      </div>
    </nav>

    <!-- Main Workspace -->
    <main class="main-workspace">
      <!-- Background Layer -->
      <div class="workspace-bg">
        <div class="grid-pattern" />
      </div>

      <!-- Top Action Bar -->
      <header class="workspace-header">
        <div class="breadcrumbs">
          <NuxtLink
            to="/rpg/fabula-ultima-card-generator"
            class="breadcrumb-link"
          >
            My Cards
          </NuxtLink>
          <span class="material-symbols-outlined breadcrumb-separator"
            >chevron_right</span
          >
          <span class="breadcrumb-current">Editing Card</span>
        </div>
        <div class="toolbar">
          <NuxtLink to="/rpg/fabula-ultima-card-generator" class="toolbar-btn">
            <span class="material-symbols-outlined">arrow_back</span>
            Back
          </NuxtLink>
        </div>
      </header>

      <!-- Content -->
      <div class="workspace-content">
        <div v-if="loading" class="loading">Ładowanie...</div>
        <div v-else-if="!card" class="error">Karta nie została znaleziona</div>
        <div v-else class="form-container">
          <div class="form-wrapper">
            <CardForm
              ref="cardFormRef"
              :card="card"
              @save="handleSave"
              @cancel="handleCancel"
            />
          </div>
          <div class="preview-wrapper">
            <div v-if="previewCard" class="preview-container">
              <CardItem :card="previewCard" :show-controls="false" />
            </div>
            <div v-else class="preview-placeholder">
              <p>Ładowanie podglądu...</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import type { Card } from '~/shared/fabula-ultima-card-generator/types/card.types';
import { useCardStore } from '~/stores/fabula-ultima-card-generator/cards';
import CardForm from '~/features/rpg-fabula-ultima-card-generator/ui/CardForm.vue';
import CardItem from '~/features/rpg-fabula-ultima-card-generator/ui/CardItem.vue';

const route = useRoute();
const router = useRouter();
const cardStore = useCardStore();

useHead({
  title: 'Edytuj kartę - Generator Kart Fabula Ultima',
});

const cardId = computed(() => route.params.id as string);
const card = computed(() => cardStore.getCardById(cardId.value));
const loading = ref(false);
const cardFormRef = ref<InstanceType<typeof CardForm> | null>(null);

// Force reactivity by watching formData changes
const previewCardTrigger = ref(0);

// Watch entire formData to catch all changes using watchEffect
watchEffect(() => {
  const formDataRef = cardFormRef.value?.formData;
  if (!formDataRef) {
    return;
  }
  // formDataRef might be the ref itself OR the value
  const formData =
    'value' in formDataRef ? (formDataRef as any).value : formDataRef;
  if (!formData) {
    return;
  }
  // Access all fields to track changes
  void formData.name;
  void formData.type;
  void formData.description;
  void formData.image;
  void formData.tags;
  void formData.stats;
  void formData.rarity;
  void formData.slot;
  void formData.buyValue;
  void formData.sellValue;
  void formData.weaponType;
  void formData.weaponHands;
  // Trigger update
  previewCardTrigger.value++;
});

const previewCard = computed(() => {
  // Access trigger to force recomputation
  void previewCardTrigger.value;

  if (!card.value) {
    return null;
  }

  // Access formData through ref - formData is exposed as a ref from CardForm
  const formDataRef = cardFormRef.value?.formData;
  const isRef = formDataRef && 'value' in formDataRef;

  if (!formDataRef) {
    return card.value;
  }

  // formDataRef might be the ref itself OR the value (defineExpose may unwrap refs)
  // Check if it has .value property (it's a ref) or use it directly (it's already the value)
  const formData = isRef ? (formDataRef as any).value : formDataRef;

  if (!formData) {
    return card.value;
  }

  // Access stats to track changes - use trigger to ensure we read latest value
  const stats = formData.stats;

  // Always merge formData with card, using defaults for empty fields
  // Create a completely new object to ensure reactivity
  const mergedCard: Card = {
    ...card.value,
    ...formData,
    // Use formData values or fallback to card values or defaults
    name: formData.name || card.value.name || '',
    description: formData.description || card.value.description || '',
    type: formData.type || card.value.type,
    buyValue: formData.buyValue ?? card.value.buyValue ?? 100,
    weaponType: formData.weaponType ?? (card.value as any).weaponType,
    weaponHands: formData.weaponHands ?? (card.value as any).weaponHands,
    slot: formData.slot ?? (card.value as any).slot,
    // Deep copy stats to ensure nested changes trigger reactivity
    stats: stats
      ? JSON.parse(JSON.stringify(stats))
      : (card.value as any).stats,
  } as Card;

  return mergedCard;
});

function handleSave(_savedCard: Card): void {
  router.push('/rpg/fabula-ultima-card-generator');
}

function handleCancel(): void {
  router.push('/rpg/fabula-ultima-card-generator');
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Epilogue:ital,wght@0,100..900;1,100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.card-generator-workspace {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: 'Epilogue', sans-serif;
  background: #fdf8ed;
  color: #1e293b;
}

// Global Navigation (72px)
.global-nav {
  width: 72px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 0;
  background: #f7f2e6;
  border-right: 1px solid #e7e5e0;
  box-shadow: 4px 0 24px -12px rgba(0, 0, 0, 0.1);
  z-index: 30;
}

.nav-brand {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #296a6a 0%, #1d4f4f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  .material-symbols-outlined {
    font-size: 24px;
  }
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  align-items: center;
}

.nav-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #a8a29e;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  border: none;
  background: none;
  cursor: pointer;

  &:hover {
    color: #296a6a;
    background: rgba(41, 106, 106, 0.1);
  }

  &.active {
    background: rgba(41, 106, 106, 0.1);
    color: #296a6a;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  }

  .material-symbols-outlined {
    font-size: 24px;
  }
}

.nav-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2ddd6;
  border: 1px solid #d1ccc5;
}

// Main Workspace
.main-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  overflow: hidden;
}

.workspace-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fdf8ed;
  z-index: 0;
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#296a6a 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.08;
  pointer-events: none;
}

.workspace-header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 64px;
  min-height: 64px;
  flex-shrink: 0;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(231, 229, 224, 0.5);
  background: rgba(253, 248, 237, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.breadcrumb-link {
  color: #5e8787;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #296a6a;
    text-decoration: underline;
  }
}

.breadcrumb-separator {
  font-size: 16px;
  color: #d5e2e2;
}

.breadcrumb-current {
  color: #111818;
  font-weight: 700;
  background: #eaf0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #d5e2e2;
  background: white;
  color: #111818;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: #f0f4f4;
    border-color: #b0caca;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
}

.workspace-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

.loading,
.error {
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.2rem;
  color: #5e8787;
}

.error {
  color: #c44;
}

.form-container {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.form-wrapper {
  min-width: 0;
}

.preview-wrapper {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.preview-container {
  width: 360px;
  overflow: visible;
  min-width: 0;
}

.preview-placeholder {
  padding: 3rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.6);
  border: 2px dashed #d5e2e2;
  border-radius: 8px;
  color: #5e8787;
  font-style: italic;

  p {
    margin: 0;
    font-size: 14px;
  }
}

@media (max-width: 1200px) {
  .form-container {
    grid-template-columns: 1fr;
  }

  .preview-wrapper {
    position: static;
  }
}
</style>
