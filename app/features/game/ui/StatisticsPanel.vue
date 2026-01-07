<template>
  <div class="statistics-panel">
    <!-- Header with export -->
    <div class="stats-header">
      <h2 class="stats-title">
        <v-icon icon="mdi-chart-line" class="mr-2" />
        Statystyki
      </h2>
      <v-btn
        variant="outlined"
        size="small"
        color="primary"
        @click="handleExport"
      >
        <v-icon icon="mdi-export" size="18" class="mr-1" />
        Eksportuj
      </v-btn>
    </div>

    <!-- Tab navigation -->
    <div class="stats-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="stats-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <v-icon :icon="tab.icon" size="18" class="mr-1" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab content -->
    <div class="stats-content">
      <!-- Global Statistics -->
      <div v-if="activeTab === 'global'" class="stats-section">
        <h3 class="section-title">
          <v-icon icon="mdi-earth" size="20" class="mr-1" />
          Statystyki Globalne
        </h3>
        <p class="section-subtitle">Łączne osiągnięcia ze wszystkich cykli</p>

        <div class="stats-grid">
          <StatCard
            icon="mdi-cross"
            label="Łączna Wiara"
            :value="stats.formattedGlobalStats.totalFaith"
            color="primary"
          />
          <StatCard
            icon="mdi-cash"
            label="Łączne Dukaty"
            :value="stats.formattedGlobalStats.totalDucats"
            color="warning"
          />
          <StatCard
            icon="mdi-fire"
            label="Prestiże"
            :value="stats.formattedGlobalStats.totalPrestige"
            color="orange"
          />
          <StatCard
            icon="mdi-grain"
            label="Łączne Popioły"
            :value="stats.formattedGlobalStats.totalAshes"
            color="grey"
          />
          <StatCard
            icon="mdi-sword-cross"
            label="Odparte Fale"
            :value="stats.formattedGlobalStats.totalWaves"
            color="error"
          />
          <StatCard
            icon="mdi-skull"
            label="Straty"
            :value="stats.formattedGlobalStats.totalLosses"
            color="error-darken-2"
          />
          <StatCard
            icon="mdi-cursor-default-click"
            label="Kliknięcia"
            :value="stats.formattedGlobalStats.totalClicks"
            color="info"
          />
          <StatCard
            icon="mdi-office-building"
            label="Budynki"
            :value="stats.formattedGlobalStats.totalBuildings"
            color="success"
          />
        </div>

        <h4 class="subsection-title mt-4">Rekordy</h4>
        <div class="stats-grid">
          <StatCard
            icon="mdi-timer"
            label="Łączny Czas Gry"
            :value="stats.formattedGlobalStats.totalPlayTime"
            color="purple"
          />
          <StatCard
            icon="mdi-lightning-bolt"
            label="Najwyższe Combo"
            :value="stats.formattedGlobalStats.highestCombo"
            color="amber"
          />
          <StatCard
            icon="mdi-trophy"
            label="Najwyższa Fala"
            :value="stats.formattedGlobalStats.highestWave"
            color="amber-darken-2"
          />
          <StatCard
            icon="mdi-speedometer"
            label="Peak Wiara/s"
            :value="stats.formattedGlobalStats.peakFaithPerSecond"
            color="success"
          />
          <StatCard
            icon="mdi-rocket-launch"
            label="Najszybszy Prestiż"
            :value="stats.formattedGlobalStats.fastestPrestige"
            color="cyan"
          />
          <StatCard
            icon="mdi-clock-fast"
            label="Najdłuższa Sesja"
            :value="stats.formattedGlobalStats.longestSession"
            color="teal"
          />
        </div>
      </div>

      <!-- Current Cycle Statistics -->
      <div v-if="activeTab === 'cycle'" class="stats-section">
        <h3 class="section-title">
          <v-icon icon="mdi-refresh" size="20" class="mr-1" />
          Bieżący Cykl
        </h3>
        <p class="section-subtitle">Statystyki od ostatniego prestiżu</p>

        <div class="stats-grid">
          <StatCard
            icon="mdi-timer-sand"
            label="Czas Cyklu"
            :value="stats.formattedCycleStats.duration"
            color="purple"
          />
          <StatCard
            icon="mdi-cross"
            label="Wiara Zebrana"
            :value="stats.formattedCycleStats.faithEarned"
            color="primary"
          />
          <StatCard
            icon="mdi-cash"
            label="Dukaty Zebrane"
            :value="stats.formattedCycleStats.ducatsEarned"
            color="warning"
          />
          <StatCard
            icon="mdi-sword-cross"
            label="Odparte Fale"
            :value="stats.formattedCycleStats.wavesDefeated"
            color="error"
          />
          <StatCard
            icon="mdi-skull"
            label="Straty"
            :value="stats.formattedCycleStats.losses"
            color="error-darken-2"
          />
          <StatCard
            icon="mdi-cursor-default-click"
            label="Kliknięcia"
            :value="stats.formattedCycleStats.clicks"
            color="info"
          />
          <StatCard
            icon="mdi-office-building"
            label="Budynki Kupione"
            :value="stats.formattedCycleStats.buildings"
            color="success"
          />
          <StatCard
            icon="mdi-lightning-bolt"
            label="Najwyższe Combo"
            :value="stats.formattedCycleStats.highestCombo"
            color="amber"
          />
        </div>

        <h4 class="subsection-title mt-4">Produkcja w Czasie Rzeczywistym</h4>
        <div class="production-rates">
          <div class="rate-card">
            <div class="rate-label">Wiara/sekundę</div>
            <div class="rate-value">{{ formatNumber(stats.currentFaithPerSecond) }}</div>
          </div>
          <div class="rate-card">
            <div class="rate-label">Wiara/minutę</div>
            <div class="rate-value">{{ formatNumber(stats.currentFaithPerMinute) }}</div>
          </div>
          <div class="rate-card">
            <div class="rate-label">Wiara/godzinę</div>
            <div class="rate-value">{{ formatNumber(stats.currentFaithPerHour) }}</div>
          </div>
        </div>

        <h4 class="subsection-title mt-4">Wydajność Budynków</h4>
        <div class="efficiency-list">
          <div
            v-for="(building, index) in stats.buildingEfficiency.slice(0, 8)"
            :key="building.id"
            class="efficiency-item"
          >
            <span class="efficiency-rank">#{{ index + 1 }}</span>
            <span class="efficiency-name">{{ building.name }}</span>
            <span class="efficiency-count">×{{ building.count }}</span>
            <span class="efficiency-production">+{{ formatNumber(building.production) }}/s</span>
          </div>
          <div v-if="stats.buildingEfficiency.length === 0" class="no-data">
            Brak budynków produkujących Wiarę
          </div>
        </div>
      </div>

      <!-- Production Chart -->
      <div v-if="activeTab === 'chart'" class="stats-section">
        <h3 class="section-title">
          <v-icon icon="mdi-chart-areaspline" size="20" class="mr-1" />
          Wykres Produkcji
        </h3>
        <p class="section-subtitle">Historia produkcji Wiary (ostatnie 24h)</p>

        <div class="chart-container">
          <svg
            ref="chartSvg"
            class="production-chart"
            viewBox="0 0 800 300"
            preserveAspectRatio="xMidYMid meet"
          >
            <!-- Grid lines -->
            <g class="grid-lines">
              <line
                v-for="i in 5"
                :key="'h-' + i"
                :x1="50"
                :y1="50 + (i - 1) * 50"
                :x2="780"
                :y2="50 + (i - 1) * 50"
                stroke="rgba(255,255,255,0.1)"
              />
              <line
                v-for="i in 7"
                :key="'v-' + i"
                :x1="50 + i * 100"
                :y1="50"
                :x2="50 + i * 100"
                :y2="250"
                stroke="rgba(255,255,255,0.1)"
              />
            </g>

            <!-- Y-axis labels -->
            <g class="y-labels">
              <text
                v-for="(label, i) in yAxisLabels"
                :key="'y-' + i"
                :x="45"
                :y="55 + i * 50"
                text-anchor="end"
                fill="rgba(255,255,255,0.6)"
                font-size="10"
              >
                {{ label }}
              </text>
            </g>

            <!-- X-axis labels -->
            <g class="x-labels">
              <text
                v-for="(label, i) in xAxisLabels"
                :key="'x-' + i"
                :x="50 + i * 120"
                :y="270"
                text-anchor="middle"
                fill="rgba(255,255,255,0.6)"
                font-size="10"
              >
                {{ label }}
              </text>
            </g>

            <!-- Area fill -->
            <path
              v-if="chartPath"
              :d="chartAreaPath"
              fill="url(#areaGradient)"
              opacity="0.3"
            />

            <!-- Line -->
            <path
              v-if="chartPath"
              :d="chartPath"
              fill="none"
              stroke="#ffc107"
              stroke-width="2"
            />

            <!-- Data points -->
            <circle
              v-for="(point, i) in chartPoints"
              :key="'p-' + i"
              :cx="point.x"
              :cy="point.y"
              r="3"
              fill="#ffc107"
            />

            <!-- Gradient definition -->
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ffc107" stop-opacity="0.4" />
                <stop offset="100%" stop-color="#ffc107" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>

          <div v-if="chartPoints.length === 0" class="no-chart-data">
            <v-icon icon="mdi-chart-line-variant" size="48" color="grey" />
            <p>Brak danych do wyświetlenia</p>
            <p class="text-caption">Dane zbierane co 5 minut</p>
          </div>
        </div>
      </div>

      <!-- Prestige History -->
      <div v-if="activeTab === 'history'" class="stats-section">
        <h3 class="section-title">
          <v-icon icon="mdi-history" size="20" class="mr-1" />
          Historia Prestiży
        </h3>
        <p class="section-subtitle">Poprzednie cykle prestiżowe</p>

        <div v-if="stats.prestigeHistory.length > 0" class="prestige-history">
          <div class="history-header">
            <span class="col-cycle">#</span>
            <span class="col-duration">Czas</span>
            <span class="col-faith">Wiara</span>
            <span class="col-waves">Fale</span>
            <span class="col-ashes">Popioły</span>
            <span class="col-peak">Peak/s</span>
          </div>
          <div
            v-for="cycle in [...stats.prestigeHistory].reverse().slice(0, 20)"
            :key="cycle.cycleNumber"
            class="history-row"
            :class="{ 'best-cycle': isBestCycle(cycle) }"
          >
            <span class="col-cycle">{{ cycle.cycleNumber }}</span>
            <span class="col-duration">{{ formatDuration(cycle.duration) }}</span>
            <span class="col-faith">{{ formatNumber(bn(cycle.totalFaithEarned)) }}</span>
            <span class="col-waves">{{ cycle.wavesDefeated }}</span>
            <span class="col-ashes">{{ cycle.ashesEarned }}</span>
            <span class="col-peak">{{ formatNumber(bn(cycle.peakFaithPerSecond)) }}</span>
          </div>
        </div>

        <div v-else class="no-data">
          <v-icon icon="mdi-history" size="48" color="grey" />
          <p>Brak historii prestiży</p>
          <p class="text-caption">Wykonaj prestiż, aby zobaczyć historię</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStatisticsStore } from '~/stores/solmar-sanctuary/statistics';
