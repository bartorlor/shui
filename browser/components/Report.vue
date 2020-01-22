<template>
  <div class="records" id="records">
    <router-link tag="button" :to="{name: 'txns'}" class="secondary">
      Go back
    </router-link>
    <br>
    <br>
    <br>
    <br>
    <div>
      <div>
        <span> Year: </span>
        <select v-model="form.year">
          <option v-for="option in form.years" v-bind:value="option">
            {{ option }}
          </option>
        </select>
        <span>Selected: {{ form.year }}</span>
      </div>
      <div>
        <span> Tax Year End: </span>
        <select v-model="form.month">
          <option v-for="option in form.months" v-bind:value="option.value">
            {{ option.text }}
          </option>
        </select>
        <select v-model="form.day">
          <option v-for="option in form.days" v-bind:value="option">
            {{ option }}
          </option>
        </select>
        <span>Selected: {{ form.month}}</span>
        <span>Selected: {{ form.day}}</span>
      </div>
      <div>
        <span>Notes(optional)</span>
        <textarea v-model="form.notes" placeholder="add notes"></textarea>
      </div>
      <button name='createReport' @click="createReport()">Create Report</button>
      <br>
      <br>
      <br>
    </div>

    <div class="empty" v-if="errors.length > 0">
        <div class="table-line flex-container" v-for="(row, index) in errors" :key="index">
          <span class="cell cell2">{{ row}}</span>
        </div>
    </div>


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
          <span class="cell cell2" v-else>{{ formatMoney(row.gain)}}</span>
               <!--</section>-->
        </div>

        <div class="errorResult" v-if="record.result.status  !== 'ok' "> {{record.result.msg}}</div>
        <div v-else>
          <div class="table-line-header table-line-header-short flex-container">
            <label class="cell cell2 ">Number</label>
            <label class="cell cell2">Date</label>
            <label class="cell cell2 ">Proceeds of disposition</label>
            <label class="cell cell2 ">Adjusted cost base</label>
            <label class="cell cell2 ">Gain or loss</label>
          </div>
          <div class="table-line table-line-short flex-container ">
            <span class="cell cell2">{{ record.result.sellQty}}</span>
            <span class="cell cell2">{{ record.result.lastSellDate}}</span>
            <span class="cell cell2">{{ formatMoney(record.result.sellAmt)}}</span>
            <span class="cell cell2">{{ formatMoney(record.result.buyAmt)}}</span>
            <span class="cell cell2">{{ formatMoney(record.result.gain)}}</span>
          </div>
        </div>
        <br>
        <br>
      </div>
      <div class="table-line-header  flex-container">
      <label class="cell cell2 ">Number</label>
        <label class="cell cell2">Symbol</label>
        <label class="cell cell2">Date</label>
        <label class="cell cell2 ">Proceeds of disposition</label>
        <label class="cell cell2 ">Adjusted cost base</label>
        <label class="cell cell2 ">Gain or loss</label>
      </div>

      <div v-for="(record, index) in records" :key="index">
        <section class="table-line flex-container" v-if=" record.result.status === 'ok' && record.result.sellAmt !== 0">
          <span class="cell cell2">{{ record.result.sellQty}}</span>
          <span class="cell cell2">{{ record.symbol}}</span>
          <span class="cell cell2">{{ record.result.lastSellDate}}</span>
          <span class="cell cell2">{{ formatMoney(record.result.sellAmt)}}</span>
          <span class="cell cell2">{{ formatMoney(record.result.buyAmt)}}</span>
          <span class="cell cell2">{{ formatMoney(record.result.gain)}}</span>
        </section>
      </div>
      <div class="table-line flex-container">
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
  import TxnUtil from '../../server/txn'

  export default {
    data() {
      return {
        form: {
          year: 2016,
          month: '12',
          day: 31,
          hasSuperficialLoss: true,
          format: 'pdf',
          notes: '',
          years: [2019, 2018, 2017, 2016, 2015],
          months: [
            {text: 'Jan', value: '01'},
            {text: 'Feb', value: '02'},
            {text: 'Mar', value: '03'},
            {text: 'Apr', value: '04'},
            {text: 'May', value: '05'},
            {text: 'Jun', value: '06'},
            {text: 'Jul', value: '07'},
            {text: 'Aug', value: '08'},
            {text: 'Sep', value: '09'},
            {text: 'Oct', value: '10'},
            {text: 'Nov', value: '11'},
            {text: 'Dec', value: '12'}
          ],
          days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
        },

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
        errors: [],
      }
    },
    computed: {
      test() {
        return accounting.formatMoney(100.4)
      },
      totalGain() {
        let ret = 0;
        if (this.records.length > 0) {
          this.records.map(item => {
            if (item.result.status === 'ok') {
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
      createReport() {
        this.errors = [];
        this.loadData();
      },
      async loadData() {
        try {
          const query = {};
          // query.year = 2016;
          query.accountId = this.$state.user.curAccountId;
          query.year = this.form.year;
          query.month = this.form.month;
          query.day = this.form.day;
          query.notes = this.form.notes;
          const search = Object.keys(query).map(k => `${k}=${query[k]}`).join('&');
          // return fetch(`${urlBase || ''}/api/issues?${search}`)
          let ret = await this.$fetch(`report?${search}`);
          debug(`fetch ret:${JSON.stringify(ret)}`)
          if(ret.status === 'ok'){
            this.records = ret.records;
            this.records.forEach((item) => {
              // debug(`txn : ${TxnUtil.format(item)}`);
              // debug(item.stlmtDate);
            })
          } else if(ret.status === 'error'){
            /* debug(`finaol at browser ... ${ret.errors}`); */
            this.errors = ret.errors;
          }
        } catch (e) {
          error(e)
        }
      },

    },
    mounted() {
      // this.loadData();
    },
    watch: {
      records(newValue, oldValue) {
        if (newValue.length > 0) {
          newValue.forEach(item => {
            if (item.symbol === 'AMZN') {
              // info('amzn:', JSON.stringify(item));
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

