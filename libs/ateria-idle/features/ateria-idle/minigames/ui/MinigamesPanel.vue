<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAteriaMinigamesStore } from '../model/minigames.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { MINIGAMES, getCardDisplay } from '../data/minigames.data';

const minigamesStore = useAteriaMinigamesStore();
const resourcesStore = useAteriaResourcesStore();

const activeTab = ref<'games' | 'stats'>('games');
const selectedGame = ref<string | null>(null);
const betAmount = ref<number>(100);
const puzzleDifficulty = ref<'easy' | 'normal' | 'hard'>('normal');

const selectedGameData = computed(() => {
  if (!selectedGame.value) return null;
  return MINIGAMES.find((g) => g.id === selectedGame.value);
});
</script>

<template>
  <div class="minigames-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar color="purple-darken-2" size="56" class="mr-4">
            <v-icon size="32" color="white">mdi-gamepad-variant</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h5">Mini-Gry</div>
            <div class="text-body-2 text-medium-emphasis">
              Hazard, puzzle i zabawy!
            </div>
          </div>
          <v-chip color="amber" size="large">
            <v-icon start>mdi-gold</v-icon>
            {{ resourcesStore.resources.gold.toLocaleString() }}g
          </v-chip>
        </div>

        <v-row class="mt-3">
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ minigamesStore.stats.gamesPlayed }}</div>
            <div class="text-caption">Gier</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div
              class="text-h6"
              :class="
                minigamesStore.winRate >= 50 ? 'text-success' : 'text-error'
              "
            >
              {{ minigamesStore.winRate.toFixed(1) }}%
            </div>
            <div class="text-caption">Winrate</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div
              class="text-h6"
              :class="
                minigamesStore.netProfit >= 0 ? 'text-success' : 'text-error'
              "
            >
              {{ minigamesStore.netProfit >= 0 ? '+' : ''
              }}{{ minigamesStore.netProfit.toLocaleString() }}
            </div>
            <div class="text-caption">Bilans</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6 text-amber">
              {{ minigamesStore.stats.biggestWin.toLocaleString() }}
            </div>
            <div class="text-caption">Rekord</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="purple" class="mb-4">
      <v-tab value="games">
        <v-icon start>mdi-dice-multiple</v-icon>
        Gry
      </v-tab>
      <v-tab value="stats">
        <v-icon start>mdi-chart-bar</v-icon>
        Statystyki
      </v-tab>
    </v-tabs>

    <!-- Games Tab -->
    <div v-if="activeTab === 'games'">
      <v-row>
        <!-- Game Selection -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Wybierz Grę</v-card-title>
            <v-card-text class="pa-0">
              <v-list density="compact">
                <v-list-item
                  v-for="game in MINIGAMES"
                  :key="game.id"
                  :active="selectedGame === game.id"
                  @click="
                    selectedGame = game.id;
                    minigamesStore.clearGame(game.type);
                  "
                >
                  <template #prepend>
                    <v-avatar :color="game.color" size="40">
                      <v-icon color="white">{{ game.icon }}</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ game.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ game.type }}</v-list-item-subtitle>
                  <template #append>
                    <v-chip
                      v-if="minigamesStore.isOnCooldown(game.id)"
                      size="x-small"
                      color="warning"
                    >
                      CD
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Game Area -->
        <v-col cols="12" md="8">
          <v-card v-if="selectedGameData" min-height="400">
            <v-card-title class="d-flex align-center">
              <v-avatar :color="selectedGameData.color" size="40" class="mr-3">
                <v-icon color="white">{{ selectedGameData.icon }}</v-icon>
              </v-avatar>
              {{ selectedGameData.name }}
            </v-card-title>

            <v-card-text>
              <div class="text-body-2 mb-4">
                {{ selectedGameData.description }}
              </div>

              <!-- Dice Game -->
              <div v-if="selectedGameData.type === 'dice'">
                <div class="d-flex align-center gap-4 mb-4">
                  <v-text-field
                    v-model.number="betAmount"
                    type="number"
                    label="Stawka"
                    :min="selectedGameData.minBet"
                    :max="selectedGameData.maxBet"
                    prepend-inner-icon="mdi-gold"
                    density="compact"
                    variant="outlined"
                    style="max-width: 200px"
                  />
                  <v-btn
                    color="success"
                    :disabled="!minigamesStore.canPlayDice(betAmount).canPlay"
                    @click="minigamesStore.playDice(betAmount)"
                  >
                    <v-icon start>mdi-dice-multiple</v-icon>
                    Rzuć!
                  </v-btn>
                </div>

                <div
                  v-if="minigamesStore.activeDiceGame"
                  class="dice-result text-center pa-4"
                >
                  <v-row>
                    <v-col cols="5">
                      <div class="text-h6">Ty</div>
                      <div class="dice-display">
                        <span
                          v-for="(d, i) in minigamesStore.activeDiceGame
                            .playerDice"
                          :key="i"
                          class="dice"
                          >{{ d }}</span
                        >
                      </div>
                      <div class="text-h4 mt-2">
                        {{ minigamesStore.activeDiceGame.playerTotal }}
                      </div>
                    </v-col>
                    <v-col cols="2" class="d-flex align-center justify-center">
                      <v-icon size="48">mdi-sword-cross</v-icon>
                    </v-col>
                    <v-col cols="5">
                      <div class="text-h6">NPC</div>
                      <div class="dice-display">
                        <span
                          v-for="(d, i) in minigamesStore.activeDiceGame
                            .npcDice"
                          :key="i"
                          class="dice"
                          >{{ d }}</span
                        >
                      </div>
                      <div class="text-h4 mt-2">
                        {{ minigamesStore.activeDiceGame.npcTotal }}
                      </div>
                    </v-col>
                  </v-row>
                  <v-chip
                    :color="
                      minigamesStore.activeDiceGame.result === 'win'
                        ? 'success'
                        : minigamesStore.activeDiceGame.result === 'lose'
                          ? 'error'
                          : 'info'
                    "
                    size="large"
                    class="mt-4"
                  >
                    {{
                      minigamesStore.activeDiceGame.result === 'win'
                        ? 'WYGRANA!'
                        : minigamesStore.activeDiceGame.result === 'lose'
                          ? 'PRZEGRANA'
                          : 'REMIS'
                    }}
                  </v-chip>
                </div>
              </div>

              <!-- Blackjack -->
              <div v-else-if="selectedGameData.id === 'blackjack'">
                <div
                  v-if="!minigamesStore.activeCardGame"
                  class="d-flex align-center gap-4 mb-4"
                >
                  <v-text-field
                    v-model.number="betAmount"
                    type="number"
                    label="Stawka"
                    :min="selectedGameData.minBet"
                    :max="selectedGameData.maxBet"
                    prepend-inner-icon="mdi-gold"
                    density="compact"
                    variant="outlined"
                    style="max-width: 200px"
                  />
                  <v-btn
                    color="success"
                    :disabled="
                      !minigamesStore.canPlayBlackjack(betAmount).canPlay
                    "
                    @click="minigamesStore.startBlackjack(betAmount)"
                  >
                    <v-icon start>mdi-cards-playing</v-icon>
                    Rozdaj!
                  </v-btn>
                </div>

                <div v-else class="blackjack-table pa-4">
                  <!-- Dealer -->
                  <div class="mb-4">
                    <div class="text-subtitle-2 mb-2">
                      Krupier ({{ minigamesStore.activeCardGame.dealerScore }})
                    </div>
                    <div class="d-flex gap-2">
                      <v-chip
                        v-for="(card, i) in minigamesStore.activeCardGame
                          .dealerHand"
                        :key="i"
                        size="large"
                        :color="
                          card.faceUp
                            ? card.suit === 'hearts' || card.suit === 'diamonds'
                              ? 'red'
                              : 'grey-darken-3'
                            : 'blue-grey'
                        "
                      >
                        {{ card.faceUp ? getCardDisplay(card) : '?' }}
                      </v-chip>
                    </div>
                  </div>

                  <v-divider class="my-4" />

                  <!-- Player -->
                  <div class="mb-4">
                    <div class="text-subtitle-2 mb-2">
                      Ty ({{ minigamesStore.activeCardGame.playerScore }})
                    </div>
                    <div class="d-flex gap-2">
                      <v-chip
                        v-for="(card, i) in minigamesStore.activeCardGame
                          .playerHand"
                        :key="i"
                        size="large"
                        :color="
                          card.suit === 'hearts' || card.suit === 'diamonds'
                            ? 'red'
                            : 'grey-darken-3'
                        "
                      >
                        {{ getCardDisplay(card) }}
                      </v-chip>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div
                    v-if="minigamesStore.activeCardGame.phase === 'playing'"
                    class="d-flex gap-2"
                  >
                    <v-btn
                      color="primary"
                      @click="minigamesStore.blackjackHit()"
                    >
                      <v-icon start>mdi-plus</v-icon>
                      Dobierz
                    </v-btn>
                    <v-btn
                      color="warning"
                      @click="minigamesStore.blackjackStand()"
                    >
                      <v-icon start>mdi-hand-back-right</v-icon>
                      Stój
                    </v-btn>
                  </div>

                  <!-- Result -->
                  <div
                    v-else-if="minigamesStore.activeCardGame.phase === 'result'"
                    class="text-center"
                  >
                    <v-chip
                      :color="
                        minigamesStore.activeCardGame.result === 'win' ||
                        minigamesStore.activeCardGame.result === 'blackjack'
                          ? 'success'
                          : minigamesStore.activeCardGame.result === 'lose'
                            ? 'error'
                            : 'info'
                      "
                      size="x-large"
                      class="mb-4"
                    >
                      {{
                        minigamesStore.activeCardGame.result === 'blackjack'
                          ? 'BLACKJACK! 🎉'
                          : minigamesStore.activeCardGame.result === 'win'
                            ? 'WYGRANA!'
                            : minigamesStore.activeCardGame.result === 'lose'
                              ? 'PRZEGRANA'
                              : 'REMIS'
                      }}
                    </v-chip>
                    <v-btn
                      color="primary"
                      @click="minigamesStore.clearGame('cards')"
                    >
                      Nowa gra
                    </v-btn>
                  </div>
                </div>
              </div>

              <!-- Slots -->
              <div v-else-if="selectedGameData.id === 'slots'">
                <div class="d-flex align-center gap-4 mb-4">
                  <v-text-field
                    v-model.number="betAmount"
                    type="number"
                    label="Stawka"
                    :min="selectedGameData.minBet"
                    :max="selectedGameData.maxBet"
                    prepend-inner-icon="mdi-gold"
                    density="compact"
                    variant="outlined"
                    style="max-width: 200px"
                  />
                  <v-btn
                    color="success"
                    :disabled="!minigamesStore.canPlaySlots(betAmount).canPlay"
                    @click="minigamesStore.playSlots(betAmount)"
                  >
                    <v-icon start>mdi-slot-machine</v-icon>
                    Zakręć!
                  </v-btn>
                </div>

                <div
                  v-if="minigamesStore.activeSlotsGame"
                  class="slots-display text-center pa-4"
                >
                  <div class="slots-reels d-flex justify-center gap-4 mb-4">
                    <div
                      v-for="(symbol, i) in minigamesStore.activeSlotsGame
                        .currentSpin"
                      :key="i"
                      class="slot-reel"
                    >
                      {{ symbol }}
                    </div>
                  </div>
                  <v-chip
                    :color="
                      minigamesStore.activeSlotsGame.result === 'jackpot'
                        ? 'amber'
                        : minigamesStore.activeSlotsGame.result === 'bigwin'
                          ? 'success'
                          : minigamesStore.activeSlotsGame.result === 'win'
                            ? 'primary'
                            : 'grey'
                    "
                    size="large"
                  >
                    {{
                      minigamesStore.activeSlotsGame.result === 'jackpot'
                        ? '🎰 JACKPOT! 🎰'
                        : minigamesStore.activeSlotsGame.result === 'bigwin'
                          ? '💰 DUŻA WYGRANA!'
                          : minigamesStore.activeSlotsGame.result === 'win'
                            ? '✨ Wygrana!'
                            : 'Spróbuj ponownie'
                    }}
                    <template
                      v-if="minigamesStore.activeSlotsGame.multiplier > 0"
                    >
                      (x{{ minigamesStore.activeSlotsGame.multiplier }})
                    </template>
                  </v-chip>
                </div>
              </div>

              <!-- Puzzle -->
              <div v-else-if="selectedGameData.id === 'puzzle_15'">
                <div
                  v-if="!minigamesStore.activePuzzleGame"
                  class="d-flex align-center gap-4 mb-4"
                >
                  <v-select
                    v-model="puzzleDifficulty"
                    :items="[
                      { title: 'Łatwy (3x3)', value: 'easy' },
                      { title: 'Normalny (4x4)', value: 'normal' },
                      { title: 'Trudny (5x5)', value: 'hard' },
                    ]"
                    label="Trudność"
                    density="compact"
                    variant="outlined"
                    style="max-width: 200px"
                  />
                  <v-btn
                    color="success"
                    @click="minigamesStore.startPuzzle(puzzleDifficulty)"
                  >
                    <v-icon start>mdi-puzzle</v-icon>
                    Start!
                  </v-btn>
                </div>

                <div v-else class="puzzle-game">
                  <div class="d-flex justify-space-between mb-2">
                    <span
                      >Ruchy: {{ minigamesStore.activePuzzleGame.moves }}</span
                    >
                    <v-chip
                      v-if="minigamesStore.activePuzzleGame.solved"
                      color="success"
                      >Ukończone!</v-chip
                    >
                  </div>
                  <div
                    class="puzzle-grid"
                    :style="{
                      gridTemplateColumns: `repeat(${minigamesStore.activePuzzleGame.grid.length}, 1fr)`,
                    }"
                  >
                    <div
                      v-for="(row, y) in minigamesStore.activePuzzleGame.grid"
                      :key="y"
                      class="puzzle-row"
                    >
                      <div
                        v-for="(cell, x) in row"
                        :key="`${x}-${y}`"
                        class="puzzle-cell"
                        :class="{ 'puzzle-empty': cell === 0 }"
                        @click="minigamesStore.movePuzzleTile(x, y)"
                      >
                        {{ cell || '' }}
                      </div>
                    </div>
                  </div>
                  <v-btn
                    v-if="minigamesStore.activePuzzleGame.solved"
                    color="primary"
                    class="mt-4"
                    @click="minigamesStore.clearGame('puzzle')"
                  >
                    Nowa gra
                  </v-btn>
                </div>
              </div>

              <!-- Memory -->
              <div v-else-if="selectedGameData.id === 'memory_match'">
                <div
                  v-if="!minigamesStore.activeMemoryGame"
                  class="d-flex align-center gap-4 mb-4"
                >
                  <v-select
                    v-model="puzzleDifficulty"
                    :items="[
                      { title: 'Łatwy (6 par)', value: 'easy' },
                      { title: 'Normalny (8 par)', value: 'normal' },
                      { title: 'Trudny (12 par)', value: 'hard' },
                    ]"
                    label="Trudność"
                    density="compact"
                    variant="outlined"
                    style="max-width: 200px"
                  />
                  <v-btn
                    color="success"
                    @click="minigamesStore.startMemory(puzzleDifficulty)"
                  >
                    <v-icon start>mdi-cards</v-icon>
                    Start!
                  </v-btn>
                </div>

                <div v-else class="memory-game">
                  <div class="d-flex justify-space-between mb-2">
                    <span
                      >Próby:
                      {{ minigamesStore.activeMemoryGame.attempts }}</span
                    >
                    <span
                      >Pary: {{ minigamesStore.activeMemoryGame.matches }} /
                      {{
                        minigamesStore.activeMemoryGame.cards.length / 2
                      }}</span
                    >
                  </div>
                  <div class="memory-grid">
                    <div
                      v-for="card in minigamesStore.activeMemoryGame.cards"
                      :key="card.id"
                      class="memory-card"
                      :class="{
                        'memory-flipped': card.flipped || card.matched,
                        'memory-matched': card.matched,
                      }"
                      @click="minigamesStore.flipMemoryCard(card.id)"
                    >
                      {{ card.flipped || card.matched ? card.symbol : '?' }}
                    </div>
                  </div>
                  <v-btn
                    v-if="
                      minigamesStore.activeMemoryGame.matches ===
                      minigamesStore.activeMemoryGame.cards.length / 2
                    "
                    color="primary"
                    class="mt-4"
                    @click="minigamesStore.clearGame('memory')"
                  >
                    Nowa gra
                  </v-btn>
                </div>
              </div>

              <!-- Rules -->
              <v-divider class="my-4" />
              <div class="text-subtitle-2 mb-2">Zasady:</div>
              <ul class="text-body-2">
                <li v-for="(rule, i) in selectedGameData.rules" :key="i">
                  {{ rule }}
                </li>
              </ul>
            </v-card-text>
          </v-card>

          <v-card v-else>
            <v-card-text class="text-center py-8 text-medium-emphasis">
              <v-icon size="64" class="mb-2">mdi-gamepad-variant</v-icon>
              <div class="text-h6">Wybierz grę z listy</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Stats Tab -->
    <div v-if="activeTab === 'stats'">
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Statystyki Ogólne</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item>
                  <template #prepend
                    ><v-icon color="primary">mdi-gamepad</v-icon></template
                  >
                  <v-list-item-title>Rozegranych gier</v-list-item-title>
                  <template #append>{{
                    minigamesStore.stats.gamesPlayed
                  }}</template>
                </v-list-item>
                <v-list-item>
                  <template #prepend
                    ><v-icon color="success">mdi-trophy</v-icon></template
                  >
                  <v-list-item-title>Wygranych</v-list-item-title>
                  <template #append>{{
                    minigamesStore.stats.gamesWon
                  }}</template>
                </v-list-item>
                <v-list-item>
                  <template #prepend
                    ><v-icon color="amber">mdi-gold</v-icon></template
                  >
                  <v-list-item-title>Łącznie postawiono</v-list-item-title>
                  <template #append
                    >{{
                      minigamesStore.stats.totalBet.toLocaleString()
                    }}g</template
                  >
                </v-list-item>
                <v-list-item>
                  <template #prepend
                    ><v-icon color="success">mdi-cash-plus</v-icon></template
                  >
                  <v-list-item-title>Łącznie wygrano</v-list-item-title>
                  <template #append
                    >{{
                      minigamesStore.stats.totalWon.toLocaleString()
                    }}g</template
                  >
                </v-list-item>
                <v-list-item>
                  <template #prepend
                    ><v-icon color="warning">mdi-star</v-icon></template
                  >
                  <v-list-item-title>Największa wygrana</v-list-item-title>
                  <template #append
                    >{{
                      minigamesStore.stats.biggestWin.toLocaleString()
                    }}g</template
                  >
                </v-list-item>
                <v-list-item>
                  <template #prepend
                    ><v-icon color="info">mdi-fire</v-icon></template
                  >
                  <v-list-item-title>Najlepsza seria</v-list-item-title>
                  <template #append>{{
                    minigamesStore.stats.bestStreak
                  }}</template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Statystyki Gier</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="(gameStats, gameId) in minigamesStore.stats.byGame"
                  :key="gameId"
                >
                  <template #prepend>
                    <v-avatar
                      :color="MINIGAMES.find((g) => g.id === gameId)?.color"
                      size="32"
                    >
                      <v-icon size="18" color="white">{{
                        MINIGAMES.find((g) => g.id === gameId)?.icon
                      }}</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{
                    MINIGAMES.find((g) => g.id === gameId)?.name
                  }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ gameStats.won }} / {{ gameStats.played }} ({{
                      gameStats.played > 0
                        ? ((gameStats.won / gameStats.played) * 100).toFixed(0)
                        : 0
                    }}%)
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
.dice-display {
  font-size: 2rem;
}

.dice {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: white;
  border: 2px solid #333;
  border-radius: 8px;
  margin: 0 4px;
  font-weight: bold;
}

.slot-reel {
  font-size: 3rem;
  padding: 16px;
  background: linear-gradient(180deg, #333 0%, #666 50%, #333 100%);
  border-radius: 8px;
  min-width: 80px;
}

.puzzle-grid {
  display: grid;
  gap: 4px;
  max-width: 400px;
  margin: 0 auto;
}

.puzzle-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1976d2;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.1s;
}

.puzzle-cell:hover:not(.puzzle-empty) {
  transform: scale(1.05);
}

.puzzle-empty {
  background: transparent;
  cursor: default;
}

.memory-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  max-width: 400px;
  margin: 0 auto;
}

.memory-card {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1976d2;
  color: white;
  font-size: 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.memory-flipped {
  background: white;
  color: #333;
}

.memory-matched {
  background: #4caf50;
  color: white;
}
</style>