import { formatNumber, bn } from '~/shared/lib/big-number';

// Sub-component for stat cards
const StatCard = defineComponent({
  props: {
    icon: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    color: { type: String, default: 'primary' },
  },
  template: `
    <div class="stat-card">
      <v-icon :icon="icon" :color="color" size="24" class="stat-icon" />
      <div class="stat-info">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-label">{{ label }}</div>
      </div>
    </div>
  `,
});

const stats = useStatisticsStore();

const activeTab = ref('global');

const tabs = [
  { id: 'global', label: 'Globalne', icon: 'mdi-earth' },
  { id: 'cycle', label: 'Bieżący Cykl', icon: 'mdi-refresh' },
  { id: 'chart', label: 'Wykres', icon: 'mdi-chart-line' },
  { id: 'history', label: 'Historia', icon: 'mdi-history' },
];

// Chart data
const chartData = computed(() => stats.getProductionHistory(24));

const chartPoints = computed(() => {
  const data = chartData.value;
  if (data.length < 2) return [];

  const maxValue = Math.max(...data.map((d) => d.faith), 1);
  const chartWidth = 730; // 780 - 50 (padding)
  const chartHeight = 200; // 250 - 50 (padding)

  return data.map((sample, i) => ({
    x: 50 + (i / (data.length - 1)) * chartWidth,
    y: 250 - (sample.faith / maxValue) * chartHeight,
    value: sample.faith,
  }));
});

