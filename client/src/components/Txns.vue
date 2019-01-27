<template>
  <div class="list" id="txns">

    <div class="empty" v-if="list.length === 0">
      You don't have any txn yet.
    </div>
    <section v-else class="txns-list">
      <div class="table-line-header flex-container">
        <label class="cell cell2">Seq</label>
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

        <span class="cell cell2" >{{ index }}</span>
        <span class="cell cell2" v-if="editIndex !== index">{{ row.symbol}}</span>
        <input class="cell cell2" v-else v-model="row.symbol"/>

        <span class="cell cell2" v-if="editIndex !== index">{{ row.stlmtDate}}</span>
        <input class="cell cell2"  v-else v-model="row.stlmtDate"/>
        <!--<input class="cell cell2" type="date" v-else v-model="row.stlmtDate"/>-->
        <!--<date-picker v-else v-model="row.stlmtDate" ></date-picker>-->
        <span class="cell cell2" v-if="editIndex !== index">{{ row.action}}</span>
        <input class="cell cell2" v-else v-model="row.action"/>
        <span class="cell cell2" v-if="editIndex !== index">{{ row.qty}}</span>
        <input class="cell cell2" v-else v-model="row.qty"/>
        <span class="cell cell2" v-if="editIndex !== index">{{ row.price}}</span>
        <input class="cell cell2" v-else v-model="row.price"/>
        <span class="cell cell2" v-if="editIndex !== index">{{ row.amt}}</span>
        <input class="cell cell2" v-else v-model="row.amt"/>

        <span v-if="editIndex !== index" class="cell cell2" @click="edit(row,index)"><i class="material-icons">edit</i></span>
        <span v-if="editIndex === index" class="cell cell2 ">
          <i @click="cancel(row)" class="material-icons">undo</i>
          <i @click="save(row)" class="material-icons">save</i>
        </span>
        <!--<button class="cell cell2" @click="deleteOne(row._id)">delete</button>-->
        <span class="cell cell2" @click="deleteOne(row._id)"><i class="material-icons mycursor">delete</i></span>
      </div>
    </section>
    <span @click="add()"><i class="material-icons mycursor">add</i></span>
  </div>
</template>

<script>
  import {debug, info, error,isDebug} from '../utils/logging'
  import TxnUtil from '../../../server/src/txn'
  import DatePicker from 'vue2-datepicker'

  export default {
    components: { DatePicker },
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
      isEditStatus(index) {
        return (this.editIndex === index)
      },
      add() {
        this.originalData = null;
        const obj =  {
           stlmtDate: '2018-06-19', action: 'buy', symbol: '', description:'some memo', type: '', qty: 0, price: 0, amt: 0,
        }
        this.list.push(obj);
        this.editIndex = this.list.length - 1
      },
      edit(item, index) {
        this.originalData = Object.assign({}, item)
        this.editIndex = index;
      },
      cancel(item) {
        this.editIndex = null
        if (this.isAdd) {
          this.list.splice(this.list.indexOf(item), 1)
        } else {
          Object.assign(item, this.originalData)
          this.originalData = null
        }
      },
      save(row) {
        const obj = row;
        obj.accountId = this.$state.user.curAccountId;
        if (!this.validate(obj)) {
          return;
        }
        if (this.isAdd) {
          this.doAdd(obj);
        } else {
          this.realEdit(obj);
        }
        this.originalData = null;
        this.editIndex = null;
      },
      validate(obj) {
        const err = TxnUtil.validateTxn(obj);
        if (err) {
            this.$dialog.alert(err)
            .then(function (dialog) {
              debug('Closed')
            })
          return false;
        }
        return true;
      },
          /*stlmtDate: obj.stlmtDate,*/
          /*symbol: obj.symbol,*/
          /*action: obj.action,*/
          /*description: obj.description,*/
          /*type: obj.type,*/
          /*qty: obj.qty,*/
          /*price: obj.price,*/
          /*amt: obj.amt,*/
          /*accountId : obj.$state.user.curAccountId,*/
      async doAdd(obj) {
        await this.$fetch('txns/new', {
        method: 'POST',
        body: JSON.stringify(obj),
        }).then(() => {
          this.loadData();
        });
      },
      async realEdit(obj) {
        await this.$fetch(`txns/${obj._id}`, {
          method: 'PUT',
          params: {id: obj._id},
          body: JSON.stringify(obj),
        });
        this.loadData();
      },
      deleteOne(id) {
       if(!isDebug()){
         const ret = confirm("Are you sure to delete it?")
         if(ret === false) {
           return;
         }
       }
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
            debug(`txn : ${TxnUtil.format(item)}`);
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
