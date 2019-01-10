<template>
  <div id="accounts">
    <section>
      <div v-if="list.length !==0" class="empty">
        Current Portfolio is {{selectedItem.name}}
      </div>
      <br>
      <br>
      <br>
      <br>
      <br>
      <div class="table-line-header flex-container">
        <label class="cell cell-long ">Name</label>
        <label class="cell cell2 ">Rename</label>
        <label class="cell cell2 ">Go To</label>
      </div>
      <div class="table-line flex-container"
           v-for="(row, index) in list" :key="index">

        <span class="cell cell-long" v-if="editIndex !== index">{{ row.name }}</span>
        <input class="cell cell-long" v-else v-model="row.name"/>

        <span v-if="editIndex !== index" class="cell cell2" @click="edit(row,index)"><i class="material-icons">edit</i></span>
        <span v-if="editIndex === index" class="cell cell2 ">
                <i @click="cancel(row)" class="material-icons">undo</i>
                <i @click="save(row)" class="material-icons">save</i>
        </span>

        <span v-if="editIndex !== index" class="cell cell2 " @click="select(row)">
        <i v-if="row.selected" class="material-icons">radio_button_checked</i>
        <i v-else class="material-icons">radio_button_unchecked</i>
        </span>

      </div>
    </section>
    <span @click="add()"><i class="material-icons mycursor">add</i></span>
  </div>
</template>

<script>
  import {debug, info, error} from '../utils/logging'
  import Account from '../../../server/src/account'

  export default {
    name: 'my',

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
        if (this.list.length > 4) {
          this.$dialog.alert('error: the max accounts are five')
          .then(function (dialog) {
            debug('Closed')
          })
          return false;
        }
        this.originalData = null;
        let selected = this.list.length === 0 ? true : false;
        this.list.push({_id: '0', name: 'My Portfolio', selected: selected});
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
      save() {
        if (!this.validate()) {
          return;
        }

        if (this.isAdd) {
          this.doAdd();
        } else {
          const obj = this.list[this.editIndex];
          this.realEdit(obj);
        }
        this.originalData = null;
        this.editIndex = null;
      },
      validate() {
        const obj = this.list[this.editIndex];
        if (this.isSameName(obj.name)) {
          // debug("error portfolio name ");
          this.$dialog.alert('error: has same portfolio name,please change to different name')
          .then(function (dialog) {
            debug('Closed')
          })
          return false;
        }

        return true;
      },
      async doAdd() {
        const obj = this.list[this.editIndex];
        const response = await this.$fetch('accounts/new', {
          method: 'POST',
          body: JSON.stringify({
            name: obj.name,
            selected: obj.selected,
            // email:this.$state.user.username,
          }),
        }).then(() => {
          this.loadData();
        });
        this.saveAcctLocal(response);
      },
      isSameName(newName) {
        let result = this.list.filter(obj => {
          return obj.name === newName;
        })
        return result.length > 1;
      },
      select(obj) {
        // let current = this.selectedItem;
        // current.selected = false;
        // this.realEdit(current);
        // let item ;
        // for( item in accouts)
        this.list.map(item => {
          if (item.selected === true) {
            item.selected = false;
            this.realEdit(item);
          }
        })
        obj.selected = true;
        this.realEdit(obj);
        this.loadData();
      },
      async realEdit(obj) {
        const response = await this.$fetch(`account/${obj._id}`, {
          method: 'PUT',
          params: {id: obj._id},
          body: JSON.stringify({
            _id: obj._id,
            name: obj.name,
            selected: obj.selected,
          }),
        });
        this.saveAcctLocal(response);
        this.loadData();
      },
      saveAcctLocal() {
        if (!!response && response.ok) {
          const account = response;
          if (account.selected === true)
            this.$state.user.curAccountId = account._id;
        }
      },
      deleteOne(id) {
        this.$fetch(`accounts/${id}`, {method: 'DELETE'}).then(response => {
          if (response.status !== 'ok') error('Failed to delete issue');
          else this.loadData()
        })
      },
      async loadData() {
        try {
          this.list = await this.$fetch('accounts');
          this.list.forEach((item) => {
            debug(`account : ${Account.format(item)}`);
          })
        } catch (e) {
          error(e)
        }
      },
    },
    mounted() {
      this.loadData();
    },
  }
</script>
<style lang="stylus" scoped>
  .table-line-header
    width 200 * 4px
    border solid
  .table-line
    width 200 * 4px
  .mycursor
    cursor pointer

  /*@import '../style/imports';*/
  @import '../style/table';
</style>
