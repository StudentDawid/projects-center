<template>
  <canvas
    ref="canvasRef"
    class="continent-map"
    :width="canvasWidth"
    :height="canvasHeight"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { initNoise, fbm } from '~/shared/lib/perlin-noise';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWidth = ref(800);
const canvasHeight = ref(450);

// Initialize noise with fixed seed for consistent map
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  initNoise('merchant-kingdom-map');
  
  // Update canvas size on resize
  const updateSize = () => {
    if (canvasRef.value) {
      const container = canvasRef.value.parentElement;
      if (container) {
        canvasWidth.value = container.clientWidth;
        canvasHeight.value = container.clientHeight;
        // Use requestAnimationFrame to debounce
        requestAnimationFrame(() => {
          drawMap();
        });
      }
    }
  };
  
  // Use ResizeObserver for better performance
  if (canvasRef.value?.parentElement) {
    resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvasRef.value.parentElement);
  }
  
  // Initial draw
  updateSize();
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

function drawMap() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // Generate continent using Perlin noise
  const scale = 0.03; // Controls continent size
  const threshold = 0.15; // Controls land/sea threshold

  // Create pixelated effect by using larger pixels
  const pixelSize = 2;
  const cols = Math.floor(width / pixelSize);
  const rows = Math.floor(height / pixelSize);

  // Generate heightmap
  const heightmap: number[][] = [];
  for (let y = 0; y < rows; y++) {
    heightmap[y] = [];
    for (let x = 0; x < cols; x++) {
      // Use FBM for more natural terrain
      const noiseValue = fbm(x * scale, y * scale, 4);
      heightmap[y][x] = noiseValue;
    }
  }

  // Draw continent with pixel art style
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const value = heightmap[y][x];
      
      // Determine if it's land or sea
      if (value > threshold) {
        // Land - use brown/green colors based on height
        const height = (value - threshold) / (1 - threshold);
        
        // Color based on height (darker = lower, lighter = higher)
        let r, g, b;
        if (height < 0.3) {
          // Lowlands - darker brown/green
          r = 60 + height * 20;
          g = 50 + height * 15;
          b = 40 + height * 10;
        } else if (height < 0.6) {
          // Midlands - medium brown
          r = 80 + (height - 0.3) * 30;
          g = 65 + (height - 0.3) * 25;
          b = 50 + (height - 0.3) * 20;
        } else {
          // Highlands - lighter brown/beige
          r = 110 + (height - 0.6) * 20;
          g = 90 + (height - 0.6) * 15;
          b = 70 + (height - 0.6) * 10;
        }

        ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      } else {
        // Sea - dark blue
        const depth = value / threshold;
        const blue = 20 + depth * 15;
        ctx.fillStyle = `rgb(10, 15, ${Math.floor(blue)})`;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }

  // Add some coastline detail with darker pixels
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      const value = heightmap[y][x];
      const isLand = value > threshold;
      
      // Check neighbors
      const neighbors = [
        heightmap[y - 1][x],
        heightmap[y + 1][x],
        heightmap[y][x - 1],
        heightmap[y][x + 1],
      ];
      const hasWaterNeighbor = neighbors.some(n => n <= threshold);
      
      // Draw coastline (darker border)
      if (isLand && hasWaterNeighbor) {
        ctx.fillStyle = 'rgb(40, 35, 30)';
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }

  // Add some texture/noise to make it more interesting
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < width * height * 0.01; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const pixel = ctx.getImageData(x, y, 1, 1);
    if (pixel.data[0] > 50) { // Only on land
      const brightness = Math.random() > 0.5 ? 10 : -10;
      ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, pixel.data[0] + brightness))}, ${Math.max(0, Math.min(255, pixel.data[1] + brightness))}, ${Math.max(0, Math.min(255, pixel.data[2] + brightness))})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  ctx.globalAlpha = 1.0;
}
</script>

<style scoped>
.continent-map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  pointer-events: none;
  z-index: 0;
}
</style>
