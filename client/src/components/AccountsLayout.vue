<template>
<main class="accounts-layout">
    <!--<h1>Accounts</h1>-->
    <div class="actions">
      <router-link v-if="$route.name !== 'accounts'" tag="button" class="secondary" :to="{name: 'accounts'}">See all accounts</router-link>
      <!--<router-link v-if="$route.name !== 'new-account'" tag="button" :to="{name: 'new-account'}">New account</router-link>-->
    </div>

    <router-view />
  </main>
</template>


<style lang="stylus" scoped>
.actions {
  margin-bottom: 32px;
}
</style>
