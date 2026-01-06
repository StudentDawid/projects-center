<template>
  <div class="map-generator-page">
    <!-- Header -->
    <header class="generator-header">
      <div class="header-content">
        <NuxtLink to="/" class="back-link">
          <v-icon icon="mdi-arrow-left" size="20" />
          <span>Projects Center</span>
        </NuxtLink>
        <div class="title-section">
          <v-icon icon="mdi-map-legend" size="32" class="title-icon" />
          <h1 class="page-title">Generator Map RPG</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="generator-main">
      <!-- Sidebar - Settings -->
      <aside class="generator-sidebar">
        <div class="sidebar-section">
          <h2 class="section-title">
            <v-icon icon="mdi-cog" size="20" class="mr-2" />
            Ustawienia mapy
          </h2>

          <div class="setting-group">
            <label class="setting-label">Rozmiar mapy</label>
            <div class="size-options">
              <button
                v-for="size in sizeOptions"
                :key="size.value"
                class="size-btn"
                :class="{ active: mapSettings.size === size.value }"
                @click="mapSettings.size = size.value"
              >
                {{ size.label }}
              </button>
            </div>
          </div>

          <div class="setting-group">
            <label class="setting-label">Seed</label>
            <div class="seed-input-wrapper">
              <input
                v-model="mapSettings.seed"
                type="text"
                class="seed-input"
                placeholder="Losowy..."
              />
              <button class="seed-random-btn" @click="randomizeSeed">
                <v-icon icon="mdi-dice-6" size="18" />
              </button>
            </div>
          </div>

          <div class="setting-group">
            <label class="setting-label">Poziom wody: {{ mapSettings.waterLevel }}%</label>
            <input
              v-model.number="mapSettings.waterLevel"
              type="range"
              min="0"
              max="100"
              class="range-slider"
            />
          </div>

          <div class="setting-group">
            <label class="setting-label">Górzystość: {{ mapSettings.mountainLevel }}%</label>
            <input
              v-model.number="mapSettings.mountainLevel"
              type="range"
              min="0"
              max="100"
              class="range-slider"
            />
          </div>

          <div class="setting-group">
            <label class="setting-label">Zalesionie: {{ mapSettings.forestLevel }}%</label>
            <input
              v-model.number="mapSettings.forestLevel"
              type="range"
              min="0"
              max="100"
              class="range-slider"
            />
          </div>
        </div>

        <div class="sidebar-section">
          <h2 class="section-title">
            <v-icon icon="mdi-city" size="20" class="mr-2" />
            Osady
          </h2>

          <div class="setting-group">
            <label class="setting-label">Liczba miast: {{ mapSettings.cityCount }}</label>
            <input
              v-model.number="mapSettings.cityCount"
              type="range"
              min="0"
              max="20"
              class="range-slider"
            />
          </div>

          <div class="setting-group">
            <label class="setting-label">Liczba wiosek: {{ mapSettings.villageCount }}</label>
            <input
              v-model.number="mapSettings.villageCount"
              type="range"
              min="0"
              max="50"
              class="range-slider"
            />
          </div>
        </div>

        <div class="sidebar-actions">
          <button class="generate-btn" @click="generateMap">
            <v-icon icon="mdi-creation" size="20" class="mr-2" />
            Generuj mapę
          </button>
          <button class="export-btn" @click="exportMap" :disabled="!mapGenerated">
            <v-icon icon="mdi-download" size="20" class="mr-2" />
            Eksportuj PNG
          </button>
        </div>
      </aside>

      <!-- Map Canvas -->
      <div class="map-canvas-wrapper">
        <div v-if="!mapGenerated" class="map-placeholder">
          <v-icon icon="mdi-map-marker-question" size="64" color="grey" />
          <p>Kliknij "Generuj mapę" aby stworzyć nowy świat</p>
        </div>
        <canvas
          v-show="mapGenerated"
          ref="mapCanvas"
          class="map-canvas"
          :width="canvasSize"
          :height="canvasSize"
        ></canvas>

        <!-- Map Legend -->
        <div v-if="mapGenerated" class="map-legend">
          <h4 class="legend-title">Legenda</h4>
          <div class="legend-items">
            <div class="legend-item">
              <span class="legend-color" style="background: #1a5f7a"></span>
              <span>Głęboka woda</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #3498db"></span>
              <span>Płytka woda</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #f4d03f"></span>
              <span>Plaża</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #58d68d"></span>
              <span>Równina</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #27ae60"></span>
              <span>Las</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #7f8c8d"></span>
              <span>Góry</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #ecf0f1"></span>
              <span>Szczyt</span>
            </div>
            <div class="legend-item">
              <span class="legend-marker">🏰</span>
              <span>Miasto</span>
            </div>
            <div class="legend-item">
              <span class="legend-marker">🏠</span>
              <span>Wioska</span>
            </div>
          </div>
        </div>
  </div>
    </main>

    <!-- Status bar -->
    <footer class="generator-footer">
      <span v-if="mapGenerated">
        Mapa wygenerowana • Seed: {{ mapSettings.seed }} • Rozmiar: {{ mapSettings.size }}×{{ mapSettings.size }}
      </span>
      <span v-else>Gotowy do generowania</span>
    </footer>
