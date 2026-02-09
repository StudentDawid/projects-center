<template>
  <footer class="bg-slate-900 text-slate-300 pt-20 pb-10 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-slate-800">
        <div class="lg:col-span-4 flex flex-col gap-6">
          <div class="flex items-center gap-3">
            <div class="bg-primary p-2 rounded-lg text-white">
              <span class="material-symbols-outlined text-2xl">church</span>
            </div>
            <div class="flex flex-col">
              <h2 class="text-lg font-bold leading-tight tracking-tight text-white">Sacred Heart</h2>
              <span class="text-[10px] uppercase tracking-[0.2em] text-accent-gold font-bold">Community</span>
            </div>
          </div>
          <p class="text-sm leading-relaxed max-w-xs">
            Thank you for being part of our journey. We are a community dedicated to faith, hope, and the transformative power of love.
          </p>
          <div class="flex gap-4">
            <a class="size-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors" href="#">
              <svg class="size-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
            </a>
            <a class="size-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors" href="#">
              <svg class="size-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path></svg>
            </a>
          </div>
        </div>
        <div class="lg:col-span-3 flex flex-col gap-6">
          <h3 class="text-white font-bold text-lg">Contact Us</h3>
          <div class="flex flex-col gap-4 text-sm">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-accent-gold">location_on</span>
              <span>123 Serenity Way, <br/>Harmony City, HC 54321</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-accent-gold">call</span>
              <span>+1 (555) 123-4567</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-accent-gold">mail</span>
              <span>hello@sacredheart.org</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-accent-gold">schedule</span>
              <span>Mon - Fri: 9am - 5pm</span>
            </div>
          </div>
        </div>
        <div class="lg:col-span-5">
          <div class="w-full h-52 bg-slate-800 rounded-xl overflow-hidden relative border border-slate-700">
            <img class="w-full h-full object-cover opacity-50" alt="Map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALZBlPzNWSJ2ya2gMqr_4lsEE7JkrlpJt1joNFb4KjSsojSVMvsNEpNIpbgHMyqCpiCWX119OlvFwzi6uB3hS5qrt2zGIh73kA5aq7fC-6WVhsaCZAJv9SRQnqGuvGejcVs6tKLZbr6e4IYdYsxArEkLzPWO3eqzREngL7kNDfLe8O_fPKWwH-krJ7xVQZ8E_JJotE53hgukKY7i0Y5giNLT7-5sRk67ZPFdsWDX5cu1IExhi6saFn3j_Efccu7Uy0hZhVANgNuUNC" />
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="bg-primary text-white p-3 rounded-full animate-bounce">
                <span class="material-symbols-outlined">location_on</span>
              </div>
            </div>
            <div class="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded text-[10px] text-white">View Full Map</div>
          </div>
          <p class="mt-4 text-xs text-slate-500 italic text-center">Parking is available on the north side of the campus.</p>
        </div>
      </div>
      <div class="flex flex-col md:flex-row items-center justify-between pt-10 gap-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
        <p>© 2023 Sacred Heart Community. All rights reserved.</p>
        <div class="flex gap-8">
          <a class="hover:text-white" href="#">Privacy Policy</a>
          <a class="hover:text-white" href="#">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Footer component
</script>

<style scoped></style>
