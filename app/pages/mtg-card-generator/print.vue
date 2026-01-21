<template>
  <div class="print-page-container">
    <div class="no-print controls">
      <v-container>
        <v-row>
          <v-col cols="12" class="d-flex justify-space-between align-center">
            <h2>Print Layout Preview</h2>
            <div>
              <v-btn @click="print" color="primary" prepend-icon="mdi-printer"
                >Print</v-btn
              >
              <v-btn to="/mtg-card-generator" variant="text" class="ml-2"
                >Back to List</v-btn
              >
            </div>
          </v-col>
        </v-row>
        <v-alert type="info" variant="tonal" class="mb-4">
          <p><strong>Printing Instructions:</strong></p>
          <ul>
            <li>Paper Size: <strong>A4</strong></li>
            <li>Scale: <strong>100%</strong> (Do not scale to fit)</li>
            <li>
              Margins: <strong>Minimum/None</strong> (or Default, layout has
              padding)
            </li>
            <li>Two-Sided: <strong>Flip on Long Edge</strong> (Standard)</li>
          </ul>
        </v-alert>
      </v-container>
    </div>

    <!-- Print Content -->
    <div class="print-area">
      <template v-for="(chunk, pageIndex) in chunks" :key="pageIndex">
        <!-- Front Page -->
        <div class="sheet front-sheet">
          <div class="grid">
            <div
              v-for="(card, cardIndex) in chunk"
              :key="'front-' + card.id"
              class="card-slot"
            >
              <MtgCard :card="card" />
            </div>
          </div>
        </div>

        <!-- Back Page (Mirrored for Duplex) -->
        <div class="sheet back-sheet">
          <div class="grid">
            <!--
                        We need to render backs in an order that aligns with the fronts when flipped on Long Edge.
                        Row 1 Front: 1, 2, 3
                        Row 1 Back:  3, 2, 1

                        We can achieve this by reversing the row content for each row, or simply filling the grid right-to-left?
                        CSS Grid fills left-to-right.
                        So for the Back Sheet, we need to reorder the array.
                     -->
            <div
              v-for="(card, cardIndex) in getMirroredChunk(chunk)"
              :key="card ? 'back-' + card.id : 'back-empty-' + cardIndex"
              class="card-slot"
            >
              <MtgCardBack />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMtgCardStore } from '~/features/mtg-card-generator/stores/mtg-card-store';
import MtgCard from '~/features/mtg-card-generator/ui/MtgCard.vue';
import MtgCardBack from '~/features/mtg-card-generator/ui/MtgCardBack.vue';
import type { RpgCard as MtgCardType } from '~/features/mtg-card-generator/types';

const store = useMtgCardStore();
const cards = computed(() => store.cards);

const CARDS_PER_SHEET = 9;

const chunks = computed(() => {
  const result = [];
  for (let i = 0; i < cards.value.length; i += CARDS_PER_SHEET) {
    result.push(cards.value.slice(i, i + CARDS_PER_SHEET));
  }
  return result;
});

const getMirroredChunk = (chunk: MtgCardType[]) => {
  // Front: [1, 2, 3, 4, 5, 6, 7, 8, 9] (if full)
  // Rows:
  // [1, 2, 3]
  // [4, 5, 6]
  // [7, 8, 9]

  // Back needs to align behind them.
  // If we flip the LONG EDGE (standard book/binder flip for Portrait):
  // The top-left of the Front Sheet becomes the top-right of the Back Sheet.
  // So the Back Sheet row should be [3, 2, 1] backs.

  // So for each row of 3, we reverse it?
  // Let's process by rows.

  const rows = [];
  for (let i = 0; i < chunk.length; i += 3) {
    const row = chunk.slice(i, i + 3);
    // Check if row is incomplete (e.g. only 1 card).
    // Front: [1] [ ] [ ]
    // Back:  [ ] [ ] [1]

    // We must pad the row to 3 slots to ensure 'reverse' places item in correct column?
    // Actually, we are iterating over 'cards'.
    // We should construct a full grid of 9 slots for the back sheet logic to be robust.

    const paddedRow = [...row];
    while (paddedRow.length < 3) {
      paddedRow.push(null as any); // Filler
    }

    // Reverse this row for the back sheet
    rows.push(...paddedRow.reverse());
  }

  return rows;
};

const print = () => {
  window.print();
};
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }

  .print-page-container {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  body,
  html {
    margin: 0;
    padding: 0;
    background: white;
  }

  /* Ensure background graphics (colors) are printed */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .sheet {
    break-after: page;
    page-break-after: always;
  }
}

.print-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ccc; /* Gray background for preview */
  padding: 20px;
}

@media print {
  .print-area {
    background: white; /* Clean background for print */
    display: block; /* Normal layout flow */
    padding: 0;
  }
}

.sheet {
  width: 210mm;
  height: 297mm;
  background: white;
  margin-bottom: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  padding: 10mm; /* Safe print margin usually */
  /* Center grid vertically/horizontally if desired, or Top-Left */
  display: flex;
  justify-content: center;
  align-items: center; /* Center on page */
  box-sizing: border-box;
  overflow: hidden; /* Prevent spillover */
}

@media print {
  .sheet {
    box-shadow: none;
    margin-bottom: 0;
    margin: 0; /* Let print dialog handle paper setup, but we force size */
    width: 100%;
    height: 100vh; /* Fill page */
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 63mm);
  grid-template-rows: repeat(3, 88mm);
  /* No gap for easy cutting? Or small gap? User asked for resizing to MTG. Standard is usually tight or with cut lines.
       If we want exactly 63x88mm cards, we can butt them together to minimize cuts (single cut between cards).
    */
  gap: 0;
  border: 1px dashed #ddd; /* Helper guide lines on screen */
}

@media print {
  .grid {
    border: none;
  }
}

.card-slot {
  width: 63mm;
  height: 88mm;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Optional: cut marks? */
}
</style>
