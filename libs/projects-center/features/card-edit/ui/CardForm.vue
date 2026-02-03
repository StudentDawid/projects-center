<template>
  <div class="card-form">
    <form @submit.prevent="handleSubmit">
      <!-- Basic Section -->
      <div class="form-section">
            <v-row>
              <v-col cols="12" md="6">
                <div class="form-group">
                  <label for="name">Nazwa</label>
                  <input
                    id="name"
                    v-model="formData.name"
                    type="text"
                    placeholder="Nazwa karty"
                    :class="{ 'has-error': hasValidated && errors.name }"
                    @input="setField('name', ($event.target as HTMLInputElement).value)"
                  />
                  <span v-if="hasValidated && errors.name" class="error">{{ errors.name }}</span>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="form-group">
                  <label for="type">Typ karty *</label>
                  <select
                    id="type"
                    :value="getTypeSelectValue()"
                    :class="{ 'has-error': hasValidated && errors.type }"
                    @change="handleTypeChange(($event.target as HTMLSelectElement).value)"
                  >
                    <option value="EQUIPMENT_WEAPON">Broń</option>
                    <option value="EQUIPMENT_ARMOR">Pancerz</option>
                    <option value="EQUIPMENT_SHIELD">Tarcza</option>
                    <option value="EQUIPMENT_ACCESSORY">Akcesorium</option>
                    <option :value="CardTypeEnum.SPELL">Czar</option>
                    <option :value="CardTypeEnum.SKILL">Umiejętność</option>
                    <option :value="CardTypeEnum.QUEST">Zadanie</option>
                    <option :value="CardTypeEnum.ITEM">Przedmiot</option>
                    <option :value="CardTypeEnum.LOCATION">Lokacja</option>
                  </select>
                  <span v-if="hasValidated && errors.type" class="error">{{ errors.type }}</span>
                </div>
              </v-col>
            </v-row>

            <v-row>
              <v-col v-if="formData.type !== CardTypeEnum.LOCATION" cols="12" md="6">
                <div class="form-group">
                  <label for="description">Opis</label>
                  <textarea
                    id="description"
                    v-model="formData.description"
                    rows="3"
                    placeholder="Opis karty"
                    :class="{ 'has-error': hasValidated && errors.description }"
                    @input="setField('description', ($event.target as HTMLTextAreaElement).value)"
                  ></textarea>
                  <span v-if="hasValidated && errors.description" class="error">{{ errors.description }}</span>
                </div>
              </v-col>

              <v-col v-if="formData.type !== CardTypeEnum.LOCATION" cols="12" md="6">
                <div class="form-group">
                  <label for="flavorText">Flavor Text</label>
                  <textarea
                    id="flavorText"
                    v-model="formData.flavorText"
                    rows="2"
                    placeholder="Fluffowy tekst, np. cytat lub krótka historia..."
                    @input="setField('flavorText', ($event.target as HTMLTextAreaElement).value)"
                  ></textarea>
                </div>
              </v-col>
            </v-row>

            <v-row>
              <!-- Obrazek -->
              <v-col cols="12" md="4">
                <div class="form-group">
                  <label for="image">Obrazek (URL)</label>
                  <input
                    id="image"
                    v-model="formData.image"
                    type="url"
                    placeholder="https://..."
                    @input="setField('image', ($event.target as HTMLInputElement).value)"
                  />
                </div>
              </v-col>

              <!-- Koszt -->
              <v-col v-if="formData.type !== CardTypeEnum.SKILL && formData.type !== CardTypeEnum.LOCATION" cols="12" md="4">
                <div class="form-group">
                  <label for="buyValue">Cena (ZNT)</label>
                  <div class="input-with-suffix">
                  <input
                    id="buyValue"
                    :value="(formData as any).buyValue ?? 100"
                    type="number"
                    min="1"
                    @input="setField('buyValue', ($event.target as HTMLInputElement).valueAsNumber)"
                  />
                    <span class="input-suffix">ZNT</span>
                  </div>
                </div>
              </v-col>

              <!-- Rzadkość -->
              <v-col v-if="formData.type !== CardTypeEnum.SKILL && formData.type !== CardTypeEnum.LOCATION" cols="12" md="4">
                <div class="form-group">
                  <label for="rarity">Rzadkość</label>
                  <select
                    id="rarity"
                    :value="(formData as any).rarity"
                    @change="setField('rarity', ($event.target as HTMLSelectElement).value)"
                  >
                    <option :value="RarityEnum.COMMON">Powszechna</option>
                    <option :value="RarityEnum.RARE">Rzadka</option>
                    <option :value="RarityEnum.EPIC">Epicka</option>
                    <option :value="RarityEnum.LEGENDARY">Legendarna</option>
                    <option :value="RarityEnum.DIVINE">Boska</option>
                  </select>
                </div>
              </v-col>
            </v-row>
        </div>

        <!-- Equipment Section -->
        <div v-if="formData.type === CardTypeEnum.EQUIPMENT" class="form-section">
            <!-- Weapon specific fields -->
            <template v-if="equipmentData.slot === 'weapon'">
              <!-- Precyzja -->
              <div class="form-group form-group-header">
                <label class="group-label">Precyzja</label>
                <v-row>
                  <v-col cols="12" md="4">
                    <div class="form-group">
                      <label for="accuracy-stat1">Statystyka 1</label>
                      <select
                        id="accuracy-stat1"
                        :value="equipmentData.stats.accuracy?.stat1"
                        @change="updateAccuracyStat('stat1', ($event.target as HTMLSelectElement).value)"
                      >
                        <option :value="AccuracyStatEnum.ZR">ZR (Zręczność)</option>
                        <option :value="AccuracyStatEnum.PO">PO (Postawa)</option>
                        <option :value="AccuracyStatEnum.WJ">WJ (Wola)</option>
                        <option :value="AccuracyStatEnum.SW">SW (Siła Woli)</option>
                      </select>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="form-group">
                      <label for="accuracy-stat2">Statystyka 2</label>
                      <select
                        id="accuracy-stat2"
                        :value="equipmentData.stats.accuracy?.stat2"
                        @change="updateAccuracyStat('stat2', ($event.target as HTMLSelectElement).value)"
                      >
                        <option :value="AccuracyStatEnum.ZR">ZR (Zręczność)</option>
                        <option :value="AccuracyStatEnum.PO">PO (Postawa)</option>
                        <option :value="AccuracyStatEnum.WJ">WJ (Wola)</option>
                        <option :value="AccuracyStatEnum.SW">SW (Siła Woli)</option>
                      </select>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="form-group">
                      <label for="accuracy-modifier">Modyfikator</label>
                      <input
                        id="accuracy-modifier"
                        :value="equipmentData.stats.accuracy?.modifier ?? 0"
                        type="number"
                        min="0"
                        @input="updateAccuracyModifier(($event.target as HTMLInputElement).valueAsNumber)"
                      />
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- Obrażenia -->
              <div class="form-group form-group-header">
                <label class="group-label">Obrażenia</label>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="form-group">
                      <label for="damage-modifier">Modyfikator [WW + X]</label>
                      <input
                        id="damage-modifier"
                        :value="equipmentData.stats.damage?.modifier ?? 0"
                        type="number"
                        min="0"
                        @input="updateDamageModifier(($event.target as HTMLInputElement).valueAsNumber)"
                      />
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="form-group">
                      <label for="damage-type">Typ obrażeń</label>
                      <select
                        id="damage-type"
                        :value="equipmentData.stats.damage?.type"
                        @change="updateDamageType(($event.target as HTMLSelectElement).value)"
                      >
                        <option :value="DamageTypeEnum.PHYSICAL">Fizyczne</option>
                        <option :value="DamageTypeEnum.FIRE">Ogniste</option>
                        <option :value="DamageTypeEnum.ICE">Lodowe</option>
                        <option :value="DamageTypeEnum.ELECTRIC">Elektryczne</option>
                        <option :value="DamageTypeEnum.POISON">Trujące</option>
                        <option :value="DamageTypeEnum.EARTH">Ziemne</option>
                        <option :value="DamageTypeEnum.LIGHT">Świetliste</option>
                        <option :value="DamageTypeEnum.DARK">Mroczne</option>
                        <option :value="DamageTypeEnum.AIR">Powietrzne</option>
                      </select>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- Typ chwytu -->
              <v-row>
                <v-col cols="12" md="6">
                  <div class="form-group">
                    <label for="weaponHands">Typ chwytu</label>
                    <select
                      id="weaponHands"
                      :value="equipmentData.weaponHands"
                      @change="updateEquipmentData('weaponHands', ($event.target as HTMLSelectElement).value)"
                    >
                      <option :value="WeaponHandsEnum.ONE_HANDED">Jednoręczna</option>
                      <option :value="WeaponHandsEnum.TWO_HANDED">Dwuręczna</option>
                    </select>
                  </div>
                </v-col>

                <!-- Typ broni -->
                <v-col cols="12" md="6">
                  <div class="form-group">
                    <label for="weaponType">Typ broni</label>
                    <select
                      id="weaponType"
                      :value="equipmentData.weaponType"
                      @change="updateEquipmentData('weaponType', ($event.target as HTMLSelectElement).value)"
                    >
                      <option :value="WeaponTypeEnum.MELEE">Biała</option>
                      <option :value="WeaponTypeEnum.RANGED">Dystansowa</option>
                    </select>
                  </div>
                </v-col>
              </v-row>
            </template>

            <!-- Armor specific fields -->
            <template v-else-if="equipmentData.slot === 'armor'">
              <v-row>
                <!-- Pancerz -->
                <v-col cols="12" md="6">
                  <div class="form-group">
                    <label>Pancerz</label>
                    <div class="form-row" style="align-items: center; gap: 8px;">
                      <select
                        :value="getArmorDefenseSelectValue('defense')"
                        @change="setArmorDefenseTypeFromSelect('defense', ($event.target as HTMLSelectElement).value)"
                      >
                        <option value="-">-</option>
                        <option value="die">Kość ZR</option>
                      </select>
                      <button
                        v-if="getArmorDefenseSelectValue('defense') === 'die'"
                        type="button"
                        @click="toggleArmorDefenseModifierSign('defense')"
                        style="font-weight: bold; background: none; border: 1px solid #ccc; padding: 4px 6px; cursor: pointer; min-width: 32px;"
                      >
                        {{ getArmorDefenseModifierSign('defense') }}
                      </button>
                      <input
                        :value="getArmorDefenseValue('defense')"
                        type="number"
                        min="0"
                        style="width: 80px;"
                        @input="updateArmorDefenseValue('defense', ($event.target as HTMLInputElement).valueAsNumber)"
                      />
                    </div>
                  </div>
                </v-col>

                <!-- M. Pancerz -->
                <v-col cols="12" md="6">
                  <div class="form-group">
                    <label>M. Pancerz</label>
                    <div class="form-row" style="align-items: center; gap: 8px;">
                      <select
                        :value="getArmorDefenseSelectValue('magicDefense')"
                        @change="setArmorDefenseTypeFromSelect('magicDefense', ($event.target as HTMLSelectElement).value)"
                      >
                        <option value="-">-</option>
                        <option value="die">Kość WJ</option>
                      </select>
                      <button
                        v-if="getArmorDefenseSelectValue('magicDefense') === 'die'"
                        type="button"
                        @click="toggleArmorDefenseModifierSign('magicDefense')"
                        style="font-weight: bold; background: none; border: 1px solid #ccc; padding: 4px 6px; cursor: pointer; min-width: 32px;"
                      >
                        {{ getArmorDefenseModifierSign('magicDefense') }}
                      </button>
                      <input
                        :value="getArmorDefenseValue('magicDefense')"
                        type="number"
                        min="0"
                        style="width: 80px;"
                        @input="updateArmorDefenseValue('magicDefense', ($event.target as HTMLInputElement).valueAsNumber)"
                      />
                    </div>
                  </div>
                </v-col>
              </v-row>

              <!-- Inicjatywa -->
              <v-row>
                <v-col cols="12" md="6">
                  <div class="form-group">
                    <label for="initiative">Inicjatywa</label>
                    <input
                      id="initiative"
                      :value="equipmentData.stats?.initiative ?? 0"
                      type="number"
                      @input="updateInitiativeValue(($event.target as HTMLInputElement).valueAsNumber)"
                    />
                  </div>
                </v-col>
              </v-row>
            </template>

            <!-- Shield specific fields -->
            <template v-else-if="equipmentData.slot === 'shield'">
              <v-row>
                <!-- Pancerz (tylko wartość +) -->
                <v-col cols="12" md="6">
                  <div class="form-group">
                    <label>Pancerz +</label>
                    <div class="form-row" style="align-items: center; gap: 8px;">
                      <input
                        :value="getShieldDefenseValue('defense')"
                        type="number"
                        min="0"
                        style="width: 80px;"
                        @input="updateShieldDefenseValue('defense', ($event.target as HTMLInputElement).valueAsNumber)"
                      />
                    </div>
                  </div>
                </v-col>

                <!-- M. Pancerz (tylko wartość +) -->
                <v-col cols="12" md="6">
                  <div class="form-group">
                    <label>M. Pancerz +</label>
                    <div class="form-row" style="align-items: center; gap: 8px;">
                      <input
                        :value="getShieldDefenseValue('magicDefense')"
                        type="number"
                        min="0"
                        style="width: 80px;"
                        @input="updateShieldDefenseValue('magicDefense', ($event.target as HTMLInputElement).valueAsNumber)"
                      />
                    </div>
                  </div>
                </v-col>
              </v-row>
            </template>

            <!-- Accessory has no additional fields beyond basic ones -->
            <template v-else-if="equipmentData.slot === 'accessory'">
              <!-- No additional fields for accessories -->
            </template>

            <!-- Other equipment types -->
            <template v-else>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="form-group">
                    <label for="magic">Magia</label>
                    <input
                      id="magic"
                      v-model.number="equipmentData.stats.magic"
                      type="number"
                      min="0"
                      @input="updateEquipmentStats('magic', ($event.target as HTMLInputElement).valueAsNumber)"
                    />
                  </div>
                </v-col>
              </v-row>
            </template>
        </div>

        <!-- Spell Section -->
        <div v-if="formData.type === CardTypeEnum.SPELL" class="form-section">
            <v-row>
              <v-col cols="12" md="6">
                <div class="form-group">
                  <label for="mpCost">PM (Koszt Punktów Many)</label>
                  <input
                    id="mpCost"
                    v-model="spellData.mpCost"
                    type="text"
                    @input="updateSpellData('mpCost', ($event.target as HTMLInputElement).value)"
                  />
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="form-group">
                  <label for="target">Cel</label>
                  <select
                    id="target"
                    v-model="spellData.target"
                    @change="updateSpellData('target', ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="self">Ty</option>
                    <option value="single">Jedna istota</option>
                    <option value="three">Do trzech istot</option>
                    <option value="weapon">Jedna broń</option>
                    <option value="special">Specjalny</option>
                  </select>
                </div>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <div class="form-group">
                  <label for="duration">Czas trwania</label>
                  <select
                    id="duration"
                    v-model="spellData.duration"
                    @change="updateSpellData('duration', ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="instant">Błyskawiczny</option>
                    <option value="scene">Jedna scena</option>
                  </select>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="form-group">
                  <label>
                    <input
                      type="checkbox"
                      :checked="spellData.isOffensive"
                      @change="updateSpellData('isOffensive', ($event.target as HTMLInputElement).checked)"
                    />
                    Ofensywne (błyskawica na końcu nazwy)
                  </label>
                </div>
              </v-col>
            </v-row>
        </div>

        <!-- Item Section -->
        <div v-if="formData.type === CardTypeEnum.ITEM" class="form-section">
            <v-row>
              <v-col cols="12" md="6">
                <div class="form-group">
                  <label for="item-uses">Użycia</label>
                  <input
                    id="item-uses"
                    :value="itemData.uses ?? 0"
                    type="number"
                    min="0"
                    max="5"
                    @input="updateItemData('uses', ($event.target as HTMLInputElement).valueAsNumber)"
                  />
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="form-group">
                  <label for="item-target">Cel</label>
                  <select
                    id="item-target"
                    :value="itemData.target"
                    @change="updateItemData('target', ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="single">Jedna istota</option>
                    <option value="three">Do trzech istot</option>
                    <option value="self">Ty</option>
                    <option value="special">Specjalne</option>
                  </select>
                </div>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <div class="form-group">
                  <label for="item-usageType">Wykorzystanie</label>
                  <select
                    id="item-usageType"
                    :value="itemData.usageType"
                    @change="updateItemData('usageType', ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="single_use">Jednorazowe</option>
                    <option value="permanent">Trwałe</option>
                    <option value="see_below">Patrz poniżej</option>
                  </select>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="form-group">
                  <label for="item-fpCost">Koszt w PE</label>
                  <input
                    id="item-fpCost"
                    :value="itemData.fpCost ?? 0"
                    type="number"
                    min="0"
                    @input="updateItemData('fpCost', ($event.target as HTMLInputElement).valueAsNumber)"
                  />
                </div>
              </v-col>
            </v-row>
        </div>

        <!-- Skill Section -->
        <div v-if="formData.type === CardTypeEnum.SKILL" class="form-section">
            <v-row>
              <v-col cols="12" md="6">
                <div class="form-group">
                  <label for="skill-maxLevel">Max poziom</label>
                  <input
                    id="skill-maxLevel"
                    :value="skillData.maxLevel ?? 1"
                    type="number"
                    min="1"
                    max="10"
                    @input="updateSkillData('maxLevel', ($event.target as HTMLInputElement).valueAsNumber)"
                  />
                </div>
              </v-col>
            </v-row>
        </div>

        <!-- Quest Section -->
        <div v-if="formData.type === CardTypeEnum.QUEST" class="form-section">
            <v-row>
              <v-col cols="12" md="6">
                <div class="form-group">
                  <label for="quest-location">Miejsce</label>
                  <input
                    id="quest-location"
                    :value="questData.location ?? ''"
                    type="text"
                    @input="updateQuestData('location', ($event.target as HTMLInputElement).value)"
                  />
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="form-group">
                  <label for="quest-rank">Ranga</label>
                  <select
                    id="quest-rank"
                    :value="questData.rank ?? '-'"
                    @change="updateQuestData('rank', ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="-">-</option>
                    <option value="D">D</option>
                    <option value="C">C</option>
                    <option value="B">B</option>
                    <option value="A">A</option>
                    <option value="S">S</option>
                  </select>
                </div>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <div class="form-group">
                  <label for="quest-client">Klient</label>
                  <input
                    id="quest-client"
                    :value="questData.client ?? ''"
                    type="text"
                    @input="updateQuestData('client', ($event.target as HTMLInputElement).value)"
                  />
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="form-group">
                  <label for="quest-timeLimit">Czas na ukończenie (dni)</label>
                  <input
                    id="quest-timeLimit"
                    :value="questData.timeLimit ?? 0"
                    type="number"
                    min="0"
                    @input="updateQuestData('timeLimit', ($event.target as HTMLInputElement).valueAsNumber)"
                  />
                </div>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <div class="form-group">
                  <label>Nagrody</label>
                  <div class="tags-input">
                    <input
                      v-model="newReward"
                      type="text"
                      placeholder="Dodaj nagrodę"
                      @keydown.enter.prevent="handleAddReward"
                    />
                    <button type="button" @click="handleAddReward">Dodaj</button>
                  </div>
                  <div v-if="questData.rewards && questData.rewards.length > 0" class="tags-list">
                    <span v-for="reward in questData.rewards" :key="reward" class="tag">
                      {{ reward }}
                      <button type="button" @click="handleRemoveReward(reward)" class="tag-remove">×</button>
                    </span>
                  </div>
                </div>
              </v-col>
            </v-row>
        </div>

      <!-- Tagi -->
      <div class="form-section">
        <div class="form-group">
          <label>Tagi</label>
          <div class="tags-input">
            <input
              v-model="newTag"
              type="text"
              placeholder="Dodaj tag"
              @keydown.enter.prevent="handleAddTag"
            />
            <button type="button" @click="handleAddTag">Dodaj</button>
          </div>
          <div v-if="formData.tags && formData.tags.length > 0" class="tags-list">
            <span v-for="tag in formData.tags" :key="tag" class="tag">
              {{ tag }}
              <button type="button" @click="removeTag(tag)" class="tag-remove">×</button>
            </span>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="$emit('cancel')">Anuluj</button>
        <button type="submit" class="btn-primary" :disabled="hasValidated && !isValid">Zapisz</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Card, CardType, EquipmentStats, WeaponType, WeaponHands } from '@projects-center/entities/card';