</div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

// ============================================
// Page meta
// ============================================
useHead({
  title: 'Generator Map RPG - Projects Center',
});

// ============================================
// Types
// ============================================
interface MapSettings {
  size: number;
  seed: string;
  waterLevel: number;
  mountainLevel: number;
  forestLevel: number;
  cityCount: number;
  villageCount: number;
}

interface Settlement {
  x: number;
  y: number;
  type: 'city' | 'village';
  name: string;
}

// ============================================
// State
// ============================================
const mapCanvas = ref<HTMLCanvasElement | null>(null);
const mapGenerated = ref(false);
const canvasSize = ref(512);

const sizeOptions = [
  { value: 256, label: 'Mała' },
  { value: 512, label: 'Średnia' },
  { value: 768, label: 'Duża' },
  { value: 1024, label: 'Ogromna' },
];

const mapSettings = reactive<MapSettings>({
  size: 512,
  seed: '',
  waterLevel: 40,
  mountainLevel: 30,
  forestLevel: 50,
  cityCount: 5,
  villageCount: 15,
});

const settlements = ref<Settlement[]>([]);

// ============================================
// Noise Generation (Simple Perlin-like)
// ============================================
let permutation: number[] = [];

function initNoise(seed: string) {
  // Simple seed-based random number generator
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }

  // Initialize permutation table
  permutation = [];
  const p: number[] = [];
  for (let i = 0; i < 256; i++) p[i] = i;

  // Shuffle based on seed
  for (let i = 255; i > 0; i--) {
    hash = (hash * 1103515245 + 12345) | 0;
    const j = Math.abs(hash) % (i + 1);
    const temp = p[i] ?? 0;
    p[i] = p[j] ?? 0;
    p[j] = temp;
  }

  for (let i = 0; i < 512; i++) {
    permutation[i] = p[i & 255] ?? 0;
  }
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function noise2D(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);

  const u = fade(x);
  const v = fade(y);

  const A = (permutation[X] ?? 0) + Y;
  const B = (permutation[X + 1] ?? 0) + Y;

  return lerp(
    lerp(grad(permutation[A] ?? 0, x, y), grad(permutation[B] ?? 0, x - 1, y), u),
    lerp(grad(permutation[A + 1] ?? 0, x, y - 1), grad(permutation[B + 1] ?? 0, x - 1, y - 1), u),
    v
  );
}

function fbm(x: number, y: number, octaves: number = 6): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, y * frequency);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

