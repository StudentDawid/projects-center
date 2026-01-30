<script setup lang="ts">
/**
 * Wizard Panel - Spells, Elements, Research
 */

import { computed, ref } from 'vue';
import { useAteriaWizardStore } from '../model/wizard.store';
import {
  SPELLS,
  STAFFS,
  ELEMENTS,
  getElementColor,
  getElementName,
  type MagicElement,
  type SpellCategory,
} from '../data/wizard.data';

const wizardStore = useAteriaWizardStore();

// UI State
const activeTab = ref<'spells' | 'elements' | 'equipment' | 'research'>('spells');
const selectedElement = ref<MagicElement | 'all'>('all');

// Computed
const filteredSpells = computed(() => {
  if (selectedElement.value === 'all') {
    return wizardStore.availableSpells;
  }
  return wizardStore.availableSpells.filter(s => s.element === selectedElement.value);
});

const researchableSpells = computed(() => {
  return Object.values(SPELLS).filter(s => 
    s.researchCost > 0 && 
    !wizardStore.researchedSpells.has(s.id) &&
    s.requiredLevel <= wizardStore.progress.level
  );
});

// Actions
function castSpell(spellId: string) {
  wizardStore.startCasting(spellId);
}

function getCategoryIcon(category: SpellCategory): string {
  const icons: Record<SpellCategory, string> = {
    attack: 'mdi-sword',
    defense: 'mdi-shield',
    utility: 'mdi-cog',
    summoning: 'mdi-ghost',
    enchantment: 'mdi-auto-fix',
  };
  return icons[category];
}

function getCategoryName(category: SpellCategory): string {
  const names: Record<SpellCategory, string> = {
    attack: 'Atak',
    defense: 'Obrona',
    utility: 'Użytkowe',
    summoning: 'Przyzwanie',
    enchantment: 'Zaklęcia',
  };
  return names[category];
}
</script>

