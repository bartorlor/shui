<template>
  <div class="records" id="records">
    <router-link tag="button" :to="{name: 'txns'}" class="secondary">
      Go back
    </router-link>
    <div class="empty" v-if="records.length === 0">
      You don't have any record yet.
    </div>

    <section v-else class="records-list">
      <h3> Capital Gains (or Losses) for Year Ended 2016-Dec-31</h3>
      <h6> Portfolio: joint636268</h6>
      <div v-for="record of records" class="record-item">
        <div>
          <span class="badge">{{ record.symbol}}</span>
        </div>
        <div v-for="txn of record.txns" class="record-item">
          <span class="date">{{ txn.stlmtDate | date }}</span>
          <span class="badge">{{ txn.action}}</span>
          <span class="badge">{{ txn.qty}}</span>
          <span class="badge">{{ txn.price}}</span>
          <span class="badge">{{ txn.amt}}</span>
          <span class="badge">{{ txn.qty}}</span>
          <span class="badge">{{ txn.changedAcb}}</span>
          <span class="badge">{{ txn.newAcb}}</span>
          <span class="badge">{{ txn.newPrc}}</span>
          <span class="badge">{{ txn.remainQty}}</span>
          <span class="badge">{{ txn.gain}}</span>
        </div>
        <div>
          <span class="badge">{{ record.result.accountId}}</span>
          <span class="badge">{{ record.result.year}}</span>
          <span class="badge">{{ record.result.newAcb}}</span>
          <span class="badge">{{ record.result.acb}}</span>
          <span class="badge">{{ record.result.qty}}</span>
          <!--<span class="badge">{{ accounting.formatMoney(record.result.gain)}}</span>-->
        </div>
        <button @click="download(record._id)">download</button>
      </div>
    </section>

  </div>
</template>

<script>
  import {debug, info, error} from '../utils/logging'
  // import * as accounting from './../utils/accounting.js'

  export default {
    data() {
      return {
        records: [
          {
            symbol: 'vips',
            txns: [
              {
                qty: 100,
                symbol: 'fake vips',
                stlmtDate: '02/14/2016',
                years: '2015,2016',
                disposition: 1548.95,
                acb: 1435.01,
                expense: 1.00,
                gain: 22.93,
              },
            ],
            result: {
              acb: 0,
              qty: 1,
              gain: 100,
            }

          }
        ],
      }
    },
    methods: {
      download(id) {
        this.$fetch(`records/${id}`, {method: 'DELETE'}).then(response => {
          if (response.status !== 'ok') error('Failed to delete issue');
          else this.loadData()
        })
      },
      async loadData() {
        try {
          this.records = await this.$fetch('report')
        } catch (e) {
          error(e)
        }
      },
    },
    mounted() {
      this.loadData();
    },
    watch: {
      records(newValue, oldValue) {
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
