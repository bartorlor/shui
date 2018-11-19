<template>
  <div class="txns" id="txns">
    <Loading v-if="remoteDataBusy"/>

    <div class="empty" v-else-if="txns.length === 0">
      You don't have any txn yet.
    </div>

    <section v-else class="txns-list">
      <div v-for="txn of txns" class="txn-item">
        <!-- <a @click="id = txn._id">{{ txn.title }}</a> -->
        <router-link :to="{name: 'txn', params: { id: txn._id }}">{{ txn.symbol}}</router-link>
        <span class="badge">{{ txn.action}}</span>
        <span class="date">{{ txn.stlmtDate | date }}</span>
      </div>
    </section>

    <!-- <Ticket v-if="id" :id="id"/> -->
  </div>
</template>

<script>
import RemoteData from '../mixins/RemoteData'
// import Ticket from './Ticket.vue'
//will get database data
export default {
  mixins: [
    RemoteData({
      txns: 'txns',
    }),
  ],
  // components: {
  //   Ticket,
  // },
  // data () {
  //   return {
  //     id: null,
  //   }
  // },
}
</script>