// ============================================
// Map Generation
// ============================================
function generateMap() {
  if (!mapCanvas.value) return;

  // Use seed or generate random
  if (!mapSettings.seed) {
    mapSettings.seed = Math.random().toString(36).substring(2, 10);
  }

  initNoise(mapSettings.seed);
  canvasSize.value = mapSettings.size;

  const canvas = mapCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Wait for canvas to resize
  requestAnimationFrame(() => {
    const size = mapSettings.size;
    const scale = 4; // Noise scale

    // Generate height map
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    const waterThreshold = (mapSettings.waterLevel / 100) * 0.3 - 0.15;
    const mountainThreshold = 1 - (mapSettings.mountainLevel / 100) * 0.4;
    const forestChance = mapSettings.forestLevel / 100;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const nx = x / size * scale;
        const ny = y / size * scale;

        // Height value with island mask
        const distFromCenter = Math.sqrt(
          Math.pow((x - size / 2) / (size / 2), 2) +
          Math.pow((y - size / 2) / (size / 2), 2)
        );
        const islandMask = Math.max(0, 1 - distFromCenter * 1.2);

        let height = fbm(nx, ny, 6) * islandMask;

        // Determine terrain type
        let r, g, b;

        if (height < waterThreshold - 0.1) {
          // Deep water
          r = 26; g = 95; b = 122;
        } else if (height < waterThreshold) {
          // Shallow water
          r = 52; g = 152; b = 219;
        } else if (height < waterThreshold + 0.05) {
          // Beach
          r = 244; g = 208; b = 63;
        } else if (height > mountainThreshold + 0.1) {
          // Snow peak
          r = 236; g = 240; b = 241;
        } else if (height > mountainThreshold) {
          // Mountain
          r = 127; g = 140; b = 141;
        } else {
          // Check for forest
          const forestNoise = fbm(nx * 2 + 100, ny * 2 + 100, 4);
          if (forestNoise > (1 - forestChance) * 0.5) {
            // Forest
            r = 39; g = 174; b = 96;
          } else {
            // Grassland
            r = 88; g = 214; b = 141;
          }
        }

        const idx = (y * size + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Generate settlements
    generateSettlements(ctx, size, waterThreshold);

    mapGenerated.value = true;
  });
}

function generateSettlements(
  ctx: CanvasRenderingContext2D,
  size: number,
  waterThreshold: number
) {
  settlements.value = [];
  const cityNames = ['Królewski Gród', 'Srebrna Twierdza', 'Żelazna Cytadela', 'Złoty Port', 'Mroźny Bastion',
    'Bursztynowy Zamek', 'Szmaragdowa Wieża', 'Rubinowe Wzgórze', 'Diamentowy Szczyt', 'Szafirowa Dolina'];
  const villageNames = ['Mała Wioska', 'Stare Dęby', 'Młyńskie Błonia', 'Leśna Polana', 'Rzeczny Bród',
    'Wzgórze Pastuszków', 'Kamienny Most', 'Sosnowy Gaj', 'Wilcza Jama', 'Jaskółcze Gniazdo',
    'Słoneczna Dolina', 'Mglisty Jar', 'Cichy Zakątek', 'Brzozowy Lasek', 'Podmokłe Łąki'];

  const scale = 4;

  // Place cities
  let placedCities = 0;
  let attempts = 0;
  while (placedCities < mapSettings.cityCount && attempts < 1000) {
    attempts++;
    const x = Math.floor(Math.random() * size * 0.8 + size * 0.1);
    const y = Math.floor(Math.random() * size * 0.8 + size * 0.1);

    const nx = x / size * scale;
    const ny = y / size * scale;
    const distFromCenter = Math.sqrt(
      Math.pow((x - size / 2) / (size / 2), 2) +
      Math.pow((y - size / 2) / (size / 2), 2)
    );
    const height = fbm(nx, ny, 6) * Math.max(0, 1 - distFromCenter * 1.2);

    // Cities on land, not on mountains
    if (height > waterThreshold + 0.05 && height < 0.6) {
      // Check distance from other settlements
      const tooClose = settlements.value.some(s =>
        Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2)) < 60
      );

      if (!tooClose) {
        settlements.value.push({
          x, y,
          type: 'city',
          name: cityNames[placedCities % cityNames.length] ?? 'Miasto'
        });
        placedCities++;
      }
    }
  }

  // Place villages
  let placedVillages = 0;
  attempts = 0;
  while (placedVillages < mapSettings.villageCount && attempts < 2000) {
    attempts++;
    const x = Math.floor(Math.random() * size * 0.9 + size * 0.05);
    const y = Math.floor(Math.random() * size * 0.9 + size * 0.05);

    const nx = x / size * scale;
    const ny = y / size * scale;
    const distFromCenter = Math.sqrt(
      Math.pow((x - size / 2) / (size / 2), 2) +
      Math.pow((y - size / 2) / (size / 2), 2)
    );
    const height = fbm(nx, ny, 6) * Math.max(0, 1 - distFromCenter * 1.2);

    // Villages on land
    if (height > waterThreshold + 0.03 && height < 0.7) {
      // Check distance from other settlements
      const tooClose = settlements.value.some(s => {
        const dist = Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2));
        return s.type === 'city' ? dist < 40 : dist < 25;
      });

      if (!tooClose) {
        settlements.value.push({
          x, y,
          type: 'village',
          name: villageNames[placedVillages % villageNames.length] ?? 'Wioska'
        });
        placedVillages++;
      }
    }
  }

  // Draw settlements
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';

  for (const settlement of settlements.value) {
    const emoji = settlement.type === 'city' ? '🏰' : '🏠';
    const fontSize = settlement.type === 'city' ? 16 : 12;

    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillText(emoji, settlement.x, settlement.y);
  }
}