import {
  CardType as CardTypeEnum,
  AccuracyStat as AccuracyStatEnum,
  DamageType as DamageTypeEnum,
  WeaponType as WeaponTypeEnum,
  WeaponHands as WeaponHandsEnum,
  Rarity as RarityEnum,
} from '@projects-center/entities/card';
import { useCardForm } from '../hooks/useCardForm';

const props = defineProps<{
  card?: Card;
}>();

const emit = defineEmits<{
  save: [card: Card];
  cancel: [];
}>();

const { formData, errors, isValid, setField, addTag, removeTag, save, validate } = useCardForm(props.card);

const hasValidated = ref(false);

// Reset hasValidated when all errors are fixed
watch(
  () => Object.keys(errors.value).length,
  (errorCount) => {
    if (errorCount === 0 && hasValidated.value) {
      hasValidated.value = false;
    }
  }
);

// Expose formData for parent components to access
defineExpose({
  formData,
});

const newTag = ref('');

// Equipment type selector (weapon, armor, shield, accessory)
const equipmentType = ref<'weapon' | 'armor' | 'shield' | 'accessory'>('weapon');

// Equipment specific data
const equipmentData = ref<{
  slot: 'weapon' | 'armor' | 'accessory' | 'shield' | 'helmet' | 'boots' | 'gloves';
  stats: EquipmentStats;
  weaponType?: WeaponType;
  weaponHands?: WeaponHands;
}>({
  slot: 'weapon',
  stats: {
    accuracy: {
      stat1: AccuracyStatEnum.ZR,
      stat2: AccuracyStatEnum.PO,
      modifier: 0,
    },
    damage: {
      modifier: 0,
      type: DamageTypeEnum.PHYSICAL,
    },
    magic: 0,
  },
  weaponType: WeaponTypeEnum.MELEE,
  weaponHands: WeaponHandsEnum.ONE_HANDED,
});

