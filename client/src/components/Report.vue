<template>
  <div class="records" id="records">
    <router-link tag="button" :to="{name: 'txns'}" class="secondary">
      Go back
    </router-link>
    <div class="empty" v-if="records.length === 0">
      You don't have any record yet.
    </div>

    <section v-else class="txns-list">
      <h3> Capital Gains (or Losses) for Year Ended 2016-Dec-31</h3>
      <h6> Portfolio: joint636268</h6>
      <div v-for="record of records" class="record-item">
        <div>
          <span class="cell cell2">{{ record.symbol}}</span>
        </div>
        <div class="table-line-header flex-container">
          <label class="cell cell2">Date</label>
          <label class="cell cell2 ">Action</label>
          <label class="cell cell2 ">Quantity</label>
          <label class="cell cell2 ">Price</label>
          <label class="cell cell2 ">Amount</label>
          <!--<section v-if=" record.result.status === 'ok'">-->
            <label class="cell cell2 ">Changed ACB</label>
            <label class="cell cell2 ">New ACB</label>
            <label class="cell cell2 ">New Price</label>
            <label class="cell cell2 ">Remain Quantity</label>
            <label class="cell cell2 ">Gain</label>
          <!--</section>-->
        </div>
        <div class="table-line flex-container" v-for="(row, index) in record.txns" :key="index">
          <span class="cell cell2">{{ row.stlmtDate }}</span>
          <span class="cell cell2">{{ row.action}}</span>
          <span class="cell cell2">{{ row.qty}}</span>
          <span class="cell cell2">{{ formatMoney(row.price)}}</span>
          <span class="cell cell2">{{ formatMoney(row.amt)}}</span>
          <!--<section v-if=" record.result.status === 'ok'">-->
            <span class="cell cell2">{{ formatMoney(row.changedAcb)}}</span>
            <span class="cell cell2">{{ formatMoney(row.newAcb)}}</span>
            <span class="cell cell2">{{ formatMoney(row.newPrc)}}</span>
            <span class="cell cell2">{{ row.remainQty}}</span>
            <span class="cell cell2" v-if="row.action === 'buy' "> - </span>
            <span class="cell cell2" v-else >{{ formatMoney(row.gain)}}</span>
          <!--</section>-->
        </div>

        <div class="errorResult" v-if="record.result.status  !== 'ok' "> {{record.result.msg}}</div>
        <div v-else>
          <div class="table-line-header table-line-header-short flex-container">
            <label class="cell cell2 ">Number</label>
            <label class="cell cell2">Date</label>
            <label class="cell cell2">Year</label>
            <label class="cell cell2 ">sellAmt</label>
            <label class="cell cell2 ">buyAmt</label>
            <label class="cell cell2 ">ACB</label>
            <label class="cell cell2 ">Gain</label>
          </div>
          <div class="table-line table-line-short flex-container ">
            <span class="cell cell2">{{ record.result.sellQty}}</span>
            <span class="cell cell2">{{ record.result.lastSellDate}}</span>
            <span class="cell cell2">{{ record.result.yearOfAcquisition.join(',')}}</span>
            <span class="cell cell2">{{ formatMoney(record.result.sellAmt)}}</span>
            <span class="cell cell2">{{ formatMoney(record.result.buyAmt)}}</span>
            <span class="cell cell2">{{ formatMoney(record.result.acb)}}</span>
            <span class="cell cell2">{{ formatMoney(record.result.gain)}}</span>
          </div>
          <button @click="download(record._id)">download</button>
        </div>
        <br>
        <br>
      </div>
          <div class="table-line-header  flex-container">
            <label class="cell cell2">Symbol</label>
            <label class="cell cell2">Year</label>
            <label class="cell cell2 ">ACB</label>
            <label class="cell cell2 ">Number</label>
            <label class="cell cell2 ">Gain</label>
          </div>

      <div  v-for="(record, index) in records" :key="index">
        <section class="table-line flex-container" v-if=" record.result.status === 'ok'">
            <span class="cell cell2">{{ record.symbol}}</span>
            <span class="cell cell2">{{ record.result.year}}</span>
            <span class="cell cell2">{{ formatMoney(record.result.acb)}}</span>
            <span class="cell cell2">{{ record.result.sellQty}}</span>
            <span class="cell cell2">{{ formatMoney(record.result.gain)}}</span>
        </section>
     </div>
      <div class="table-line flex-container" >
        <span class="cell cell2"></span>
        <span class="cell cell2"></span>
        <span class="cell cell2"></span>
        <span class="cell cell2">Total Gain:</span>
        <span class="cell cell2">{{ formatMoney(totalGain)}}</span>
      </div>
    </section>

  </div>
</template>

<script>
  import {debug, info, error} from '../utils/logging'
  import * as accounting from '../utils/accounting.js'
  import TxnUtil from '../../../server/src/txn'

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
    computed: {
      test() {
        return accounting.formatMoney(100.4)
      },
       totalGain(){
        let ret = 0;
        if(this.records.length > 0){
            this.records.map(item => {
              if(item.result.status === 'ok'){
                ret += item.result.gain;
              }
            })
        }
        return ret;
      }
    },
    methods: {
      formatMoney(m) {
        return accounting.formatMoney(m)
      },
      download(id) {
        this.$fetch(`records/${id}`, {method: 'DELETE'}).then(response => {
          if (response.status !== 'ok') error('Failed to delete issue');
          else this.loadData()
        })
      },
      // async loadData() {
      //   try {
      //     this.records = await this.$fetch('report')
      //   } catch (e) {
      //     error(e)
      //   }
      // },
      async loadData() {
        try {
          const query = {};
          // query.year = 2016;
          query.accountId = this.$state.user.curAccountId;
          const search = Object.keys(query).map(k => `${k}=${query[k]}`).join('&');
          // return fetch(`${urlBase || ''}/api/issues?${search}`)
          this.records = await this.$fetch(`report?${search}`);
          this.records.forEach((item) => {
            debug(`txn : ${TxnUtil.format(item)}`);
            debug(item.stlmtDate);
          })
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
<style lang="stylus" scoped>
  @import '../style/imports';
  @import '../style/table';

  .table-line-header
    width 120 * 9px

  .table-line
    width 120 * 9px

  .table-line-header-short
    width 120 * 6px

  .table-line-short
    width 120 * 6px

  .errorResult
    background-color greenyellow
</style>

