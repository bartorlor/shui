<template>
  <div class="list" id="txns">

    <div class="empty" v-if="list.length === 0">
      You don't have any txn yet.
    </div>
    <section v-else class="txns-list">
      <div class="table-line-header flex-container">
        <label class="cell cell2">Symbol</label>
        <label class="cell cell2">Date</label>
        <label class="cell cell2 ">Action</label>
        <label class="cell cell2 ">Quantity</label>
        <label class="cell cell2 ">Price</label>
        <label class="cell cell2 ">Amount</label>
        <label class="cell cell2 ">Edit</label>
        <label class="cell cell2 ">Delete</label>
      </div>
      <div class="table-line flex-container"
           v-for="(row, index) in list" :key="index">

        <span class="cell cell2" v-if="editIndex !== index">{{ row.symbol}}</span>
        <input class="cell cell2" v-else v-model="row.symbol"/>

        <span class="cell cell2" v-if="editIndex !== index">{{ row.stlmtDate}}</span>
        <input class="cell cell2" v-else v-model="row.stlmtDate"/>
        <span class="cell cell2" v-if="editIndex !== index">{{ row.action}}</span>
        <input class="cell cell2" v-else v-model="row.action"/>
        <span class="cell cell2" v-if="editIndex !== index">{{ row.qty}}</span>
        <input class="cell cell2" v-else v-model="row.qty"/>
        <span class="cell cell2" v-if="editIndex !== index">{{ row.price}}</span>
        <input class="cell cell2" v-else v-model="row.price"/>
        <span class="cell cell2" v-if="editIndex !== index">{{ row.amt}}</span>
        <input class="cell cell2" v-else v-model="row.amt"/>
        <span class="cell cell2" v-if="editIndex !== index">{{ row.amt}}</span>
        <input class="cell cell2" v-else v-model="row.amt"/>

        <span v-if="editIndex !== index" class="cell cell2" @click="edit(row,index)"><i class="material-icons">edit</i></span>
        <span v-if="editIndex === index" class="cell cell2 ">
          <i @click="cancel(row)" class="material-icons">undo</i>
          <i @click="save(row)" class="material-icons">save</i>
        </span>

        <button class="cell cell2" @click="deleteOne(row._id)">delete</button>
      </div>
    </section>
    <span @click="add()"><i class="material-icons mycursor">add</i></span>
  </div>
</template>

<script>
  import {debug, info, error} from '../utils/logging'
  import txn from '../../../server/src/txn'

  export default {
    data() {
      return {
        list: [],
        editIndex: null,
        originalData: null,
      }
    },
    computed: {
      isAdd() {
        return (this.originalData === null)
      },
      selectedItem() {
        let ret = null;
        ret = this.list.filter((item) => {
          if (item.selected)
            return item;
        });
        return ret[0];
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
          this.list = await this.$fetch(`txns?${search}`);
          this.list.forEach((item) => {
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
      list(newValue, oldValue) {
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
  .mycursor
    cursor pointer

  @import '../style/imports';
  @import '../style/table';
</style>