// Spell specific data
const spellData = ref<{
  mpCost: string;
  fpCost: number;
  range: 'self' | 'single' | 'area' | 'all';
  target: 'self' | 'single' | 'three' | 'weapon' | 'special';
  duration: 'instant' | 'scene';
  isOffensive: boolean;
}>({
  mpCost: '',
  fpCost: 0,
  range: 'single',
  target: 'single',
  duration: 'instant',
  isOffensive: false,
});

// Item specific data
const itemData = ref<{
  uses: number;
  target: 'self' | 'single' | 'three' | 'special';
  usageType: 'single_use' | 'permanent' | 'see_below';
  fpCost: number;
}>({
  uses: 0,
  target: 'single',
  usageType: 'single_use',
  fpCost: 0,
});

// Skill specific data
const skillData = ref<{
  maxLevel: number;
}>({
  maxLevel: 1,
});

// Quest specific data
const questData = ref<{
  location: string;
  rewards: string[];
  rank: '-' | 'D' | 'C' | 'B' | 'A' | 'S';
  client: string;
  timeLimit: number;
}>({
  location: '',
  rewards: [],
  rank: '-',
  client: '',
  timeLimit: 0,
});

const newReward = ref('');

// Initialize equipmentData from formData when editing
onMounted(() => {
  if (props.card && props.card.type === CardTypeEnum.EQUIPMENT && 'slot' in props.card) {
    const slot = props.card.slot;
    equipmentType.value = (slot === 'weapon' || slot === 'armor' || slot === 'shield' || slot === 'accessory')
      ? slot
      : 'weapon';
    const isWeapon = slot === 'weapon';
    const isArmor = slot === 'armor';
    const isShield = slot === 'shield';

    equipmentData.value = {
      slot,
      stats: (props.card.stats || (isWeapon ? {
        accuracy: {
          stat1: AccuracyStatEnum.ZR,
          stat2: AccuracyStatEnum.PO,
          modifier: 0,
        },
        damage: {
          modifier: 0,
          type: DamageTypeEnum.PHYSICAL,
        },
        magic: 0,
      } : isArmor ? {
        defense: { fixedValue: 0 },
        magicDefense: { fixedValue: 0 },
        initiative: null,
      } : isShield ? {
        defense: { fixedValue: 0 },
        magicDefense: { fixedValue: 0 },
      } : {
        magic: 0,
      })) as EquipmentStats,
      weaponType: isWeapon ? (props.card.weaponType ?? WeaponTypeEnum.MELEE) : undefined,
      weaponHands: isWeapon ? (props.card.weaponHands ?? WeaponHandsEnum.ONE_HANDED) : undefined,
    };

    // Synchronize equipmentData with formData
    setField('slot', equipmentData.value.slot);
    setField('stats', equipmentData.value.stats);
    if (isWeapon) {
      setField('weaponType', equipmentData.value.weaponType);
      setField('weaponHands', equipmentData.value.weaponHands);
    }
  } else if (props.card && props.card.type === CardTypeEnum.SPELL) {
    // Initialize spellData from card
    spellData.value = {
      mpCost: props.card.mpCost?.toString() ?? '',
      fpCost: props.card.fpCost ?? 0,
      range: props.card.range ?? 'single',
      target: (props.card as any).target ?? 'single',
      duration: (props.card as any).duration ?? 'instant',
      isOffensive: (props.card as any).isOffensive ?? false,
    };
    // Synchronize spellData with formData
    setField('mpCost', spellData.value.mpCost);
    setField('fpCost', spellData.value.fpCost);
    setField('range', spellData.value.range);
    setField('target', spellData.value.target);
    setField('duration', spellData.value.duration);
    setField('isOffensive', spellData.value.isOffensive);
  }

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    // Initialize from formData if available
    const slot = (formData.value as any).slot || equipmentType.value || 'weapon';
    equipmentType.value = (slot === 'weapon' || slot === 'armor' || slot === 'shield' || slot === 'accessory')
      ? slot
      : 'weapon';
    const isWeapon = slot === 'weapon';
    const isArmor = slot === 'armor';
    const isShield = slot === 'shield';

    equipmentData.value = {
      slot,
      stats: ((formData.value as any).stats || (isWeapon ? {
        accuracy: {
          stat1: AccuracyStatEnum.ZR,
          stat2: AccuracyStatEnum.PO,
          modifier: 0,
        },
        damage: {
          modifier: 0,
          type: DamageTypeEnum.PHYSICAL,
        },
        magic: 0,
      } : isArmor ? {
        defense: { fixedValue: 0 },
        magicDefense: { fixedValue: 0 },
        initiative: null,
      } : isShield ? {
        defense: { fixedValue: 0 },
        magicDefense: { fixedValue: 0 },
      } : {
        magic: 0,
      })) as EquipmentStats,
      weaponType: isWeapon ? ((formData.value as any).weaponType ?? WeaponTypeEnum.MELEE) : undefined,
      weaponHands: isWeapon ? ((formData.value as any).weaponHands ?? WeaponHandsEnum.ONE_HANDED) : undefined,
    };

    // Synchronize equipmentData with formData
    setField('slot', equipmentData.value.slot);
    setField('stats', equipmentData.value.stats);
    if (isWeapon) {
      setField('weaponType', equipmentData.value.weaponType);
      setField('weaponHands', equipmentData.value.weaponHands);
    }
  }

  if (formData.value.type === CardTypeEnum.SPELL) {
    // Initialize from formData if available
    const spellFormData = formData.value as any;
    spellData.value = {
      mpCost: spellFormData.mpCost?.toString() ?? '',
      fpCost: spellFormData.fpCost ?? 0,
      range: spellFormData.range ?? 'single',
      target: spellFormData.target ?? 'single',
      duration: spellFormData.duration ?? 'instant',
      isOffensive: spellFormData.isOffensive ?? false,
    };
    // Synchronize spellData with formData
    setField('mpCost', spellData.value.mpCost);
    setField('fpCost', spellData.value.fpCost);
    setField('range', spellData.value.range);
    setField('target', spellData.value.target);
    setField('duration', spellData.value.duration);
    setField('isOffensive', spellData.value.isOffensive);
  }

  if (formData.value.type === CardTypeEnum.ITEM) {
    // Initialize from formData if available
    const itemFormData = formData.value as any;
    itemData.value = {
      uses: itemFormData.uses ?? 0,
      target: itemFormData.target ?? 'single',
      usageType: itemFormData.usageType ?? 'single_use',
      fpCost: itemFormData.fpCost ?? 0,
    };
    // Synchronize itemData with formData
    setField('uses', itemData.value.uses);
    setField('target', itemData.value.target);
    setField('usageType', itemData.value.usageType);
    setField('fpCost', itemData.value.fpCost);
  }

  if (formData.value.type === CardTypeEnum.SKILL) {
    // Initialize from formData if available
    const skillFormData = formData.value as any;
    skillData.value = {
      maxLevel: skillFormData.maxLevel ?? 1,
    };
    // Synchronize skillData with formData
    setField('maxLevel', skillData.value.maxLevel);
  }

  if (formData.value.type === CardTypeEnum.QUEST) {
    // Initialize from formData if available
    const questFormData = formData.value as any;
    questData.value = {
      location: questFormData.location ?? '',
      rewards: questFormData.rewards ?? [],
      rank: questFormData.rank ?? '-',
      client: questFormData.client ?? '',
      timeLimit: questFormData.timeLimit ?? 0,
    };
    // Synchronize questData with formData
    setField('location', questData.value.location);
    setField('rewards', questData.value.rewards);
    setField('rank', questData.value.rank);
    setField('client', questData.value.client);
  }

  // Ensure buyValue is set if not already (only for non-skill and non-quest cards)
  if (formData.value.type !== CardTypeEnum.SKILL && formData.value.type !== CardTypeEnum.QUEST && !(formData.value as any).buyValue) {
    setField('buyValue', 100);
  }
});

