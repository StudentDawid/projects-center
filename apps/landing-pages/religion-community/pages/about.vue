<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-16 bg-white dark:bg-slate-900 overflow-hidden border-b border-slate-100 dark:border-slate-800">
      <div class="absolute inset-0 opacity-5 pointer-events-none">
        <div class="absolute top-0 right-0 w-96 h-96 bg-accent-gold rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl -ml-48 -mb-48"></div>
      </div>
      <div class="max-w-7xl mx-auto px-6 relative z-10">
        <div class="w-12 h-1 bg-accent-gold mb-4"></div>
        <h1 class="text-4xl md:text-5xl font-black mb-4">About Sacred Heart Community</h1>
        <p class="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
          Discover our story, mission, and the values that guide our faith community in service to all.
        </p>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-20 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- History Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <h2 class="text-3xl font-black mb-6 flex items-center gap-3">
              <span class="w-8 h-1 bg-primary rounded-full"></span>
              Our Story
            </h2>
            <div class="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-4 leading-relaxed">
              <p>
                Sacred Heart Community was founded in 1974 with a simple vision: to create a place where people of all backgrounds could come together to deepen their faith, support one another, and make a meaningful difference in our world.
              </p>
              <p>
                What started as a small gathering of faith seekers in a modest chapel has grown into a vibrant community of thousands. Through decades of growth and change, we've remained committed to our core values of inclusivity, compassion, and spiritual growth.
              </p>
              <p>
                Today, we continue to fulfill that original vision by providing welcoming spaces for worship, meaningful programs for all ages, and active community service initiatives that reflect our commitment to justice and love.
              </p>
            </div>
          </div>
          <div class="relative">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuALZBlPzNWSJ2ya2gMqr_4lsEE7JkrlpJt1joNFb4KjSsojSVMvsNEpNIpbgHMyqCpiCWX119OlvFwzi6uB3hS5qrt2zGIh73kA5aq7fC-6WVhsaCZAJv9SRQnqGuvGejcVs6tKLZbr6e4IYdYsxArEkLzPWO3eqzREngL7kNDfLe8O_fPKWwH-krJ7xVQZ8E_JJotE53hgukKY7i0Y5giNLT7-5sRk67ZPFdsWDX5cu1IExhi6saFn3j_Efccu7Uy0hZhVANgNuUNC"
              alt="Church sanctuary"
              class="rounded-2xl shadow-lg"
            />
            <div class="absolute -bottom-6 -right-6 w-40 h-40 bg-accent-gold/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        <!-- Mission & Values -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <span class="material-symbols-outlined text-4xl text-primary">favorite</span>
            </div>
            <h3 class="text-xl font-bold mb-4">Our Mission</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              To be a beacon of faith, hope, and love—creating a welcoming community where individuals can grow spiritually, support one another, and serve the world with compassion and purpose.
            </p>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <span class="material-symbols-outlined text-4xl text-primary">diversity_1</span>
            </div>
            <h3 class="text-xl font-bold mb-4">Our Values</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              Inclusivity, compassion, integrity, spiritual growth, and service to others. We believe in the transformative power of faith and community.
            </p>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <span class="material-symbols-outlined text-4xl text-primary">public</span>
            </div>
            <h3 class="text-xl font-bold mb-4">Our Impact</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              Through community outreach, education, counseling, and spiritual guidance, we touch thousands of lives each year, building a more just and compassionate world.
            </p>
          </div>
        </div>

        <!-- Community Facts -->
        <div class="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-12 text-white mb-20">
          <h2 class="text-3xl font-black mb-12">By The Numbers</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="text-center">
              <div class="text-5xl font-black mb-2">50+</div>
              <p class="text-white/80">Years of Service</p>
            </div>
            <div class="text-center">
              <div class="text-5xl font-black mb-2">5K+</div>
              <p class="text-white/80">Active Members</p>
            </div>
            <div class="text-center">
              <div class="text-5xl font-black mb-2">12</div>
              <p class="text-white/80">Ministry Programs</p>
            </div>
            <div class="text-center">
              <div class="text-5xl font-black mb-2">1000+</div>
              <p class="text-white/80">Served Annually</p>
            </div>
          </div>
        </div>

        <!-- Leadership Section -->
        <div class="mb-20">
          <h2 class="text-3xl font-black mb-12 flex items-center gap-3">
            <span class="w-8 h-1 bg-primary rounded-full"></span>
            Our Leadership
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div class="h-64 bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                <span class="material-symbols-outlined text-8xl text-white/50">person</span>
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold mb-2">Rev. James Mitchell</h3>
                <p class="text-accent-gold font-semibold mb-3">Senior Pastor</p>
                <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Ordained minister with 25 years of pastoral experience, dedicated to spiritual growth and community service.
                </p>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div class="h-64 bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                <span class="material-symbols-outlined text-8xl text-white/50">person</span>
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold mb-2">Sarah Chen</h3>
                <p class="text-accent-gold font-semibold mb-3">Associate Pastor</p>
                <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Passionate about youth ministry and community outreach with expertise in multicultural spiritual formation.
                </p>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div class="h-64 bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                <span class="material-symbols-outlined text-8xl text-white/50">person</span>
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold mb-2">Michael Johnson</h3>
                <p class="text-accent-gold font-semibold mb-3">Director of Ministries</p>
                <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Oversees all programs and ministries with a focus on inclusive spiritual development for all ages.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="bg-serene-beige dark:bg-slate-800/50 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <h2 class="text-3xl font-bold mb-4">Join Our Community</h2>
          <p class="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 text-lg">
            Whether you're looking to deepen your spiritual journey, find community, or make a difference, there's a place for you here.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink 
              to="/calendar"
              class="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined">event</span>
              View Our Events
            </NuxtLink>
            <button class="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-all inline-flex items-center justify-center gap-2">
              <span class="material-symbols-outlined">mail</span>
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'About Us - Sacred Heart Community'
})
</script>
