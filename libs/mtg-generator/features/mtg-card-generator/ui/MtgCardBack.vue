<template>
  <div class="mtg-card-back">
    <div class="mtg-card-back__inner">MTG</div>
  </div>
</template>

<style scoped>
.mtg-card-back {
  width: 252px;
  height: 352px;
  border-radius: 12px;
  border: 2px solid #111;
  background: radial-gradient(circle at 30% 30%, #7a5f1d, #2a2416);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mtg-card-back__inner {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.7);
  color: #fff;
  font-size: 32px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 2px;
}
</style>