watch(
  () => props.card,
  (card) => {
    if (card && card.type === CardTypeEnum.EQUIPMENT && 'slot' in card) {
      const slot = card.slot;
      equipmentType.value = (slot === 'weapon' || slot === 'armor' || slot === 'shield' || slot === 'accessory')
        ? slot
        : 'weapon';
      const isWeapon = slot === 'weapon';
      const isArmor = slot === 'armor';
      const isShield = slot === 'shield';

      equipmentData.value = {
        slot,
        stats: (card.stats || (isWeapon ? {
          accuracy: {
            stat1: AccuracyStatEnum.ZR,
            stat2: AccuracyStatEnum.PO,
            modifier: 0,
          },
          damage: {
            modifier: 0,
            type: DamageTypeEnum.PHYSICAL,
          },
          magic: 0,
        } : isArmor ? {
          defense: { fixedValue: 0 },
          magicDefense: { fixedValue: 0 },
          initiative: null,
        } : isShield ? {
          defense: { fixedValue: 0 },
          magicDefense: { fixedValue: 0 },
        } : {
          magic: 0,
        })) as EquipmentStats,
        weaponType: isWeapon ? (card.weaponType ?? WeaponTypeEnum.MELEE) : undefined,
        weaponHands: isWeapon ? (card.weaponHands ?? WeaponHandsEnum.ONE_HANDED) : undefined,
      };

      // Synchronize equipmentData with formData
      setField('slot', equipmentData.value.slot);
      setField('stats', equipmentData.value.stats);
      if (isWeapon) {
        setField('weaponType', equipmentData.value.weaponType);
        setField('weaponHands', equipmentData.value.weaponHands);
      }
    }

    if (card && card.type === CardTypeEnum.SPELL) {
      // Initialize spellData from card
      spellData.value = {
        mpCost: card.mpCost?.toString() ?? '',
        fpCost: card.fpCost ?? 0,
        range: card.range ?? 'single',
        target: (card as any).target ?? 'single',
        duration: (card as any).duration ?? 'instant',
        isOffensive: (card as any).isOffensive ?? false,
      };
      // Synchronize spellData with formData
      setField('mpCost', spellData.value.mpCost);
      setField('fpCost', spellData.value.fpCost);
      setField('range', spellData.value.range);
      setField('target', spellData.value.target);
      setField('duration', spellData.value.duration);
      setField('isOffensive', spellData.value.isOffensive);
    }

    if (card && card.type === CardTypeEnum.SKILL) {
      // Initialize skillData from card
      skillData.value = {
        maxLevel: (card as any).maxLevel ?? 1,
      };
      // Synchronize skillData with formData
      setField('maxLevel', skillData.value.maxLevel);
    }

    if (card && card.type === CardTypeEnum.QUEST) {
      // Initialize questData from card
      questData.value = {
        location: (card as any).location ?? '',
        rewards: (card as any).rewards ?? [],
        rank: (card as any).rank ?? '-',
        client: (card as any).client ?? '',
        timeLimit: (card as any).timeLimit ?? 0,
      };
      // Synchronize questData with formData
      setField('location', questData.value.location);
      setField('rewards', questData.value.rewards);
      setField('rank', questData.value.rank);
      setField('client', questData.value.client);
      setField('timeLimit', questData.value.timeLimit);
    }
  },
  { immediate: true }
);

