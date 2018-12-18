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
        <span class="badge">{{ record.qty}}</span>
        <span class="badge">{{ record.symbol}}</span>
        <span class="date">{{ record.stlmtDate | date }}</span>
        <span class="badge">{{ record.years}}</span>
        <span class="badge">{{ record.disposition}}</span>
        <span class="badge">{{ record.acb}}</span>
        <span class="badge">{{ record.expense}}</span>
        <span class="badge">{{ record.gain}}</span>
        <button @click="download(record._id)">download</button>
      </div>
    </section>

  </div>
</template>

<script>
  import {debug, info, error} from '../utils/logging'
  export default {
    data(){
      return {
        records: [
           {
           qty:100,
           symbol:'client vips',
           stlmtDate:'02/14/2016',
           years:'2015,2016',
           disposition:1548.95,
           acb:1435.01,
           expense:1.00,
           gain:22.93,
           }
        ],
      }
    },
    methods: {
      download(id) {
        this.$fetch(`records/${id}`, {method: 'DELETE'}).then(response => {
          if (response.status !== 'ok') error('Failed to delete issue');
          else  this.loadData()
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