const chartPath = computed(() => {
  if (chartPoints.value.length < 2) return '';
  return chartPoints.value
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');
});

const chartAreaPath = computed(() => {
  if (chartPoints.value.length < 2) return '';
  const points = chartPoints.value;
  const first = points[0];
  const last = points[points.length - 1];
  return `${chartPath.value} L ${last.x} 250 L ${first.x} 250 Z`;
});

const yAxisLabels = computed(() => {
  const data = chartData.value;
  if (data.length === 0) return ['0', '0', '0', '0', '0'];

  const maxValue = Math.max(...data.map((d) => d.faith), 1);
  return [
    formatNumber(bn(maxValue)),
    formatNumber(bn(maxValue * 0.75)),
    formatNumber(bn(maxValue * 0.5)),
    formatNumber(bn(maxValue * 0.25)),
    '0',
  ];
});

const xAxisLabels = computed(() => {
  return ['24h', '20h', '16h', '12h', '8h', '4h', 'Teraz'];
});

// Helper functions
function formatDuration(seconds: number): string {
  return stats.formatDuration(seconds);
}

function isBestCycle(cycle: { ashesEarned: number }): boolean {
  const best = Math.max(...stats.prestigeHistory.map((c) => c.ashesEarned));
  return cycle.ashesEarned === best && cycle.ashesEarned > 0;
}