// Watch for type changes to reset specific fields
watch(
  () => formData.value.type,
  () => {
    if (formData.value.type === CardTypeEnum.EQUIPMENT) {
      Object.assign(formData.value, {
        ...formData.value,
        slot: equipmentData.value.slot,
        stats: equipmentData.value.stats,
        weaponType: equipmentData.value.weaponType,
        weaponHands: equipmentData.value.weaponHands,
      });
    } else if (formData.value.type === CardTypeEnum.SPELL) {
      Object.assign(formData.value, {
        ...formData.value,
        mpCost: spellData.value.mpCost,
        fpCost: spellData.value.fpCost,
        range: spellData.value.range,
        target: spellData.value.target,
        duration: spellData.value.duration,
        isOffensive: spellData.value.isOffensive,
        effects: [],
      });
    } else if (formData.value.type === CardTypeEnum.ITEM) {
      Object.assign(formData.value, {
        ...formData.value,
        uses: itemData.value.uses,
        target: itemData.value.target,
        usageType: itemData.value.usageType,
        fpCost: itemData.value.fpCost,
      });
    } else if (formData.value.type === CardTypeEnum.SKILL) {
      Object.assign(formData.value, {
        ...formData.value,
        maxLevel: skillData.value.maxLevel,
      });
    } else if (formData.value.type === CardTypeEnum.QUEST) {
      Object.assign(formData.value, {
        ...formData.value,
        location: questData.value.location,
        rewards: questData.value.rewards,
        rank: questData.value.rank,
        client: questData.value.client,
      });
    }
  }
);


function handleAddTag(): void {
  if (newTag.value.trim()) {
    addTag(newTag.value);
    newTag.value = '';
  }
}

function updateEquipmentData(field: string, value: any): void {
  (equipmentData.value as any)[field] = value;
  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    setField(field, value);
  }
}

function updateEquipmentStats(field: string, value: number): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {
      accuracy: {
        stat1: AccuracyStatEnum.ZR,
        stat2: AccuracyStatEnum.PO,
        modifier: 0,
      },
      damage: {
        modifier: 0,
        type: DamageTypeEnum.PHYSICAL,
      },
      magic: 0,
    };
  }
  (equipmentData.value.stats as any)[field] = value;
  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    setField('stats', equipmentData.value.stats);
  }
}

