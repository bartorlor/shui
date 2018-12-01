<template>
<main class="report-layout">
    <h1>Report</h1>

    <div class="actions">
      <router-link v-if="$route.name !== 'report'" tag="button" class="secondary" :to="{name: 'report'}">See all report</router-link>
      <router-link v-if="$route.name !== 'new-account'" tag="button" :to="{name: 'new-account'}">New account</router-link>
    </div>

    <router-view />
  </main>
</template>


<style lang="stylus" scoped>
.actions {
  margin-bottom: 32px;
}
</style>
