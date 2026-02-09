<template>
    <div class="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <main class="flex-grow">
        <Hero />
        <Announcements>
          <AnnouncementCard :id="1" img="https://lh3.googleusercontent.com/aida-public/AB6AXuD4xT6Nw6RIx1hcOcRxySY2RZjZoVq02oJOA-MLg4xW3KDaQ8_nXwYFfKMO4B7f4wX1EQ6SUPqeVmIjXMfGWb8VUVh_VKwHaJD6eh9YEfcmX4cCLmreoos62zw3ebeTao_6gHb4VPRxy5WKXAxrUuyCrAHxqFmRAa1Y9nhEWlOhO2bhWH7G7sTfYYxkrjpEBPYsNQRJqUBNx3J8du4LGLZlEFvMkEFFBLEV6mtD9Zzx179sdUFoZkk_gFoOPwHpD7O15S6JP36Hx6nV" tag="EVENTS" date="October 15, 2023" title="Weekly Youth Service" excerpt="Join us this Friday evening for an uplifting service tailored specifically for our young adults." />
          <AnnouncementCard :id="2" img="https://lh3.googleusercontent.com/aida-public/AB6AXuD1pnFw5N0nVJZw-qeXqgqQ8219I2K9OjJvjXvKlZFPEcEnok4wjA5tdOAEhr8E4iaQFbArZFS9jp6wsKsBeYJml8PG07avWsbVjWoYg6F4kICTpC5pwpZw2taU2uoKDEvJIg19bpqqMb1eUjl-MROYGRhrvHs-QyYV7tqIS5fGueqIIPUnHMQD9b74Ptx8cSM3rODSeoExQqdgNJU2eGfOHKKGqQBDrT19oyDDJJTSEuBzoPEpWtanK5cJBwomvj46q704qFfPr3-p" tag="OUTREACH" date="October 22, 2023" title="Community Outreach" excerpt="Our monthly initiative to support local families. Volunteers are welcome to join us starting at 8 AM." />
          <AnnouncementCard :id="3" img="https://lh3.googleusercontent.com/aida-public/AB6AXuB05OLbyQKju26CN474KAUqmnn3yZpsWZ7XWrYNRC0AcNmw-g11ZmVGJU6ziOY6DGmq8SfXtCK-EKXGB6qxpB8ccFvYL58KNvQ3-I1-XUC5wOrBs1eBxPaydJfh0goPK363WGybdPEkwV3AbgrBWniaY7ax_ClG9sNSmQxSVmj-9iOmq2pG8t1ExiyAOMJWHd3fBj98a7upDAvDTIZLm-EYLYJkstHnj0uzH_YlekOM1p_M1LsV1qYIxQcn-DcztPeHHDXyVMNuOd-z" tag="SPIRITUAL" date="October 28, 2023" title="Interfaith Dialogue" excerpt="Sharing wisdom across traditions. An open forum for community members to discuss shared values." />
        </Announcements>
        <About />
      </main>
    </div>
</template>

<script setup lang="ts">
import Hero from '@features/religion-community/ui/Hero.vue'
import Announcements from '@features/religion-community/ui/Announcements.vue'
import AnnouncementCard from '@features/religion-community/ui/cards/AnnouncementCard.vue'
import About from '@features/religion-community/ui/About.vue'

// Page component
</script>

<style scoped lang="scss">
// Page styles
</style>