function updateAccuracyStat(statField: 'stat1' | 'stat2', value: string): void {
  if (!equipmentData.value.stats.accuracy) {
    equipmentData.value.stats.accuracy = {
      stat1: AccuracyStatEnum.ZR,
      stat2: AccuracyStatEnum.PO,
      modifier: 0,
    };
  }
  equipmentData.value.stats.accuracy[statField] = value as AccuracyStatEnum;
  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    setField('stats', equipmentData.value.stats);
  }
}

function updateAccuracyModifier(value: number): void {
  if (!equipmentData.value.stats.accuracy) {
    equipmentData.value.stats.accuracy = {
      stat1: AccuracyStatEnum.ZR,
      stat2: AccuracyStatEnum.PO,
      modifier: 0,
    };
  }
  equipmentData.value.stats.accuracy.modifier = value ?? 0;
  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    setField('stats', equipmentData.value.stats);
  }
}

function updateDamageModifier(value: number): void {
  if (!equipmentData.value.stats.damage) {
    equipmentData.value.stats.damage = {
      modifier: 0,
      type: DamageTypeEnum.PHYSICAL,
    };
  }
  equipmentData.value.stats.damage.modifier = value ?? 0;
  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    setField('stats', equipmentData.value.stats);
  }
}

function updateDamageType(value: string): void {
  if (!equipmentData.value.stats.damage) {
    equipmentData.value.stats.damage = {
      modifier: 0,
      type: DamageTypeEnum.PHYSICAL,
    };
  }
  equipmentData.value.stats.damage.type = value as DamageTypeEnum;
  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    setField('stats', equipmentData.value.stats);
  }
}

function updateSpellData(field: string, value: any): void {
  (spellData.value as any)[field] = value;
  if (formData.value.type === CardTypeEnum.SPELL) {
    setField(field, value);
  }
}

function updateItemData(field: string, value: any): void {
  (itemData.value as any)[field] = value;
  if (formData.value.type === CardTypeEnum.ITEM) {
    setField(field, value);
  }
}

function updateSkillData(field: string, value: any): void {
  (skillData.value as any)[field] = value;
  if (formData.value.type === CardTypeEnum.SKILL) {
    setField(field, value);
  }
}

function updateQuestData(field: string, value: any): void {
  (questData.value as any)[field] = value;
  if (formData.value.type === CardTypeEnum.QUEST) {
    setField(field, value);
  }
}

function handleAddReward(): void {
  if (newReward.value.trim() && !questData.value.rewards.includes(newReward.value.trim())) {
    questData.value.rewards.push(newReward.value.trim());
    newReward.value = '';
    if (formData.value.type === CardTypeEnum.QUEST) {
      setField('rewards', questData.value.rewards);
    }
  }
}

function handleRemoveReward(reward: string): void {
  questData.value.rewards = questData.value.rewards.filter(r => r !== reward);
  if (formData.value.type === CardTypeEnum.QUEST) {
    setField('rewards', questData.value.rewards);
  }
}

// Armor helper functions
function getArmorDefenseSelectValue(type: 'defense' | 'magicDefense'): string {
  const defense = type === 'defense'
    ? equipmentData.value.stats?.defense
    : equipmentData.value.stats?.magicDefense;
  return defense?.die !== undefined ? 'die' : '-';
}

function getArmorDefenseModifier(type: 'defense' | 'magicDefense'): number {
  const defense = type === 'defense'
    ? equipmentData.value.stats?.defense
    : equipmentData.value.stats?.magicDefense;
  return defense?.modifier ?? 0;
}

function getArmorDefenseValue(type: 'defense' | 'magicDefense'): number {
  const defense = type === 'defense'
    ? equipmentData.value.stats?.defense
    : equipmentData.value.stats?.magicDefense;

  if (!defense) return 0;

  // If it's a die, return absolute value of modifier
  if (defense.die !== undefined) {
    return Math.abs(defense.modifier ?? 0);
  }

  // If it's fixed value, return the fixed value
  return defense.fixedValue ?? 0;
}

function updateArmorDefenseValue(type: 'defense' | 'magicDefense', value: number): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {} as EquipmentStats;
  }

  const stat = type === 'defense' ? 'defense' : 'magicDefense';
  const die = type === 'defense' ? AccuracyStatEnum.ZR : AccuracyStatEnum.WJ;
  const currentDefense = (equipmentData.value.stats as any)[stat];
  const selectValue = getArmorDefenseSelectValue(type);

  // If die is selected, update modifier
  if (selectValue === 'die') {
    const currentModifier = currentDefense?.modifier ?? 0;
    const sign = currentModifier >= 0 ? 1 : -1;

    const newStats = {
      ...equipmentData.value.stats,
      [stat]: {
        die,
        modifier: value === 0 ? 0 : value * sign,
      },
    };

    equipmentData.value.stats = newStats as EquipmentStats;
  } else {
    // If "-" is selected, update fixedValue
    const newStats = {
      ...equipmentData.value.stats,
      [stat]: {
        fixedValue: value ?? 0,
      },
    };

    equipmentData.value.stats = newStats as EquipmentStats;
  }

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(equipmentData.value.stats));
    setField('stats', statsToSet);
  }
}

function setArmorDefenseTypeFromSelect(type: 'defense' | 'magicDefense', value: string): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {} as EquipmentStats;
  }

  const stat = type === 'defense' ? 'defense' : 'magicDefense';
  const die = type === 'defense' ? AccuracyStatEnum.ZR : AccuracyStatEnum.WJ;
  const currentDefense = (equipmentData.value.stats as any)[stat];
  const currentValue = getArmorDefenseValue(type);

  // Create new stats object to ensure reactivity
  const newStats = {
    ...equipmentData.value.stats,
    [stat]: value === 'die'
      ? {
          die,
          modifier: 0, // Always start with 0 when selecting die
        }
      : {
          fixedValue: currentValue ?? 0, // Preserve current value when switching to fixed
        },
  };

  equipmentData.value.stats = newStats as EquipmentStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    // Use JSON parse/stringify to create a completely new object for reactivity
    setField('stats', JSON.parse(JSON.stringify(newStats)));
  }
}

function updateArmorDefenseModifierFromInput(type: 'defense' | 'magicDefense', value: number): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {} as EquipmentStats;
  }

  const stat = type === 'defense' ? 'defense' : 'magicDefense';
  const die = type === 'defense' ? AccuracyStatEnum.ZR : AccuracyStatEnum.WJ;
  const currentModifier = (equipmentData.value.stats as any)[stat]?.modifier ?? 0;
  const sign = currentModifier >= 0 ? 1 : -1;

  // Create new stats object to ensure reactivity
  // If value is 0, set modifier to 0, otherwise preserve sign
  const newStats = {
    ...equipmentData.value.stats,
    [stat]: {
      die,
      modifier: value === 0 ? 0 : value * sign,
    },
  };

  equipmentData.value.stats = newStats as EquipmentStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(newStats));
    setField('stats', statsToSet);
  }
}

