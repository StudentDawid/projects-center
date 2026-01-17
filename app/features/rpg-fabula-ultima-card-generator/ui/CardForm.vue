<template>
  <div class="card-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-section">
        <h3>Podstawowe informacje</h3>
        <div class="form-group">
          <label for="name">Nazwa *</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            placeholder="Nazwa karty"
            @input="setField('name', ($event.target as HTMLInputElement).value)"
          />
          <span v-if="errors.name" class="error">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="type">Typ karty *</label>
          <select
            id="type"
            v-model="formData.type"
            required
            @change="setField('type', ($event.target as HTMLSelectElement).value)"
          >
            <option :value="CardTypeEnum.EQUIPMENT">Ekwipunek</option>
            <option :value="CardTypeEnum.SPELL">Czar</option>
            <option :value="CardTypeEnum.SKILL">Umiejętność</option>
            <option :value="CardTypeEnum.QUEST">Zadanie</option>
            <option :value="CardTypeEnum.ITEM">Przedmiot</option>
            <option :value="CardTypeEnum.NPC">NPC</option>
            <option :value="CardTypeEnum.LOCATION">Lokacja</option>
          </select>
          <span v-if="errors.type" class="error">{{ errors.type }}</span>
        </div>

        <div class="form-group">
          <label for="description">Opis *</label>
          <textarea
            id="description"
            v-model="formData.description"
            required
            rows="4"
            placeholder="Opis karty"
            @input="setField('description', ($event.target as HTMLTextAreaElement).value)"
          ></textarea>
          <span v-if="errors.description" class="error">{{ errors.description }}</span>
        </div>

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

        <!-- Koszt -->
        <div class="form-group">
          <label for="buyValue">Cena (ZNT) *</label>
          <div class="input-with-suffix">
            <input
              id="buyValue"
              :value="formData.buyValue ?? 1"
              type="number"
              min="1"
              required
              @input="setField('buyValue', ($event.target as HTMLInputElement).valueAsNumber)"
            />
            <span class="input-suffix">ZNT</span>
          </div>
        </div>

        <!-- Rzadkość -->
        <div class="form-group">
          <label for="rarity">Rzadkość</label>
          <select
            id="rarity"
            :value="formData.rarity"
            @change="setField('rarity', ($event.target as HTMLSelectElement).value)"
          >
            <option :value="RarityEnum.COMMON">Powszechna</option>
            <option :value="RarityEnum.RARE">Rzadka</option>
            <option :value="RarityEnum.EPIC">Epicka</option>
            <option :value="RarityEnum.LEGENDARY">Legendarna</option>
            <option :value="RarityEnum.DIVINE">Boska</option>
          </select>
        </div>
      </div>

      <!-- Equipment specific fields -->
      <div v-if="formData.type === CardTypeEnum.EQUIPMENT" class="form-section">
        <h3>Ekwipunek</h3>
        <div class="form-group">
          <label for="slot">Slot</label>
          <select
            id="slot"
            v-model="equipmentData.slot"
            @change="updateEquipmentData('slot', ($event.target as HTMLSelectElement).value)"
          >
            <option value="weapon">Broń</option>
            <option value="armor">Pancerz</option>
            <option value="accessory">Akcesorium</option>
            <option value="shield">Tarcza</option>
            <option value="helmet">Hełm</option>
            <option value="boots">Buty</option>
            <option value="gloves">Rękawice</option>
          </select>
        </div>

        <!-- Weapon specific fields -->
        <template v-if="equipmentData.slot === 'weapon'">
          <!-- Precyzja -->
          <div class="form-group">
            <label>Precyzja</label>
            <div class="form-row">
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
            </div>
          </div>

          <!-- Obrażenia -->
          <div class="form-group">
            <label>Obrażenia</label>
            <div class="form-row">
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
            </div>
          </div>

          <!-- Typ chwytu -->
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

          <!-- Typ broni -->
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

        </template>

        <!-- Armor specific fields -->
        <template v-else-if="equipmentData.slot === 'armor'">
          <!-- Pancerz -->
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

          <!-- M. Pancerz -->
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

          <!-- Inicjatywa -->
          <div class="form-group">
            <label>Inicjatywa</label>
            <div class="form-row" style="align-items: center; gap: 8px;">
              <button
                type="button"
                @click="toggleInitiativeSign()"
                style="font-weight: bold; background: none; border: 1px solid #ccc; padding: 4px 6px; cursor: pointer; min-width: 32px;"
              >
                {{ getInitiativeSign() }}
              </button>
              <input
                :value="getInitiativeNumber()"
                type="number"
                min="0"
                style="width: 80px;"
                @input="updateInitiativeValue(($event.target as HTMLInputElement).valueAsNumber)"
              />
            </div>
          </div>

        </template>

        <!-- Other equipment types -->
        <template v-else>
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
        </template>
      </div>

      <!-- Spell specific fields -->
      <div v-if="formData.type === CardTypeEnum.SPELL" class="form-section">
        <h3>Czar</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="mpCost">Koszt MP *</label>
            <input
              id="mpCost"
              v-model.number="spellData.mpCost"
              type="number"
              min="0"
              required
              @input="updateSpellData('mpCost', ($event.target as HTMLInputElement).valueAsNumber)"
            />
          </div>
          <div class="form-group">
            <label for="fpCost">Koszt FP</label>
            <input
              id="fpCost"
              v-model.number="spellData.fpCost"
              type="number"
              min="0"
              @input="updateSpellData('fpCost', ($event.target as HTMLInputElement).valueAsNumber)"
            />
          </div>
        </div>
        <div class="form-group">
          <label for="range">Zakres</label>
          <select
            id="range"
            v-model="spellData.range"
            @change="updateSpellData('range', ($event.target as HTMLSelectElement).value)"
          >
            <option value="self">Siębie</option>
            <option value="single">Pojedynczy</option>
            <option value="area">Obszar</option>
            <option value="all">Wszyscy</option>
          </select>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="$emit('cancel')">Anuluj</button>
        <button type="submit" class="btn-primary" :disabled="!isValid">Zapisz</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Card, CardType } from '~/shared/fabula-ultima-card-generator/types/card.types';
