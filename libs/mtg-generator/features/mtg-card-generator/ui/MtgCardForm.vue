<template>
  <v-form v-model="valid">
    <v-row>
      <v-col cols="8">
        <v-text-field
          v-model="card.name"
          label="Card Name"
          required
          density="compact"
        ></v-text-field>
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="card.cost"
          label="Cost (e.g. 50gp)"
          density="compact"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="card.type"
          label="Type (e.g. Item)"
          density="compact"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="card.subType"
          label="Sub Type (e.g. Sword)"
          density="compact"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <label class="text-caption">Color Theme</label>
        <div class="d-flex gap-2 mb-4 overflow-x-auto">
          <div
            v-for="color in colors"
            :key="color.value"
            @click="card.colorTheme = color.value"
            class="color-swatch elevation-2"
            :class="{ active: card.colorTheme === color.value }"
            :style="{ backgroundColor: color.value }"
          ></div>
        </div>
      </v-col>
    </v-row>

    <!-- Stats Editor -->
    <v-card variant="outlined" class="mb-4 pa-2">
      <div class="d-flex justify-space-between align-center mb-2">
        <span class="text-subtitle-2">Stats</span>
        <v-btn
          size="x-small"
          color="primary"
          icon="mdi-plus"
          @click="addStat"
        ></v-btn>
      </div>
      <div
        v-for="(stat, index) in card.stats"
        :key="index"
        class="d-flex gap-2 align-center mb-2"
      >
        <v-text-field
          v-model="stat.label"
          label="Label"
          density="compact"
          hide-details
        ></v-text-field>
        <v-text-field
          v-model="stat.value"
          label="Value"
          density="compact"
          hide-details
        ></v-text-field>
        <v-btn
          icon="mdi-delete"
          size="x-small"
          color="error"
          variant="text"
          @click="removeStat(index)"
        ></v-btn>
      </div>
    </v-card>

    <v-textarea
      v-model="card.description"
      label="Description / Rules"
      rows="3"
    ></v-textarea>
    <v-textarea
      v-model="card.flavorText"
      label="Flavor Text"
      rows="2"
    ></v-textarea>

    <v-text-field v-model="card.imageUrl" label="Image URL"></v-text-field>

    <v-combobox
      v-model="card.tags"
      label="Tags"
      multiple
      chips
      closable-chips
    ></v-combobox>
  </v-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { RpgCard } from '../types';

const props = defineProps<{
  card: Partial<RpgCard>;
}>();

const valid = ref(false);

const colors = [
  { name: 'Red', value: '#d32f2f' },
  { name: 'Blue', value: '#1976D2' },
  { name: 'Green', value: '#388E3C' },
  { name: 'Yellow', value: '#FBC02D' },
  { name: 'Purple', value: '#7B1FA2' },
  { name: 'Grey', value: '#616161' },
  { name: 'Brown', value: '#795548' },
  { name: 'Black', value: '#212121' },
];

const addStat = () => {
  if (!props.card.stats) props.card.stats = [];
  props.card.stats.push({ label: '', value: '' });
};

const removeStat = (index: number) => {
  if (props.card.stats) {
    props.card.stats.splice(index, 1);
  }
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.1s;
}
.color-swatch:hover {
  transform: scale(1.1);
}
.color-swatch.active {
  border-color: white;
  outline: 2px solid #555;
  transform: scale(1.1);
}
</style>
