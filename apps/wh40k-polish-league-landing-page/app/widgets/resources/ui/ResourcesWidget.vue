<template>
  <v-container fluid class="py-16 py-lg-24 bg-background border-t border-opacity-100" style="border-color: #f3f4f6 !important;" id="resources">
    <div class="mx-auto px-4 px-sm-6 px-lg-8" style="max-width: 1280px;">
      <div class="text-center mb-16">
        <h2 class="text-h4 font-weight-black text-text-main mb-4" style="letter-spacing: -0.025em;">{{ $t('resources.title') }}</h2>
        <p class="text-h6 font-weight-light text-text-muted mx-auto" style="max-width: 672px; line-height: 1.5;">
          {{ $t('resources.subtitle') }}
        </p>
      </div>

      <v-row>
        <!-- BCP -->
        <v-col cols="12" sm="6" lg="3">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              href="#"
              class="pa-6 d-flex flex-column h-100 transition-swing bg-surface border-opacity-100"
              style="border-radius: 12px; border-color: #f3f4f6 !important;"
              :elevation="isHovering ? 4 : 1"
              :style="{ transform: isHovering ? 'translateY(-4px)' : 'none' }"
              border
            >
              <div class="mb-4">
                <v-avatar
                  :color="isHovering ? 'primary' : 'red-lighten-5'"
                  rounded="lg"
                  size="48"
                  class="transition-colors"
                  style="border-radius: 8px !important;"
                >
                  <v-icon
                    icon="mdi-poll"
                    :color="isHovering ? 'white' : 'primary'"
                    size="24"
                    class="transition-colors"
                  ></v-icon>
                </v-avatar>
              </div>
              <div class="mb-4">
                <h3 class="font-weight-bold text-text-main mb-1 text-subtitle-1">Best Coast Pairings</h3>
                <p class="text-body-2 text-text-muted" style="line-height: 1.25rem;">{{ $t('resources.bcp_desc') }}</p>
              </div>
              <div class="mt-auto d-flex justify-end pt-4">
                <v-icon
                  icon="mdi-arrow-top-right"
                  :color="isHovering ? 'primary' : 'grey-lighten-1'"
                  class="transition-colors"
                ></v-icon>
              </div>
            </v-card>
          </v-hover>
        </v-col>

        <!-- Discord -->
        <v-col cols="12" sm="6" lg="3">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              href="#"
              class="pa-6 d-flex flex-column h-100 transition-swing bg-surface border-opacity-100"
              style="border-radius: 12px; border-color: #f3f4f6 !important;"
              :elevation="isHovering ? 4 : 1"
              :style="{ transform: isHovering ? 'translateY(-4px)' : 'none' }"
              border
            >
              <div class="mb-4">
                <v-avatar
                  :color="isHovering ? 'accent' : 'yellow-lighten-5'"
                  rounded="lg"
                  size="48"
                  class="transition-colors"
                  style="border-radius: 8px !important;"
                >
                  <v-icon
                    icon="mdi-forum"
                    :color="isHovering ? 'white' : 'accent'"
                    size="24"
                    class="transition-colors"
                  ></v-icon>
                </v-avatar>
              </div>
              <div class="mb-4">
                <h3 class="font-weight-bold text-text-main mb-1 text-subtitle-1">Discord</h3>
                <p class="text-body-2 text-text-muted" style="line-height: 1.25rem;">{{ $t('resources.discord_desc') }}</p>
              </div>
              <div class="mt-auto d-flex justify-end pt-4">
                <v-icon
                  icon="mdi-arrow-top-right"
                  :color="isHovering ? 'accent' : 'grey-lighten-1'"
                  class="transition-colors"
                ></v-icon>
              </div>
            </v-card>
          </v-hover>
        </v-col>

        <!-- Facebook -->
        <v-col cols="12" sm="6" lg="3">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              href="#"
              class="pa-6 d-flex flex-column h-100 transition-swing bg-surface border-opacity-100"
              style="border-radius: 12px; border-color: #f3f4f6 !important;"
              :elevation="isHovering ? 4 : 1"
              :style="{ transform: isHovering ? 'translateY(-4px)' : 'none' }"
              border
            >
              <div class="mb-4">
                <v-avatar
                  :color="isHovering ? 'primary' : 'red-lighten-5'"
                  rounded="lg"
                  size="48"
                  class="transition-colors"
                  style="border-radius: 8px !important;"
                >
                  <v-icon
                    icon="mdi-earth"
                    :color="isHovering ? 'white' : 'primary'"
                    size="24"
                    class="transition-colors"
                  ></v-icon>
                </v-avatar>
              </div>
              <div class="mb-4">
                <h3 class="font-weight-bold text-text-main mb-1 text-subtitle-1">Facebook Group</h3>
                <p class="text-body-2 text-text-muted" style="line-height: 1.25rem;">{{ $t('resources.fb_desc') }}</p>
              </div>
              <div class="mt-auto d-flex justify-end pt-4">
                <v-icon
                  icon="mdi-arrow-top-right"
                  :color="isHovering ? 'primary' : 'grey-lighten-1'"
                  class="transition-colors"
                ></v-icon>
              </div>
            </v-card>
          </v-hover>
        </v-col>

        <!-- TK -->
        <v-col cols="12" sm="6" lg="3">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              href="#"
              class="pa-6 d-flex flex-column h-100 transition-swing bg-surface border-opacity-100"
              style="border-radius: 12px; border-color: #f3f4f6 !important;"
              :elevation="isHovering ? 4 : 1"
              :style="{ transform: isHovering ? 'translateY(-4px)' : 'none' }"
              border
            >
              <div class="mb-4">
                <v-avatar
                  :color="isHovering ? 'grey-darken-3' : 'grey-lighten-4'"
                  rounded="lg"
                  size="48"
                  class="transition-colors"
                  style="border-radius: 8px !important;"
                >
                  <v-icon
                    icon="mdi-gavel"
                    :color="isHovering ? 'white' : 'grey-darken-1'"
                    size="24"
                    class="transition-colors"
                  ></v-icon>
                </v-avatar>
              </div>
              <div class="mb-4">
                <h3 class="font-weight-bold text-text-main mb-1 text-subtitle-1">TourneyKeeper</h3>
                <p class="text-body-2 text-text-muted" style="line-height: 1.25rem;">{{ $t('resources.tk_desc') }}</p>
              </div>
              <div class="mt-auto d-flex justify-end pt-4">
                <v-icon
                  icon="mdi-arrow-top-right"
                  :color="isHovering ? 'grey-darken-3' : 'grey-lighten-1'"
                  class="transition-colors"
                ></v-icon>
              </div>
            </v-card>
          </v-hover>
        </v-col>

      </v-row>
    </div>
  </v-container>
</template>

<style scoped>
.transition-swing {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.transition-colors {
  transition: color 0.3s ease, background-color 0.3s ease;
}
</style>
