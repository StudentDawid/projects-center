<template>
  <v-footer color="#111827" class="py-12 border-t border-opacity-100" style="border-color: #1f2937 !important;">
    <v-container class="mx-auto px-4 px-sm-6 px-lg-8" style="max-width: 1280px;">
      <v-row class="mb-12" style="row-gap: 40px;">
        <!-- Logo and Intro -->
        <v-col cols="12" md="6" class="pr-md-10">
          <div class="d-flex align-center mb-4">
            <v-avatar color="white" rounded="circle" size="32" class="pa-1 mr-2">
              <v-img
                alt="PLW 40k Logo"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLBlbSwwAjq0GoCK8FsiPJ88qbUj8HYTqI0yuv-pIFRVUNSZVLAHJxlSYBxeszUs0t_TtkIBBnTKGrk3HJjzXuGHi1FQ70Qpf3zAHCXSbR-yky2gzFxQXcsQ3HfO0flKgBTQj-y5zm8ClvkLOQxd9IlYA73fav43ROqgnNrffKvFY8Xl9se47gr68ahLJQGWqd5gfCM3dNyHaHWkTsMnrz_M0LXDfLQff6o-f5d_GeaQWXo7LmDw2BY2CBPFD4dmwGp2YEs87aihQ"
                contain
              ></v-img>
            </v-avatar>
          </div>
          
          <p class="text-body-2 text-grey-lighten-1 mb-6" style="max-width: 400px; line-height: 1.5;">
            {{ $t('footer.description') }}
          </p>

          <div class="d-flex" style="gap: 16px;">
            <a href="#" class="d-flex align-center justify-center rounded transition-colors social-link" style="width: 40px; height: 40px; background-color: #1f2937; color: #9ca3af; text-decoration: none;">
              <svg aria-hidden="true" style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 24 24">
                <path clip-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fill-rule="evenodd"></path>
              </svg>
            </a>
            <a href="#" class="d-flex align-center justify-center rounded transition-colors social-link" style="width: 40px; height: 40px; background-color: #1f2937; color: #9ca3af; text-decoration: none;">
              <svg aria-hidden="true" style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
          </div>
        </v-col>

        <!-- Links 1 -->
        <v-col cols="12" sm="6" md="3">
          <h3 class="text-white font-weight-bold text-caption text-uppercase mb-4" style="letter-spacing: 0.05em;">{{ $t('footer.league') }}</h3>
          <ul class="d-flex flex-column pl-0 mb-0" style="list-style-type: none; gap: 12px;">
            <li><a href="#about" class="text-body-2 text-grey-lighten-1 text-decoration-none transition-colors hover-text-primary">{{ $t('nav.about') }}</a></li>
            <li><a href="#events" class="text-body-2 text-grey-lighten-1 text-decoration-none transition-colors hover-text-primary">{{ $t('nav.events') }}</a></li>
            <li><a href="#rules" class="text-body-2 text-grey-lighten-1 text-decoration-none transition-colors hover-text-primary">{{ $t('nav.rules') }}</a></li>
            <li><a href="#" class="text-body-2 text-grey-lighten-1 text-decoration-none transition-colors hover-text-primary">{{ $t('footer.contact') }}</a></li>
          </ul>
        </v-col>

        <!-- Contact info -->
        <v-col cols="12" sm="6" md="3">
          <h3 class="text-white font-weight-bold text-caption text-uppercase mb-4" style="letter-spacing: 0.05em;">{{ $t('footer.contact') }}</h3>
          <ul class="d-flex flex-column pl-0 mb-0" style="list-style-type: none; gap: 12px;">
            <li class="d-flex align-center" style="gap: 8px;">
              <v-icon icon="mdi-email" size="18" class="text-grey-lighten-1"></v-icon>
              <a href="mailto:kontakt@plw40k.pl" class="text-body-2 text-decoration-none transition-colors hover-text-primary text-grey-lighten-1">kontakt@plw40k.pl</a>
            </li>
            <li class="d-flex align-center" style="gap: 8px;">
              <v-icon icon="mdi-map-marker" size="18" class="text-grey-lighten-1"></v-icon>
              <span class="text-body-2 text-grey-lighten-1">{{ $t('footer.poland') }}</span>
            </li>
          </ul>
        </v-col>
      </v-row>

      <!-- Bottom Bar -->
      <div class="pt-8 border-t border-opacity-100 d-flex flex-column flex-md-row justify-space-between align-center" style="gap: 16px; border-color: #1f2937 !important;">
        <p class="text-body-2 text-grey-lighten-1 mb-0 text-center text-md-left">
          {{ $t('footer.rights') }}
        </p>
        <p class="text-caption text-grey-darken-1 mb-0 text-center text-md-left">
          {{ $t('footer.disclaimer') }}
        </p>
      </div>
    </v-container>
  </v-footer>
</template>

<style scoped>
.transition-colors {
  transition: color 0.3s ease, background-color 0.3s ease;
}
.social-link:hover {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}
.hover-text-primary:hover {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
