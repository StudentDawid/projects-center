<template>
  <v-container fluid>
    <!-- Hero Section -->
    <v-row class="hero-section" align="center" justify="center">
      <v-col cols="12" md="8" class="text-center">
        <h1 class="text-h2 font-weight-bold mb-4">
          Welcome to Religion Community
        </h1>
        <p class="text-h5 mb-6">
          A place to connect, share, and grow together in faith
        </p>
        <v-btn
          color="primary"
          size="x-large"
          class="mr-4"
        >
          Get Started
        </v-btn>
        <v-btn
          variant="outlined"
          size="x-large"
        >
          Learn More
        </v-btn>
      </v-col>
    </v-row>

    <!-- Features Section -->
    <v-row class="my-12">
      <v-col cols="12" class="text-center mb-8">
        <h2 class="text-h3 font-weight-bold">Our Features</h2>
      </v-col>

      <v-col
        v-for="(feature, index) in features"
        :key="index"
        cols="12"
        md="4"
      >
        <v-card class="pa-6 h-100" hover>
          <v-icon
            :icon="feature.icon"
            size="64"
            color="primary"
            class="mb-4"
          />
          <h3 class="text-h5 mb-3">{{ feature.title }}</h3>
          <p class="text-body-1">{{ feature.description }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Call to Action -->
    <v-row class="cta-section my-12" justify="center">
      <v-col cols="12" md="8" class="text-center">
        <v-card class="pa-8" color="primary">
          <h2 class="text-h4 font-weight-bold mb-4 text-white">
            Join Our Community Today
          </h2>
          <p class="text-h6 mb-6 text-white">
            Be part of something greater. Connect with others who share your values.
          </p>
          <v-btn
            size="large"
            color="white"
            variant="flat"
          >
            Sign Up Now
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const features = [
  {
    icon: 'mdi-account-group',
    title: 'Community',
    description: 'Connect with like-minded individuals and build lasting relationships in a supportive environment.',
  },
  {
    icon: 'mdi-book-open-variant',
    title: 'Resources',
    description: 'Access a wealth of spiritual resources, study materials, and guidance for your faith journey.',
  },
  {
    icon: 'mdi-calendar-star',
    title: 'Events',
    description: 'Participate in meaningful events, gatherings, and activities that strengthen our community.',
  },
];
</script>

<style scoped lang="scss">
.hero-section {
  min-height: 60vh;
  padding: 4rem 0;
}

.cta-section {
  padding: 2rem 0;
}
</style>