import {
  CardType as CardTypeEnum,
  AccuracyStat as AccuracyStatEnum,
  DamageType as DamageTypeEnum,
  WeaponType as WeaponTypeEnum,
  WeaponHands as WeaponHandsEnum,
  Rarity as RarityEnum,
} from '~/shared/fabula-ultima-card-generator/types/card.types';
import { useCardForm } from '../hooks/useCardForm';

const props = defineProps<{
  card?: Card;
}>();

const emit = defineEmits<{
  save: [card: Card];
  cancel: [];
}>();

const { formData, errors, isValid, setField, addTag, removeTag, save } = useCardForm(props.card);

// Expose formData for parent components to access
defineExpose({
  formData,
});

const newTag = ref('');

// Equipment specific data
const equipmentData = ref({
  slot: 'weapon' as const,
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
const spellData = ref({
  mpCost: 0,
  fpCost: 0,
  range: 'single' as const,
});

// Initialize equipmentData from formData when editing
onMounted(() => {
  if (props.card && props.card.type === CardTypeEnum.EQUIPMENT && 'slot' in props.card) {
    const slot = props.card.slot;
    const isWeapon = slot === 'weapon';
    const isArmor = slot === 'armor';

    equipmentData.value = {
      slot,
      stats: props.card.stats || (isWeapon ? {
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
      } : {
        magic: 0,
      }),
      weaponType: isWeapon ? (props.card.weaponType ?? WeaponTypeEnum.MELEE) : undefined,
      weaponHands: isWeapon ? (props.card.weaponHands ?? WeaponHandsEnum.ONE_HANDED) : undefined,
    };
  } else if (formData.value.type === CardTypeEnum.EQUIPMENT && 'slot' in formData.value) {
    // Initialize from formData if available
    const slot = (formData.value as any).slot || 'weapon';
    const isWeapon = slot === 'weapon';
    const isArmor = slot === 'armor';

    equipmentData.value = {
      slot,
      stats: (formData.value as any).stats || (isWeapon ? {
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
      } : {
        magic: 0,
      }),
      weaponType: isWeapon ? ((formData.value as any).weaponType ?? WeaponTypeEnum.MELEE) : undefined,
      weaponHands: isWeapon ? ((formData.value as any).weaponHands ?? WeaponHandsEnum.ONE_HANDED) : undefined,
    };
  }
});

watch(
  () => props.card,
  (card) => {
    if (card && card.type === CardTypeEnum.EQUIPMENT && 'slot' in card) {
      const slot = card.slot;
      const isWeapon = slot === 'weapon';
      const isArmor = slot === 'armor';

      equipmentData.value = {
        slot,
        stats: card.stats || (isWeapon ? {
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
        } : {
          magic: 0,
        }),
        weaponType: isWeapon ? (card.weaponType ?? WeaponTypeEnum.MELEE) : undefined,
        weaponHands: isWeapon ? (card.weaponHands ?? WeaponHandsEnum.ONE_HANDED) : undefined,
      };
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
        effects: [],
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
    equipmentData.value.stats = {};
  }

  const stat = type === 'defense' ? 'defense' : 'magicDefense';
  const die = type === 'defense' ? AccuracyStatEnum.ZR : AccuracyStatEnum.WJ;
  const currentDefense = equipmentData.value.stats[stat];
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

    equipmentData.value.stats = newStats;
  } else {
    // If "-" is selected, update fixedValue
    const newStats = {
      ...equipmentData.value.stats,
      [stat]: {
        fixedValue: value ?? 0,
      },
    };

    equipmentData.value.stats = newStats;
  }

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(equipmentData.value.stats));
    setField('stats', statsToSet);
  }
}

