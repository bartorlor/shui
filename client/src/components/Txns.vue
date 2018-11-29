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
        <span class="date">{{ txn.stlmtDate | date }}</span>
        <span class="badge">{{ txn.action}}</span>
        <span class="badge">{{ txn.qty}}</span>
        <span class="badge">{{ txn.price}}</span>
        <span class="badge">{{ txn.amt}}</span>
      </div>
    </section>

    <!-- <Ticket v-if="id" :id="id"/> -->
  </div>
</template>

<script>
  import RemoteData from '../mixins/RemoteData'
  import {debug,info} from '../utils/logging'
  // import Ticket from './Ticket.vue'
  //will get database data
  export default {
    mixins: [
      RemoteData({
        txns: 'txns',
      }),
    ],
    watch: {
      txns(newValue, oldValue) {
        if(newValue.length > 0){
          newValue.forEach(item=>{
            if(item.symbol === 'AMZN'){
              info('amzn:',JSON.stringify(item));
            }
          })
        }
      },
    },
  }
</script>
