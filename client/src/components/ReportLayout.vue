<template>
<main class="report-layout">
    <h1>Your Support report</h1>

    <!-- <Report /> -->

    <div class="actions">
      <router-link v-if="$route.name !== 'report'" tag="button" class="secondary" :to="{name: 'report'}">See all report</router-link>
      <router-link v-if="$route.name !== 'new-ticket'" tag="button" :to="{name: 'new-ticket'}">New ticket</router-link>
    </div>

    <router-view />
  </main>
</template>

<!-- <script>
import Report from './Report.vue'

export default {
  components: {
    Report,
  }
}
</script> -->

<style lang="stylus" scoped>
.actions {
  margin-bottom: 32px;
}
</style>