function addArmorDefenseModifier(type: 'defense' | 'magicDefense'): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {} as EquipmentStats;
  }

  const stat = type === 'defense' ? 'defense' : 'magicDefense';
  const die = type === 'defense' ? AccuracyStatEnum.ZR : AccuracyStatEnum.WJ;

  // Set initial modifier to 1 (positive)
  const newStats = {
    ...equipmentData.value.stats,
    [stat]: {
      die,
      modifier: 1,
    },
  };

  equipmentData.value.stats = newStats as EquipmentStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(newStats));
    setField('stats', statsToSet);
  }
}

function getArmorDefenseModifierSign(type: 'defense' | 'magicDefense'): string {
  const modifier = getArmorDefenseModifier(type);
  return modifier >= 0 ? '+' : '-';
}

function toggleArmorDefenseModifierSign(type: 'defense' | 'magicDefense'): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {} as EquipmentStats;
  }

  const stat = type === 'defense' ? 'defense' : 'magicDefense';
  const die = type === 'defense' ? AccuracyStatEnum.ZR : AccuracyStatEnum.WJ;
  const currentModifier = (equipmentData.value.stats as any)[stat]?.modifier ?? 0;

  // Toggle sign - if 0, set to -0 (which is still 0, but we track the sign)
  // For 0, we'll toggle between positive and negative by using a flag or just toggle to -1
  // Actually, let's just toggle: if >= 0, make it negative, if < 0, make it positive
  const newModifier = currentModifier >= 0 ? -1 : 1;

  const newStats = {
    ...equipmentData.value.stats,
    [stat]: {
      die,
      modifier: currentModifier === 0 ? newModifier : -currentModifier,
    },
  };

  equipmentData.value.stats = newStats as EquipmentStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(newStats));
    setField('stats', statsToSet);
  }
}

function updateArmorDefenseFixed(type: 'defense' | 'magicDefense', value: number): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {} as EquipmentStats;
  }

  const stat = type === 'defense' ? 'defense' : 'magicDefense';

  // Create new stats object to ensure reactivity
  const newStats = {
    ...equipmentData.value.stats,
    [stat]: {
      fixedValue: value ?? 0,
    },
  };

  equipmentData.value.stats = newStats as EquipmentStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(newStats));
    setField('stats', statsToSet);
  }
}

function updateArmorDefenseModifier(type: 'defense' | 'magicDefense', value: number): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {} as EquipmentStats;
  }

  const stat = type === 'defense' ? 'defense' : 'magicDefense';
  const die = type === 'defense' ? AccuracyStatEnum.ZR : AccuracyStatEnum.WJ;

  // Create new stats object to ensure reactivity
  const newStats = {
    ...equipmentData.value.stats,
    [stat]: {
      die,
      modifier: value ?? 0,
    },
  };

  equipmentData.value.stats = newStats as EquipmentStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(newStats));
    setField('stats', statsToSet);
  }
}

function getInitiativeValue(): string {
  const initiative = equipmentData.value.stats?.initiative;
  if (initiative === null || initiative === undefined) {
    return 'null';
  }
  return initiative > 0 ? 'positive' : 'negative';
}

function getInitiativeNumber(): number {
  const initiative = equipmentData.value.stats?.initiative;
  if (initiative === null || initiative === undefined) {
    return 0;
  }
  return Math.abs(initiative);
}

function getInitiativeSign(): string {
  const initiative = equipmentData.value.stats?.initiative;
  if (initiative === null || initiative === undefined) {
    return '+';
  }
  return initiative >= 0 ? '+' : '-';
}

function toggleInitiativeSign(): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {} as EquipmentStats;
  }

  const current = equipmentData.value.stats.initiative;

  // If null or 0, set to -1 (negative)
  // Otherwise toggle sign
  let newInitiative: number | null;
  if (current === null || current === undefined || current === 0) {
    newInitiative = -1;
  } else {
    newInitiative = -current;
  }

  const newStats = {
    ...equipmentData.value.stats,
    initiative: newInitiative,
  };

  equipmentData.value.stats = newStats as EquipmentStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(newStats));
    setField('stats', statsToSet);
  }
}

function updateInitiativeValue(value: number): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {} as EquipmentStats;
  }

  // Set initiative directly to the value (can be negative, 0, or positive)
  const newInitiative = isNaN(value) ? 0 : value;

  const newStats = {
    ...equipmentData.value.stats,
    initiative: newInitiative,
  };

  equipmentData.value.stats = newStats as EquipmentStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(newStats));
    setField('stats', statsToSet);
  }
}

// Get the select value for type field
function getTypeSelectValue(): string {
  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const slot = (formData.value as any).slot || equipmentData.value.slot || equipmentType.value;
    // Map slot to equipment type (only weapon, armor, shield, accessory are shown in select)
    if (slot === 'weapon' || slot === 'armor' || slot === 'shield' || slot === 'accessory') {
      return `EQUIPMENT_${slot.toUpperCase()}`;
    }
    // Default to weapon if slot is something else
    return 'EQUIPMENT_WEAPON';
  }
  return formData.value.type || '';
}

// Handle type change from select
function handleTypeChange(value: string): void {
  if (value.startsWith('EQUIPMENT_')) {
    const slot = value.replace('EQUIPMENT_', '').toLowerCase() as 'weapon' | 'armor' | 'shield' | 'accessory';
    equipmentType.value = slot;
    equipmentData.value.slot = slot;
    setField('type', CardTypeEnum.EQUIPMENT);
    setField('slot', slot);

    // Initialize stats based on slot type
    if (slot === 'weapon') {
      if (!equipmentData.value.stats?.accuracy) {
        equipmentData.value.stats = {
          accuracy: {
            stat1: AccuracyStatEnum.ZR,
            stat2: AccuracyStatEnum.PO,
            modifier: 0,
          },
          damage: {
            modifier: 0,
            type: DamageTypeEnum.PHYSICAL,
          },
          magic: 0,
        } as EquipmentStats;
      }
      if (!equipmentData.value.weaponType) {
        equipmentData.value.weaponType = WeaponTypeEnum.MELEE;
      }
      if (!equipmentData.value.weaponHands) {
        equipmentData.value.weaponHands = WeaponHandsEnum.ONE_HANDED;
      }
    } else if (slot === 'armor') {
      if (!equipmentData.value.stats?.defense) {
        equipmentData.value.stats = {
          defense: { fixedValue: 0 },
          magicDefense: { fixedValue: 0 },
          initiative: null,
        } as EquipmentStats;
      }
    } else if (slot === 'shield') {
      if (!equipmentData.value.stats?.defense) {
        equipmentData.value.stats = {
          defense: { fixedValue: 0 },
          magicDefense: { fixedValue: 0 },
        } as EquipmentStats;
      }
    } else {
      if (!equipmentData.value.stats?.magic) {
        equipmentData.value.stats = {
          magic: 0,
        } as EquipmentStats;
      }
    }
    setField('stats', equipmentData.value.stats);
  } else {
    setField('type', value as CardType);
  }
}

// Get equipment tab label based on slot
function getEquipmentTabLabel(): string {
  const slot = equipmentData.value.slot || equipmentType.value;
  const labels: Record<string, string> = {
    weapon: 'Broń',
    armor: 'Pancerz',
    shield: 'Tarcza',
    accessory: 'Akcesorium',
  };
  return labels[slot] || 'Ekwipunek';
}

