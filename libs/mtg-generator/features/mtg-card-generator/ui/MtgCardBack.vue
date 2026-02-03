<template>
  <div class="mtg-card-back">
    <div class="card-border">
      <div class="card-background">
        <div class="decoration">
          <div class="circle"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mtg-card-back {
  width: 63mm;
  height: 88mm;
  border-radius: 4mm;
  background-color: #000;
  padding: 3mm;
  box-sizing: border-box;
  overflow: hidden;

  .card-border {
    background: #4a2c1d; // Brownish
    height: 100%;
    border-radius: 2mm;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .card-background {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #3e2723 0%, #5d4037 100%);
    border: 2px solid #8d6e63;
    border-radius: 2mm;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .decoration {
    width: 40mm;
    height: 60mm;
    border: 4px solid #a1887f;
    border-radius: 20mm;
    display: flex;
    justify-content: center;
    align-items: center;

    .circle {
      width: 20mm;
      height: 20mm;
      background-color: #8d6e63;
      border-radius: 50%;
      border: 2px solid #d7ccc8;
    }
  }
}
</style>