function handleExport() {
  const data = stats.exportStats();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `solmar-stats-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped lang="scss">
.statistics-panel {
  padding: 16px;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stats-title {
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  color: #ffc107;
  display: flex;
  align-items: center;
}

.stats-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.stats-tab {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  font-size: 0.875rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  &.active {
    background: rgba(255, 193, 7, 0.2);
    border-color: #ffc107;
    color: #ffc107;
  }
}

.stats-content {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.section-title {
  font-family: 'Cinzel', serif;
  font-size: 1.25rem;
  color: #ffc107;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.section-subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  margin-bottom: 16px;
}

.subsection-title {
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-icon {
  flex-shrink: 0;
}

.stat-info {
  min-width: 0;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.production-rates {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.rate-card {
  flex: 1;
  min-width: 120px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.05));
  border-radius: 8px;
  border: 1px solid rgba(255, 193, 7, 0.3);
  text-align: center;
}

.rate-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.rate-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffc107;
}

.efficiency-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.efficiency-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.efficiency-rank {
  font-weight: 600;
  color: #ffc107;
  width: 24px;
}

.efficiency-name {
  flex: 1;
  color: white;
}

.efficiency-count {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

.efficiency-production {
  color: #4caf50;
  font-weight: 500;
}

.chart-container {
  position: relative;
  width: 100%;
  min-height: 300px;
}

.production-chart {
  width: 100%;
  height: auto;
}

.no-chart-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: rgba(255, 255, 255, 0.5);

  p {
    margin-top: 8px;
  }
}

.prestige-history {
  overflow-x: auto;
}

.history-header,
.history-row {
  display: grid;
  grid-template-columns: 50px 80px 100px 60px 70px 80px;
  gap: 8px;
  padding: 8px 12px;
  align-items: center;
}

.history-header {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px 6px 0 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}

.history-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.875rem;

  &:last-child {
    border-bottom: none;
  }

  &.best-cycle {
    background: rgba(255, 193, 7, 0.1);

    .col-ashes {
      color: #ffc107;
      font-weight: 600;
    }
  }
}

.col-cycle {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.col-duration {
  color: rgba(255, 255, 255, 0.6);
}

.col-faith {
  color: #90caf9;
}

.col-waves {
  color: #ef5350;
}

.col-ashes {
  color: rgba(255, 255, 255, 0.8);
}

.col-peak {
  color: #4caf50;
}

.no-data {
  text-align: center;
  padding: 32px;
  color: rgba(255, 255, 255, 0.5);

  p {
    margin-top: 8px;
  }
}
</style>