function setArmorDefenseTypeFromSelect(type: 'defense' | 'magicDefense', value: string): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {};
  }

  const stat = type === 'defense' ? 'defense' : 'magicDefense';
  const die = type === 'defense' ? AccuracyStatEnum.ZR : AccuracyStatEnum.WJ;
  const currentDefense = equipmentData.value.stats[stat];
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

  equipmentData.value.stats = newStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    // Use JSON parse/stringify to create a completely new object for reactivity
    setField('stats', JSON.parse(JSON.stringify(newStats)));
  }
}

function updateArmorDefenseModifierFromInput(type: 'defense' | 'magicDefense', value: number): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {};
  }

  const stat = type === 'defense' ? 'defense' : 'magicDefense';
  const die = type === 'defense' ? AccuracyStatEnum.ZR : AccuracyStatEnum.WJ;
  const currentModifier = equipmentData.value.stats[stat]?.modifier ?? 0;
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

  equipmentData.value.stats = newStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(newStats));
    setField('stats', statsToSet);
  }
}

function addArmorDefenseModifier(type: 'defense' | 'magicDefense'): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {};
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

  equipmentData.value.stats = newStats;

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
    equipmentData.value.stats = {};
  }

  const stat = type === 'defense' ? 'defense' : 'magicDefense';
  const die = type === 'defense' ? AccuracyStatEnum.ZR : AccuracyStatEnum.WJ;
  const currentModifier = equipmentData.value.stats[stat]?.modifier ?? 0;

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

  equipmentData.value.stats = newStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(newStats));
    setField('stats', statsToSet);
  }
}

function updateArmorDefenseFixed(type: 'defense' | 'magicDefense', value: number): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {};
  }

  const stat = type === 'defense' ? 'defense' : 'magicDefense';

  // Create new stats object to ensure reactivity
  const newStats = {
    ...equipmentData.value.stats,
    [stat]: {
      fixedValue: value ?? 0,
    },
  };

  equipmentData.value.stats = newStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(newStats));
    setField('stats', statsToSet);
  }
}

function updateArmorDefenseModifier(type: 'defense' | 'magicDefense', value: number): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {};
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

  equipmentData.value.stats = newStats;

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
    equipmentData.value.stats = {};
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

  equipmentData.value.stats = newStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(newStats));
    setField('stats', statsToSet);
  }
}

function updateInitiativeValue(value: number): void {
  if (!equipmentData.value.stats) {
    equipmentData.value.stats = {};
  }

  const current = equipmentData.value.stats.initiative;
  const sign = current === null || current === undefined || current >= 0 ? 1 : -1;

  // If value is 0, set initiative to null (no initiative)
  // Otherwise, set with preserved sign
  const newInitiative = value === 0 ? null : value * sign;

  const newStats = {
    ...equipmentData.value.stats,
    initiative: newInitiative,
  };

  equipmentData.value.stats = newStats;

  if (formData.value.type === CardTypeEnum.EQUIPMENT) {
    const statsToSet = JSON.parse(JSON.stringify(newStats));
    setField('stats', statsToSet);
  }
}

function handleSubmit(): void {
  try {
    // Synchronize all equipment data before saving
    if (formData.value.type === CardTypeEnum.EQUIPMENT) {
      setField('slot', equipmentData.value.slot);
      setField('stats', equipmentData.value.stats);
      // buyValue and rarity are now in formData directly, no need to sync from equipmentData
      if (equipmentData.value.slot === 'weapon') {
        setField('weaponType', equipmentData.value.weaponType);
        setField('weaponHands', equipmentData.value.weaponHands);
      }
    }

    const savedCard = save();
    emit('save', savedCard);
  } catch (error) {
    console.error('Błąd zapisu:', error);
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
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 2px double #a58c6f;
  position: relative;

  &:last-of-type {
    border-bottom: none;
  }

  h3 {
    margin: 0 0 1.5rem 0;
    color: #8b5a3c;
    font-family: 'Cinzel', 'Georgia', serif;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 1px;
    padding-left: 1rem;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(to bottom, #b68c4f, #8b5a3c);
    }
  }
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #8b5a3c;
    font-weight: 600;
    font-size: 0.9rem;
    font-family: 'Cinzel', 'Georgia', serif;
    letter-spacing: 0.5px;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #a58c6f;
    border-radius: 0;
    color: #2c2a29;
    font-size: 1rem;
    font-family: 'Crimson Pro', 'Georgia', serif;
    transition: all 0.2s ease;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);

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
    margin-top: 0.5rem;
    color: #c44;
    font-size: 0.85rem;
    font-family: 'Crimson Pro', 'Georgia', serif;
    font-style: italic;
  }
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
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
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px double #a58c6f;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid;
  font-family: 'Cinzel', 'Georgia', serif;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 0.9rem;

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

