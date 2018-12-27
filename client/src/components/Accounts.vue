<template>
  <div class="accounts" id="accounts">
    <div class="empty">
      Current Portfolio is {{selectedItem.name}}
    </div>
    <section class="accounts-list">
      <div v-for="(row,index) of accounts" class="ticket-item">
        <span class="badge">{{ row._id}}</span>
        <!--<span v-if="isEditStatus">{{ row.name }}</span>-->
        <!--<span v-else>-->
              <!--<input v-model="row.name">-->
        <!--</span>-->
        <!--<span v-if="isEditStatus">-->
                <!--<button @click="delete(row._id)">delete</button>-->
                <!--<button @click="edit(row,index)">edit</button>-->
                <!--<button @click="select(row)">select</button>-->
        <!--</span>-->
        <!--<span v-else>-->
              <!--<button @click="cancel(row)">Cancel</button>-->
              <!--<button @click="save(row)">Save</button>-->
        <!--</span>-->
      </div>
    </section>
    <button @click="add()">add</button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        accounts: [],
        editIndex: null,
        originalData: null,
      }
    },
    computed: {
      isAdd() {
        return (this.originalData === null)
      },
      isEditStatus() {
        return (this.editIndex === index)
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
      add() {
        this.originalData = null;
        this.items.push({_id: '0', name: 'My Portfolio', selected: false,});
        this.editIndex = this.accounts.length - 1
      },
      edit(item, index) {
        this.originalData = Object.assign({}, item)
        this.editIndex = index;
      },
      cancel(item) {
        this.editIndex = null
        if (this.isAdd) {
          this.items.splice(this.items.indexOf(item), 1)
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
      delete(id) {
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
