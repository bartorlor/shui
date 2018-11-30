<template>
  <div class="txns" id="txns">

    <div class="empty" v-if="txns.length === 0">
      You don't have any txn yet.
    </div>

    <section v-else class="txns-list">
      <div v-for="txn of txns" class="txn-item">
        <!-- <a @click="id = txn._id">{{ txn.title }}</a> -->
        <router-link :to="{name: 'txn', params: { id: txn._id }}">{{ txn.symbol}}</router-link>
        <span class="date">{{ txn.stlmtDate | date }}</span>
        <span class="badge">{{ txn.action}}</span>
        <span class="badge">{{ txn.qty}}</span>
        <span class="badge">{{ txn.price}}</span>
        <span class="badge">{{ txn.amt}}</span>
        <button @click="deleteOne(txn._id)">delete</button>
      </div>
    </section>

    <!-- <Ticket v-if="id" :id="id"/> -->
  </div>
</template>

<script>
  // import RemoteData from '../mixins/RemoteData'
  import {debug, info, error} from '../utils/logging'
  // import Ticket from './Ticket.vue'
  //will get database data
  export default {
    // mixins: [
    //   RemoteData({
    //     txns: 'txns',
    //   }),
    // ],
    data(){
      return {
        txns: [],
      }
    },
    methods: {
      deleteOne(id) {
        this.$fetch(`txns/${id}`, {method: 'DELETE'}).then(response => {
          if (response.status !== 'ok') error('Failed to delete issue');
          else  this.loadData()
        })
      },
      delete2(id) {
        info('test')
      },
      async loadData() {
        try {
          this.txns = await this.$fetch('txns')
        } catch (e) {
          error(e)
        }
      },
    },
    mounted() {
      this.loadData();
    },
    watch: {
      txns(newValue, oldValue) {
        if (newValue.length > 0) {
          newValue.forEach(item => {
            if (item.symbol === 'AMZN') {
              info('amzn:', JSON.stringify(item));
            }
          })
        }
      },
    },
  }
</script>