<template>
  <div class="wizard-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar
            color="purple"
            size="56"
            class="mr-4"
          >
            <v-icon
              size="32"
              color="white"
            >
              mdi-wizard-hat
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Czarodziej</span>
              <v-chip
                size="small"
                color="purple"
              >
                Poziom {{ wizardStore.progress.level }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Zaklęcia, żywioły, badania magiczne
            </div>
            <v-progress-linear
              :model-value="wizardStore.getXpProgress()"
              color="purple"
              height="8"
              rounded
              class="mt-2"
            >
              <template #default>
                <span class="text-caption">
                  {{ wizardStore.progress.xp }} / {{ wizardStore.progress.xpToNextLevel }} XP
                </span>
              </template>
            </v-progress-linear>
          </div>
        </div>

        <!-- Mana Bar -->
        <v-progress-linear
          :model-value="(wizardStore.mana / wizardStore.maxMana) * 100"
          color="blue"
          height="20"
          rounded
          class="mt-3"
        >
          <template #default>
            <span class="text-caption">
              Mana: {{ Math.floor(wizardStore.mana) }} / {{ wizardStore.maxMana }}
            </span>
          </template>
        </v-progress-linear>

        <!-- Quick Stats -->
        <v-row class="mt-3">
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ wizardStore.totalMagicPower }}
            </div>
            <div class="text-caption">
              Moc Magii
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ wizardStore.researchedSpells.size }}
            </div>
            <div class="text-caption">
              Zaklęcia
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ wizardStore.totalSpellsCast }}
            </div>
            <div class="text-caption">
              Rzucone
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6 text-red">
              {{ wizardStore.totalDamageDealt }}
            </div>
            <div class="text-caption">
              Obrażenia
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Active Casting -->
    <v-card
      v-if="wizardStore.isCasting && wizardStore.activeCasting"
      class="mb-4"
    >
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar
            color="purple"
            size="48"
            class="mr-3"
          >
            <v-icon color="white">
              {{ SPELLS[wizardStore.activeCasting.spellId]?.icon }}
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">
              Rzucanie: {{ SPELLS[wizardStore.activeCasting.spellId]?.name }}
            </div>
            <v-progress-linear
              :model-value="wizardStore.castingProgress"
              color="purple"
              height="20"
              rounded
            >
              <template #default>
                {{ Math.floor(wizardStore.castingProgress) }}%
              </template>
            </v-progress-linear>
          </div>
          <v-btn
            color="error"
            variant="tonal"
            class="ml-3"
            @click="wizardStore.cancelCasting()"
          >
            Anuluj
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="purple"
      class="mb-4"
    >
      <v-tab value="spells">
        <v-icon start>
          mdi-star-four-points
        </v-icon>
        Zaklęcia
      </v-tab>
      <v-tab value="elements">
        <v-icon start>
          mdi-fire
        </v-icon>
        Żywioły
      </v-tab>
      <v-tab value="equipment">
        <v-icon start>
          mdi-wizard-hat
        </v-icon>
        Sprzęt
      </v-tab>
      <v-tab value="research">
        <v-icon start>
          mdi-book-open-variant
        </v-icon>
        Badania
        <v-badge
          v-if="researchableSpells.length > 0"
          :content="researchableSpells.length"
          color="warning"
          inline
        />
      </v-tab>
    </v-tabs>

    <!-- Spells Tab -->
    <div v-if="activeTab === 'spells'">
      <!-- Element Filter -->
      <v-chip-group
        v-model="selectedElement"
        mandatory
        class="mb-4"
      >
        <v-chip
          value="all"
          variant="outlined"
        >
          Wszystkie
        </v-chip>
        <v-chip
          v-for="(data, element) in ELEMENTS"
          :key="element"
          :value="element"
          :color="data.color"
          variant="outlined"
        >
          <v-icon
            start
            size="small"
          >
            {{ data.icon }}
          </v-icon>
          {{ data.name }}
        </v-chip>
      </v-chip-group>

      <!-- Spells Grid -->
      <v-row>
        <v-col
          v-for="spell in filteredSpells"
          :key="spell.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            :disabled="wizardStore.isCasting"
            variant="outlined"
          >
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar
                  :color="getElementColor(spell.element)"
                  size="48"
                >
                  <v-icon color="white">
                    {{ spell.icon }}
                  </v-icon>
                </v-avatar>
                <div class="ml-3">
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ spell.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ getElementName(spell.element) }} • Tier {{ spell.tier }}
                  </div>
                </div>
              </div>

              <div class="text-body-2 mb-2">
                {{ spell.description }}
              </div>

              <!-- Stats -->
              <div class="d-flex flex-wrap gap-1 mb-2">
                <v-chip
                  size="x-small"
                  color="blue"
                >
                  {{ spell.manaCost }} Mana
                </v-chip>
                <v-chip
                  size="x-small"
                  :color="wizardStore.getSpellCooldownPercent(spell.id) >= 100 ? 'grey' : 'warning'"
                >
                  {{ (spell.cooldown / 10).toFixed(1) }}s CD
                </v-chip>
                <v-chip
                  size="x-small"
                  color="grey"
                >
                  <v-icon
                    start
                    size="x-small"
                  >
                    {{ getCategoryIcon(spell.category) }}
                  </v-icon>
                  {{ getCategoryName(spell.category) }}
                </v-chip>
              </div>

              <!-- Effects -->
              <div class="mb-2">
                <v-chip
                  v-for="(effect, idx) in spell.effects"
                  :key="idx"
                  size="x-small"
                  color="primary"
                  variant="outlined"
                  class="mr-1 mb-1"
                >
                  {{ effect.description }}
                </v-chip>
              </div>

              <!-- Cooldown progress -->
              <v-progress-linear
                v-if="wizardStore.getSpellCooldownPercent(spell.id) < 100"
                :model-value="wizardStore.getSpellCooldownPercent(spell.id)"
                color="warning"
                height="4"
                class="mb-2"
              />

              <v-btn
                block
                :color="getElementColor(spell.element)"
                :disabled="!wizardStore.canCastSpell(spell.id).canCast || wizardStore.isCasting"
                @click="castSpell(spell.id)"
              >
                <v-icon start>
                  {{ spell.icon }}
                </v-icon>
                Rzuć
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Elements Tab -->
    <div v-if="activeTab === 'elements'">
      <v-row>
        <v-col
          v-for="(data, element) in ELEMENTS"
          :key="element"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            :color="data.color"
            variant="tonal"
          >
            <v-card-text>
              <div class="d-flex align-center mb-3">
                <v-avatar
                  :color="data.color"
                  size="56"
                >
                  <v-icon
                    color="white"
                    size="32"
                  >
                    {{ data.icon }}
                  </v-icon>
                </v-avatar>
                <div class="ml-3">
                  <div class="text-h6">
                    {{ data.name }}
                  </div>
                  <div class="text-body-2">
                    {{ data.description }}
                  </div>
                </div>
              </div>

              <v-progress-linear
                :model-value="Math.min(100, (wizardStore.elementMastery.get(element as MagicElement) || 0))"
                :color="data.color"
                height="12"
                rounded
              >
                <template #default>
                  Mistrzostwo: {{ wizardStore.elementMastery.get(element as MagicElement) || 0 }}
                </template>
              </v-progress-linear>

              <div class="text-caption mt-2">
                Zaklęcia: {{ Object.values(SPELLS).filter(s => s.element === element && wizardStore.researchedSpells.has(s.id)).length }}/{{ Object.values(SPELLS).filter(s => s.element === element).length }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Equipment Tab -->
    <div v-if="activeTab === 'equipment'">
      <v-card>
        <v-card-title>Kostury Magiczne</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="staff in Object.values(STAFFS)"
              :key="staff.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                :variant="wizardStore.ownedStaffs.has(staff.id) ? 'elevated' : 'outlined'"
                :class="{ 'border-primary': wizardStore.equippedStaff === staff.id }"
              >
                <v-card-text>
                  <div class="d-flex align-center mb-2">
                    <v-icon
                      size="36"
                      :color="wizardStore.ownedStaffs.has(staff.id) ? 'purple' : 'grey'"
                    >
                      {{ staff.icon }}
                    </v-icon>
                    <div class="ml-3">
                      <div class="font-weight-medium">
                        {{ staff.name }}
                      </div>
                      <div class="text-caption">
                        Tier {{ staff.tier }} • Lvl {{ staff.requiredLevel }}
                      </div>
                    </div>
                  </div>

                  <div class="text-body-2 mb-2">
                    {{ staff.description }}
                  </div>

                  <div class="text-caption mb-2">
                    Moc: +{{ staff.magicPower }} • Efektywność: {{ staff.manaEfficiency }}% • Szybkość: x{{ staff.castSpeed }}
                    <span v-if="staff.elementBonus">
                      • Bonus: {{ getElementName(staff.elementBonus) }}
                    </span>
                  </div>

                  <v-btn
                    v-if="!wizardStore.ownedStaffs.has(staff.id)"
                    size="small"
                    color="amber"
                    block
                    :disabled="staff.requiredLevel > wizardStore.progress.level"
                    @click="wizardStore.buyStaff(staff.id)"
                  >
                    Kup ({{ staff.cost }}g)
                  </v-btn>
                  <v-btn
                    v-else-if="wizardStore.equippedStaff !== staff.id"
                    size="small"
                    color="primary"
                    block
                    @click="wizardStore.equipStaff(staff.id)"
                  >
                    Załóż
                  </v-btn>
                  <v-chip
                    v-else
                    color="success"
                    block
                  >
                    Założony
                  </v-chip>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Research Tab -->
    <div v-if="activeTab === 'research'">
      <v-card>
        <v-card-title>Badania Magiczne</v-card-title>
        <v-card-text>
          <v-list v-if="researchableSpells.length > 0">
            <v-list-item
              v-for="spell in researchableSpells"
              :key="spell.id"
            >
              <template #prepend>
                <v-avatar :color="getElementColor(spell.element)">
                  <v-icon color="white">
                    {{ spell.icon }}
                  </v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ spell.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ getElementName(spell.element) }} • Tier {{ spell.tier }} • {{ spell.description }}
              </v-list-item-subtitle>
              <template #append>
                <v-btn
                  :disabled="!wizardStore.canResearchSpell(spell.id).canResearch"
                  color="warning"
                  @click="wizardStore.researchSpell(spell.id)"
                >
                  Zbadaj ({{ spell.researchCost }}g)
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
          <div
            v-else
            class="text-center py-8 text-medium-emphasis"
          >
            Wszystkie dostępne zaklęcia zbadane!
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.border-primary {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}
</style>
