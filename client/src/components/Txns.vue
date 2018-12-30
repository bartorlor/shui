<template>
  <div class="txns" id="txns">

    <div class="empty" v-if="txns.length === 0">
      You don't have any txn yet.
    </div>

    <section v-else class="txns-list">
      <div v-for="txn of txns" class="txn-item">
        <router-link :to="{name: 'txn', params: { id: txn._id }}">{{ txn.symbol}}</router-link>
        <span class="date">{{ txn.stlmtDate | date }}</span>
        <span class="badge">{{ txn.action}}</span>
        <span class="badge">{{ txn.qty}}</span>
        <span class="badge">{{ txn.price}}</span>
        <span class="badge">{{ txn.amt}}</span>
        <button @click="deleteOne(txn._id)">delete</button>
      </div>
    </section>

    <!--<div class="table-line-header flex-container">-->
      <!--<label class="cell cell2 header">Location</label>-->
      <!--<label class="cell cell2 header">Capacity(Free/Total)</label>-->
      <!--<label class="cell cell2 header">Recording Quota(GB)</label>-->
      <!--<label class="cell cell2 header">Enable Recording</label>-->
    <!--</div>-->
    <!--<div class="table-line flex-container"-->
         <!--v-for="disk in server.disks" : key="disk.id">-->
      <!--<span class="cell cell2">(fdisk.name);>(( (fdisk. flag)))) </span>-->
      <!--<span class="cell cell 2">f(disk. free):!// (disk. total) </span>-->
      <!--<input class="cell cell 2" type="number" placeholder="1" step="1" min="0"-->
             <!--: max="disk. total" v-model="disk.quota">-->
      <!--<div class="cell cell 1" @click="disk.enable *=true">-->
        <!--<q-checkbox v-model="disk.enable"></q-checkbox>-->
      <!--</div>-->
    <!--</div>-->


  </div>
</template>

<script>
  // import RemoteData from '../mixins/RemoteData'
  import {debug, info, error} from '../utils/logging'
  import txn from '../../../server/src/txn'

  export default {
    data() {
      return {
        txns: [],
      }
    },
    methods: {
      deleteOne(id) {
        this.$fetch(`txns/${id}`, {method: 'DELETE'}).then(response => {
          if (response.status !== 'ok') error('Failed to delete issue');
          else this.loadData()
        })
      },
      async loadData() {
        try {
          this.txns = await this.$fetch('txns');
          this.txns.forEach((item) => {
            debug(`txn : ${txn.format(item)}`);
            debug(item.stlmtDate);
          })
        } catch (e) {
          error(e)
        }
      },
    },
    mounted() {
      this.loadData()
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

<style lang="stylus" scoped>
  @import '../style/imports';
  @import '../style/table';
</style>
