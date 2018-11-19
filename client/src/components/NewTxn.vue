<template>
  <div class="new-txn">
    <h1>New txn</h1>
    <SmartForm
     title="New txn"
     :operation="operation"
     :valid="valid">
      <FormInput
        name="symbol"
        v-model="symbol"
        placeholder="symbo of security (max 8 chars)"
        maxlength="8"
        required/>
      <FormInput
        name="action"
        v-model="action"
        placeholder="action buy or sell (max 4 chars)"
        maxlength="4"
        required/>
      <FormInput
        type="textarea"
        name="description"
        v-model="description"
        placeholder="Describe a transaction in details"
        required
        rows="4"/>

      <template slot="actions">
        <router-link
          tag="button"
          :to="{name: 'txns'}"
          class="secondary">
          Go back
        </router-link>
        <button
          type="submit"
          :disabled="!valid">
          Send txn
        </button>
      </template>
    </SmartForm>
  </div>
</template>

<script>
import PersistantData from '../mixins/PersistantData'

export default {
  mixins: [
    PersistantData('NewTxn', [
      'symbol',
      'action',
      'description',
    ]),
  ],

  data () {
    return {
      stlmtDate: '',
      symbol: '',
      action: '',
      description:'',
    }
  },

  computed: {
    valid () {
      return !!this.symbol && !!this.description && !!this.action
    },
  },

  methods: {
    async operation () {
      const result = await this.$fetch('txns/new', {
        method: 'POST',
        body: JSON.stringify({
          stlmtDate: new Date(),
          symbol: this.symbol,
          action: 'buy',
          description: this.description,
          
        }),
      })
      this.symbol = this.description = ''
      this.stlmtDate = this.action = ''
      this.$router.push({ name: 'txn', params: { id: result._id } })
    },
  },
}
</script>
