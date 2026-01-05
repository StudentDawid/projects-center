<template>
  <div class="hub-page">
    <!-- Animated Background -->
    <div class="hub-background">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <!-- Header -->
    <header class="hub-header">
      <div class="logo-container">
        <v-icon icon="mdi-folder-star" size="32" class="logo-icon" />
        <span class="logo-text">Projects Center</span>
      </div>
      <nav class="hub-nav">
        <a href="https://github.com/dawidkozak" target="_blank" rel="noopener" class="nav-link">
          <v-icon icon="mdi-github" size="24" />
        </a>
      </nav>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-line">Moje</span>
          <span class="title-line title-accent">Projekty</span>
        </h1>
        <p class="hero-subtitle">
          Kolekcja eksperymentów, gier i pomysłów w jednym miejscu
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-value">{{ projects.length }}</span>
            <span class="stat-label">Projektów</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ activeProjects }}</span>
            <span class="stat-label">Aktywnych</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects Grid -->
    <section class="projects-section">
      <div class="section-header">
        <h2 class="section-title">
          <v-icon icon="mdi-view-grid" class="mr-3" />
          Przeglądaj projekty
        </h2>
      </div>

      <div class="projects-grid">
        <NuxtLink
          v-for="project in projects"
          :key="project.id"
          :to="project.link"
          class="project-card"
          :class="{ 'project-card--featured': project.featured }"
        >
          <div class="card-glow"></div>
          <div class="card-content">
            <div class="card-icon-wrapper">
              <v-icon :icon="project.icon" size="48" :color="project.color" />
            </div>
            <div class="card-info">
              <span class="card-category">{{ project.category }}</span>
              <h3 class="card-title">{{ project.title }}</h3>
              <p class="card-description">{{ project.description }}</p>
            </div>
            <div class="card-tags">
              <span v-for="tag in project.tags" :key="tag" class="card-tag">
                {{ tag }}
              </span>
            </div>
            <div class="card-footer">
              <span class="card-status" :class="`status--${project.status}`">
                <span class="status-dot"></span>
                {{ getStatusLabel(project.status) }}
              </span>
              <v-icon icon="mdi-arrow-right" class="card-arrow" />
            </div>
          </div>
        </NuxtLink>

        <!-- Coming Soon Card -->
        <div class="project-card project-card--placeholder">
          <div class="card-content">
            <div class="card-icon-wrapper">
              <v-icon icon="mdi-plus-circle-outline" size="48" color="grey" />
            </div>
            <div class="card-info">
              <h3 class="card-title text-grey">Wkrótce więcej...</h3>
              <p class="card-description text-grey-darken-1">
                Nowe projekty już w drodze
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="hub-footer">
      <p>© {{ new Date().getFullYear() }} Projects Center • Zbudowane z ❤️ używając Nuxt.js</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  link: string;
  tags: string[];
  status: 'active' | 'development' | 'planned';
  featured?: boolean;
}

const projects: Project[] = [
  {
    id: 'solmar-sanctuary',
    title: 'Sanktuarium Solmara',
    description: 'Gra typu Premium Idle w mrocznym klimacie Religious Grimdark. Buduj sanktuarium, zbieraj wiarę i walcz z demonami.',
    category: 'Gra IDLE',
    icon: 'mdi-church',
    color: '#c5a059',
    link: '/solmar-sanctuary',
    tags: ['Vue.js', 'Pinia', 'Idle Game'],
    status: 'active',
    featured: true,
  },
];

const activeProjects = computed(() =>
  projects.filter(p => p.status === 'active').length
);

function getStatusLabel(status: Project['status']): string {
  const labels: Record<Project['status'], string> = {
    active: 'Aktywny',
    development: 'W rozwoju',
    planned: 'Planowany',
  };
  return labels[status];
}

// Page meta
useHead({
  title: 'Projects Center - Moje Projekty',
  meta: [
    { name: 'description', content: 'Centrum projektów - kolekcja gier, eksperymentów i pomysłów' },
  ],
});
</script>

