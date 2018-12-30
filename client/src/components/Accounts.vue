<template>
  <div class="accounts" id="accounts">
    <section class="accounts-list">
      <div   v-if="accounts.length !==0" class="empty">
        Current Portfolio is {{selectedItem.name}}
      </div>


     <div class="table-line-header flex-container">
      <label class="cell cell2 header">id</label>
      <label class="cell cell2 header">Name</label>
      <label class="cell cell2 header">Actions</label>
      <label class="cell cell2 header">Delete</label>
    </div>
    <div class="table-line flex-container"
          v-for="(row, index) in accounts" :key="index">
        <span class="cell cell2">{{ row._id}}</span>

        <span class="cell cell2" v-if="editIndex !== index">{{ row.name }}</span>
        <input class="cell cell2" v-else v-model="row.name"/>

                <button v-if="editIndex !== index" class="cell cell2"  @click="deleteOne(row._id)">delete</button>
                <button v-if="editIndex !== index" class="cell cell2" @click="edit(row,index)">edit</button>

              <button v-if="editIndex === index" class="cell cell2" @click="cancel(row)">Cancel</button>
              <button v-if="editIndex === index" class="cell cell2"@click="save(row)">Save</button>

      <button v-if="editIndex !== index" class="cell cell2" @click="select(row)">select</button>

      <!--<div class="cell cell 1" @click="disk.enable ^=true">-->
        <!--<q-checkbox v-model="disk.enable"></q-checkbox>-->
      <!--</div>-->

    </div>


      <!--<div v-for="(row, index) in accounts" :key="index" class="ticket-item">-->
        <!--<span class="badge">{{ row._id}}</span>-->
        <!--<span v-if="editIndex !== index">{{ row.name }}</span>-->
        <!--<span v-else>-->
              <!--<input v-model="row.name">-->
        <!--</span>-->
        <!--<span v-if="editIndex !== index">-->
                <!--<button @click="deleteOne(row._id)">delete</button>-->
                <!--<button @click="edit(row,index)">edit</button>-->
                <!--<button @click="select(row)">select</button>-->
        <!--</span>-->
        <!--<span v-else>-->
              <!--<button @click="cancel(row)">Cancel</button>-->
              <!--<button @click="save(row)">Save</button>-->
        <!--</span>-->
      <!--</div>-->
    </section>
    <button @click="add()">add</button>
  </div>
</template>

<script>
  import {debug, info, error} from '../utils/logging'
  export default {
    name: 'my',

    data () {
      return {
        message: 'Hello Vue.js!',
        accounts: [],
        editIndex: null,
        originalData: null,
      }
    },
    computed: {
      isAdd() {
        return (this.originalData === null)
      },
      selectedItem() {
        let ret = false;
         ret = this.accounts.filter((item) => {
          if (item.selected)
            return item;
        });
         return ret;
      }
    },
    methods: {
      isEditStatus(index) {
        return (this.editIndex === index)
      },
      add() {
        this.originalData = null;
        let selected = this.accounts.length === 0 ? true : false;
        this.accounts.push({_id: '0', name: 'My Portfolio', selected: selected});
        this.editIndex = this.accounts.length - 1
      },
      edit(item, index) {
        this.originalData = Object.assign({}, item)
        this.editIndex = index;
      },
      cancel(item) {
        this.editIndex = null
        if (this.isAdd) {
          this.accounts.splice(this.accounts.indexOf(item), 1)
        } else {
          Object.assign(item, this.originalData)
          this.originalData = null
        }
      },
      save() {
        if (!this.validate()) {
          return;
        }
        this.originalData = null;
        this.editIndex = null;

        if (this.isAdd) {
          this.doAdd();
        } else {
          const obj = this.accounts[this.editIndex];
          this.realEdit(obj);
        }
      },
      validate() {
        const obj = this.accounts[this.editIndex];
        if (this.isSameName(obj.name)) {
          debug("error portfolio name ");
          return false;
        }
        return true;
      },
      async doAdd() {
        const obj = this.accounts[this.editIndex];
        const result = await this.$fetch('accounts/new', {
          method: 'POST',
          body: JSON.stringify({
            name: obj.name,
            selected: obj.selected,
          }),
        }).then(() => {
          this.loadData();
        });
      },
      isSameName(newName) {
        let result = this.accounts.filter(obj => {
          return obj.name === newName;
        })
        return result;
      },
      select(obj) {
        let current = this.selectedItem;
        current.selected = false;
        this.realEdit(current);
        obj.selected = true;
        this.realEdit(obj);
        this.loadData();
      },
      async realEdit(obj) {
        const result = await this.$fetch('accounts/update', {
          method: 'POST',
          params: {id: obj._id},
          body: JSON.stringify({
            _id: obj._id,
            name: obj.name,
            selected: obj.selected,
          }),
        });
        this.loadData();
      },
      deleteOne(id) {
        this.$fetch(`accounts/${id}`, {method: 'DELETE'}).then(response => {
          if (response.status !== 'ok') error('Failed to delete issue');
          else this.loadData()
        })
      },
      async loadData() {
        try {
          this.accounts = await this.$fetch('accounts');
          this.accounts.forEach((item) => {
            debug(`account : ${account.format(item)}`);
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
  }
</script>
<style lang="stylus" scoped>
  @import '../style/imports';
  @import '../style/table';
</style>
