<template>
  <v-container fluid class="py-16 py-lg-24 bg-surface" id="rules">
    <div class="mx-auto px-4 px-sm-6 px-lg-8" style="max-width: 896px;">
      <div class="d-flex flex-column" style="gap: 64px;">
        <!-- League Rules -->
        <div>
          <div class="d-flex align-center mb-6 pb-4 border-b border-opacity-100" style="border-bottom-color: #f3f4f6 !important;">
            <v-icon icon="mdi-shield-check" color="accent" size="32" class="mr-3"></v-icon>
            <h2 class="text-h5 font-weight-bold text-text-main m-0">{{ $t('rules.title_league') }}</h2>
          </div>
          
          <div class="text-text-muted">
            <ul class="d-flex flex-column pl-0 mb-0" style="list-style-type: none; gap: 16px;">
              <li class="d-flex align-start" style="gap: 12px;">
                <span class="font-weight-bold text-text-main pt-1" style="min-width: 20px;">1.</span>
                <div>
                  <strong class="text-text-main">{{ $t('rules.fair_play_title') }}</strong> {{ $t('rules.fair_play_text') }}
                </div>
              </li>

              <li class="d-flex align-start" style="gap: 12px;">
                <span class="font-weight-bold text-text-main pt-1" style="min-width: 20px;">2.</span>
                <div>
                  <strong class="text-text-main">{{ $t('rules.format_title') }}</strong> {{ $t('rules.format_text') }}
                </div>
              </li>

              <li class="d-flex align-start" style="gap: 12px;">
                <span class="font-weight-bold text-text-main pt-1" style="min-width: 20px;">3.</span>
                <div>
                  <strong class="text-text-main">{{ $t('rules.painting_title') }}</strong> {{ $t('rules.painting_text') }}
                </div>
              </li>
            </ul>

            <button class="mt-6 text-primary font-weight-bold text-body-2 hover-underline bg-transparent border-0 pa-0 cursor-pointer">
              {{ $t('rules.download_pdf') }}
            </button>
          </div>
        </div>

        <!-- Website Terms -->
        <div>
          <div class="d-flex align-center mb-6 pb-4 border-b border-opacity-100" style="border-bottom-color: #f3f4f6 !important;">
            <v-icon icon="mdi-file-document-outline" color="grey-lighten-1" size="32" class="mr-3"></v-icon>
            <h2 class="text-h5 font-weight-bold text-text-main m-0">{{ $t('rules.title_website') }}</h2>
          </div>
          
          <p class="text-text-muted mb-4" style="line-height: 1.5;">
            {{ $t('rules.website_text_1') }}
          </p>
        </div>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.hover-underline:hover {
  text-decoration: underline !important;
}
</style>