<style scoped lang="scss">
// ============================================
// Variables
// ============================================
$primary-accent: #8b5cf6;
$secondary-accent: #06b6d4;
$gold-accent: #c5a059;
$bg-dark: #0a0a0f;
$bg-card: rgba(20, 20, 30, 0.8);
$text-primary: #f0f0f5;
$text-secondary: #9090a0;

// ============================================
// Hub Page Layout
// ============================================
.hub-page {
  min-height: 100vh;
  background: $bg-dark;
  color: $text-primary;
  position: relative;
  overflow-x: hidden;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

// ============================================
// Animated Background
// ============================================
.hub-background {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, $primary-accent 0%, transparent 70%);
  top: -200px;
  right: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, $secondary-accent 0%, transparent 70%);
  bottom: -100px;
  left: -50px;
  animation-delay: -7s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, $gold-accent 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
  opacity: 0.2;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.05);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.95);
  }
}

// ============================================
// Header
// ============================================
.hub-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 3rem;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  color: $primary-accent;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, $text-primary 0%, $text-secondary 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hub-nav {
  display: flex;
  gap: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: $text-secondary;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: $text-primary;
    border-color: $primary-accent;
    transform: translateY(-2px);
  }
}

// ============================================
// Hero Section
// ============================================
.hero-section {
  position: relative;
  z-index: 1;
  padding: 4rem 3rem 6rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem 4rem;
  }
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: clamp(3rem, 10vw, 6rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 1.5rem;
}

.title-line {
  display: block;
}

.title-accent {
  background: linear-gradient(135deg, $primary-accent 0%, $secondary-accent 50%, $gold-accent 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: $text-secondary;
  max-width: 500px;
  margin: 0 auto 3rem;
  line-height: 1.6;
}

.hero-stats {
  display: inline-flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem 2rem;
  background: $bg-card;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: $primary-accent;
}

.stat-label {
  font-size: 0.875rem;
  color: $text-secondary;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
}

// ============================================
// Projects Section
// ============================================
.projects-section {
  position: relative;
  z-index: 1;
  padding: 0 3rem 4rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0 1.5rem 3rem;
  }
}

.section-header {
  margin-bottom: 2rem;
}

.section-title {
  display: inline-flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: $text-primary;
}

// ============================================
// Projects Grid
// ============================================
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
}

// ============================================
// Project Card
// ============================================
.project-card {
  position: relative;
  background: $bg-card;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-8px);
    border-color: rgba($primary-accent, 0.5);

    .card-glow {
      opacity: 1;
    }

    .card-arrow {
      transform: translateX(4px);
      opacity: 1;
    }

    .card-icon-wrapper {
      transform: scale(1.1) rotate(-5deg);
    }
  }

  &--featured {
    border-color: rgba($gold-accent, 0.3);

    &::before {
      content: '⭐ Wyróżniony';
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.25rem 0.75rem;
      background: rgba($gold-accent, 0.2);
      color: $gold-accent;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 20px;
      z-index: 2;
    }
  }

  &--placeholder {
    border-style: dashed;
    cursor: default;

    &:hover {
      transform: none;
      border-color: rgba(255, 255, 255, 0.08);
    }

    .card-content {
      opacity: 0.5;
    }
  }
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba($primary-accent, 0.15),
    transparent 40%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.card-content {
  position: relative;
  z-index: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 280px;
}

.card-icon-wrapper {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  transition: transform 0.4s ease;
}

.card-info {
  flex: 1;
}

.card-category {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  color: $primary-accent;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  line-height: 1.3;
}

.card-description {
  font-size: 0.9375rem;
  color: $text-secondary;
  line-height: 1.6;
  margin: 0;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card-tag {
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  font-size: 0.75rem;
  color: $text-secondary;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.card-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: $text-secondary;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.status--active {
  color: #22c55e;

  .status-dot {
    animation: pulse-dot 2s ease-in-out infinite;
  }
}

.status--development {
  color: #f59e0b;
}

.status--planned {
  color: $text-secondary;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.card-arrow {
  color: $text-secondary;
  opacity: 0;
  transition: all 0.3s ease;
}

// ============================================
// Footer
// ============================================
.hub-footer {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 2rem;
  color: $text-secondary;
  font-size: 0.875rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
</style>
