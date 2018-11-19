<template>
<main class="txns-layout">
    <h1>Your Support txns</h1>

    <!-- <Txns /> -->

    <div class="actions">
      <router-link v-if="$route.name !== 'txns'" tag="button" class="secondary" :to="{name: 'txns'}">See all txns</router-link>
      <router-link v-if="$route.name !== 'new-txn'" tag="button" :to="{name: 'new-txn'}">New txn</router-link>
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