function randomizeSeed() {
  mapSettings.seed = Math.random().toString(36).substring(2, 10);
}

function exportMap() {
  if (!mapCanvas.value) return;

  const link = document.createElement('a');
  link.download = `rpg-map-${mapSettings.seed}.png`;
  link.href = mapCanvas.value.toDataURL('image/png');
  link.click();
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  // Pre-fill seed
  randomizeSeed();
});
</script>

<style scoped lang="scss">
.map-generator-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #e0e0e0;
}

// Header
.generator-header {
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;

  &:hover {
    color: #4caf50;
  }
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  color: #4caf50;
}

.page-title {
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  color: #fff;
  margin: 0;
}

// Main Content
.generator-main {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

// Sidebar
.generator-sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  color: #4caf50;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
}

.setting-group {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.setting-label {
  display: block;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.size-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.size-btn {
  flex: 1;
  min-width: 60px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: rgba(76, 175, 80, 0.2);
    border-color: #4caf50;
    color: #4caf50;
  }
}

.seed-input-wrapper {
  display: flex;
  gap: 8px;
}

.seed-input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-family: monospace;
  font-size: 0.875rem;

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
}

.seed-random-btn {
  padding: 8px 12px;
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 6px;
  color: #4caf50;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(76, 175, 80, 0.3);
  }
}

.range-slider {
  width: 100%;
  height: 6px;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #4caf50;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.2);
    }
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #4caf50;
    border-radius: 50%;
    border: none;
    cursor: pointer;
  }
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.generate-btn,
.export-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-btn {
  background: linear-gradient(135deg, #4caf50, #388e3c);
  border: none;
  color: #fff;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  }
}

.export-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Map Canvas
.map-canvas-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  position: relative;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.map-canvas {
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 100%;
  height: auto;
}

.map-legend {
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.legend-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 8px 0;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-marker {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

// Footer
.generator-footer {
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 24px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

// Responsive
@media (max-width: 1024px) {
  .generator-main {
    flex-direction: column;
  }

  .generator-sidebar {
    width: 100%;
  }
}
</style>
