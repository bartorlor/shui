<template>
  <div class="txns" id="txns">

    <div class="empty" v-if="txns.length === 0">
      You don't have any txn yet.
    </div>

    <!--<section v-else class="txns-list">-->
      <!--<div v-for="txn of txns" class="txn-item">-->
        <!--<router-link :to="{name: 'txn', params: { id: txn._id }}">{{ txn.symbol}}</router-link>-->
        <!--<span class="date">{{ txn.stlmtDate | date }}</span>-->
        <!--<span class="badge">{{ txn.action}}</span>-->
        <!--<span class="badge">{{ txn.qty}}</span>-->
        <!--<span class="badge">{{ txn.price}}</span>-->
        <!--<span class="badge">{{ txn.amt}}</span>-->
        <!--<button @click="deleteOne(txn._id)">delete</button>-->
      <!--</div>-->
    <!--</section>-->

    <section v-else class="txns-list">
      <div class="table-line-header flex-container">
        <label class="cell cell2">Symbol</label>
        <label class="cell cell2">Date</label>
        <label class="cell cell2 ">Action</label>
        <label class="cell cell2 ">Quantity</label>
        <label class="cell cell2 ">Price</label>
        <label class="cell cell2 ">Amount</label>
        <label class="cell cell2 ">Actions</label>
      </div>
      <div class="table-line flex-container"
           v-for="(row, index) in txns" :key="index">
      <!--<div v-for="txn of txns" class="txn-item">-->
        <!--<router-link :to="{name: 'txn', params: { id: txn._id }}">{{ txn.symbol}}</router-link>-->
        <!--<span class="date">{{ txn.stlmtDate | date }}</span>-->
        <!--<span class="badge">{{ txn.action}}</span>-->
        <!--<span class="badge">{{ txn.qty}}</span>-->
        <!--<span class="badge">{{ txn.price}}</span>-->
        <!--<span class="badge">{{ txn.amt}}</span>-->
        <!--<button @click="deleteOne(txn._id)">delete</button>-->
      <!--</div>-->
        <span class="cell cell2">{{ row.symbol}}</span>
        <span class="cell cell2">{{ row.stlmtDate}}</span>
        <span class="cell cell2">{{ row.action }}</span>
        <span class="cell cell2">{{ row.qty }}</span>
        <span class="cell cell2">{{ row.price }}</span>
        <span class="cell cell2">{{ row.amt }}</span>
        <button class="cell cell2" @click="deleteOne(row._id)">delete</button>

        <!--&lt;!&ndash;<input class="cell cell-long" v-else v-model="row.name"/>&ndash;&gt;-->

        <!--&lt;!&ndash;<span v-if="editIndex !== index" class="cell cell2" @click="edit(row,index)"><i class="material-icons">edit</i></span>&ndash;&gt;-->
        <!--&lt;!&ndash;<span v-if="editIndex === index" class="cell cell2 ">&ndash;&gt;-->
                <!--&lt;!&ndash;<i @click="cancel(row)" class="material-icons">undo</i>&ndash;&gt;-->
                <!--&lt;!&ndash;<i @click="save(row)" class="material-icons">save</i>&ndash;&gt;-->
              <!--&lt;!&ndash;</span>&ndash;&gt;-->

        <!--&lt;!&ndash;<span v-if="editIndex !== index" class="cell cell2 " @click="select(row)">&ndash;&gt;-->
        <!--&lt;!&ndash;<i v-if="row.selected" class="material-icons">radio_button_checked</i>&ndash;&gt;-->
        <!--&lt;!&ndash;<i v-else class="material-icons">radio_button_unchecked</i>&ndash;&gt;-->
      <!--</span>-->
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
          const query = {};
          // query.year = 2016;
          query.accountId = this.$state.user.curAccountId;
          const search = Object.keys(query).map(k => `${k}=${query[k]}`).join('&');
          // return fetch(`${urlBase || ''}/api/issues?${search}`)
          this.txns = await this.$fetch(`txns?${search}`);
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
