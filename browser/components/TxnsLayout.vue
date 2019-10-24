<template>
<main class="txns-layout">
    <h1>Current Portfolio :{{$state.user.curAccountName}}</h1>

    <!-- <Txns /> -->

    <div class="actions">
      <router-link v-if="$route.name !== 'txns'" tag="button" class="secondary" :to="{name: 'txns'}">See all txns</router-link>
      <router-link v-if="$route.name === 'txns'" tag="button" :to="{name: 'import-txns'}">Import</router-link>
      <router-link v-if="$route.name === 'txns'" tag="button" :to="{name: 'report'}">Report</router-link>
    </div>

    <router-view />
  </main>
</template>

<!-- <script>
import Txns from './Txns.vue'

export default {
  components: {
    Txns,
  }
}
</script> -->

<style lang="stylus" scoped>
.actions {
  margin-bottom: 32px;
}
</style>