// Shield defense value getters and setters
function getShieldDefenseValue(type: 'defense' | 'magicDefense'): number {
  const stat = type === 'defense' ? 'defense' : 'magicDefense';
  const value = (equipmentData.value.stats as any)?.[stat];
  if (value && typeof value === 'object' && 'fixedValue' in value) {
    return value.fixedValue || 0;
  }
  return 0;
}

function updateShieldDefenseValue(type: 'defense' | 'magicDefense', value: number): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {} as EquipmentStats;
  }

  const stat = type === 'defense' ? 'defense' : 'magicDefense';

  // Create new stats object to ensure reactivity
  const newStats = {
    ...equipmentData.value.stats,
    [stat]: {
      fixedValue: value ?? 0,
    },
  };

  equipmentData.value.stats = newStats as EquipmentStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(newStats));
    setField('stats', statsToSet);
  }
}

function handleSubmit(): void {
  // Mark that validation has been attempted
  hasValidated.value = true;

  // Synchronize all equipment data before validation
  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    setField('slot', equipmentData.value.slot);
    setField('stats', equipmentData.value.stats);
    // buyValue and rarity are now in formData directly, no need to sync from equipmentData
    if (equipmentData.value.slot === 'weapon') {
      setField('weaponType', equipmentData.value.weaponType);
      setField('weaponHands', equipmentData.value.weaponHands);
    }
  } else if (formData.value.type === CardTypeEnum.SPELL) {
    // Synchronize all spell data before validation
    setField('mpCost', spellData.value.mpCost);
    setField('fpCost', spellData.value.fpCost);
    setField('range', spellData.value.range);
    setField('target', spellData.value.target);
    setField('duration', spellData.value.duration);
    setField('isOffensive', spellData.value.isOffensive);
  } else if (formData.value.type === CardTypeEnum.ITEM) {
    // Synchronize all item data before validation
    setField('uses', itemData.value.uses);
    setField('target', itemData.value.target);
    setField('usageType', itemData.value.usageType);
    setField('fpCost', itemData.value.fpCost);
  } else if (formData.value.type === CardTypeEnum.SKILL) {
    // Synchronize all skill data before validation
    setField('maxLevel', skillData.value.maxLevel);
  } else if (formData.value.type === CardTypeEnum.QUEST) {
    // Synchronize all quest data before validation
    setField('location', questData.value.location);
    setField('rewards', questData.value.rewards);
    setField('rank', questData.value.rank);
    setField('client', questData.value.client);
  }

  // Run validation
  const isValidForm = validate();

  // Only save if validation passes
  if (isValidForm) {
    try {
      const savedCard = save();
      emit('save', savedCard);
    } catch (error) {
      console.error('Błąd zapisu:', error);
    }
  }
}
</script>

<style scoped lang="scss">
.card-form {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #a58c6f;
  border-radius: 0;
  padding: 2.5rem;
  max-width: 800px;
  margin: 0 auto;
  box-shadow:
    inset 0 0 0 1px rgba(182, 140, 79, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 30px;
    height: 30px;
    border: 2px solid #b68c4f;
  }

  &::before {
    top: -2px;
    left: -2px;
    border-right: none;
    border-bottom: none;
  }

  &::after {
    bottom: -2px;
    right: -2px;
    border-left: none;
    border-top: none;
  }
}

.form-section {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  position: relative;

  &:last-of-type {
    border-bottom: none;
  }

  h3 {
    margin: 0 0 0.75rem 0;
    color: #8b5a3c;
    font-family: 'Cinzel', 'Georgia', serif;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding-left: 0.75rem;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(to bottom, #b68c4f, #8b5a3c);
    }
  }
}


.form-group {
  margin-bottom: 0.75rem;

  label {
    display: block;
    margin-bottom: 0.25rem;
    color: #8b5a3c;
    font-weight: 600;
    font-size: 0.8rem;
    font-family: 'Cinzel', 'Georgia', serif;
    letter-spacing: 0.3px;
  }

  &.form-group-header {
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #d4c4b0;

    .group-label {
      font-size: 1rem;
      font-weight: 700;
      color: #6b4a2c;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #d4c4b0;
    }
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.4rem 0.5rem;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #a58c6f;
    border-radius: 0;
    color: #2c2a29;
    font-size: 0.85rem;
    font-family: 'Crimson Pro', 'Georgia', serif;
    transition: all 0.2s ease;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);

    &:focus {
      outline: none;
      border-color: #b68c4f;
      box-shadow:
        inset 0 1px 3px rgba(0, 0, 0, 0.1),
        0 0 0 3px rgba(182, 140, 79, 0.2);
      background: #fff;
    }

    &::placeholder {
      color: #8b7d6b;
      font-style: italic;
    }

    &.has-error {
      border-color: #dc2626;
      background: rgba(254, 242, 242, 0.95);
      box-shadow:
        inset 0 1px 3px rgba(220, 38, 38, 0.1),
        0 0 0 2px rgba(220, 38, 38, 0.2);

      &:focus {
        border-color: #dc2626;
        box-shadow:
          inset 0 1px 3px rgba(220, 38, 38, 0.1),
          0 0 0 3px rgba(220, 38, 38, 0.3);
        background: #fef2f2;
      }
    }
  }

  .input-with-suffix {
    position: relative;
    display: flex;
    align-items: center;

    input {
      padding-right: 3.5rem;
    }

    .input-suffix {
      position: absolute;
      right: 0.75rem;
      color: #8b7d6b;
      font-weight: 600;
      pointer-events: none;
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .error {
    display: block;
    margin-top: 0.25rem;
    color: #c44;
    font-size: 0.75rem;
    font-family: 'Crimson Pro', 'Georgia', serif;
    font-style: italic;
  }
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.form-row-half {
  max-width: 50%;
  grid-template-columns: 1fr 1fr;
}

.tags-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;

  input {
    flex: 1;
  }

  button {
    padding: 0.75rem 1rem;
    background: #b68c4f;
    border: 1px solid #8b5a3c;
    border-radius: 0;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Cinzel', 'Georgia', serif;
    font-weight: 600;
    letter-spacing: 0.5px;

    &:hover {
      background: #8b5a3c;
      border-color: #6b4423;
    }
  }
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: rgba(182, 140, 79, 0.1);
  border: 1px solid #a58c6f;
  border-radius: 0;
  color: #8b5a3c;
  font-size: 0.85rem;
  font-family: 'Crimson Pro', 'Georgia', serif;
  font-style: italic;

  .tag-remove {
    background: transparent;
    border: none;
    color: #c44;
    cursor: pointer;
    font-size: 1.2rem;
    line-height: 1;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: #a33;
    }
  }
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: 0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid;
  font-family: 'Cinzel', 'Georgia', serif;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  font-size: 0.8rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: #b68c4f;
  color: #fff;
  border-color: #8b5a3c;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    background: #8b5a3c;
    border-color: #6b4423;
  }
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.8);
  color: #8b5a3c;
  border-color: #a58c6f;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #fff;
    border-color: #b68c4f;
    color: #6b4423;
  }
}
</style>

