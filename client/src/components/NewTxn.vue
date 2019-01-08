<template>
  <div class="new-txn">
    <h1>New txn</h1>
    <SmartForm
     title="New txn"
     :operation="operation"
     :valid="valid">
      <FormInput
        name="stlmtDate"
        v-model="stlmtDate"
        placeholder="date"
        maxlength="10"
        required/>
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
      <FormInput
        name="type"
        v-model="type"
        placeholder="type of security"
        maxlength="4"
        required/>
      <FormInput
        name="qty"
        v-model="qty"
        placeholder="quatity"
        maxlength="9"
        required/>
      <FormInput
        name="price"
        v-model="price"
        placeholder="price"
        maxlength="9"
        required/>
      <FormInput
        name="amt"
        v-model="amt"
        placeholder="amount"
        maxlength="12"
        required/>

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
import {debug, info, error} from '../utils/logging'

export default {
  mixins: [
    PersistantData('NewTxn', [
      'stlmtDate',
      'symbol',
      'action',
      'description',
      'type',
      'qty',
      'price',
      'amt',
    ]),
  ],

  data () {
    return {
      stlmtDate: '01-01-2016',
      action: 'buy',
      symbol: 'AAPL',
      description:'this is a init recorder',
      type: 'shs',
      qty: 10,
      price: 97,
      amt: 971,

    }
  },

  computed: {
    valid () {
      return !!this.symbol && !!this.description && !!this.action
    },
  },

  methods: {
    async operation () {
      debug(`added auccount id ${this.$state.user.curAccountId}`);
      const result = await this.$fetch('txns/new', {
        method: 'POST',
        body: JSON.stringify({
          stlmtDate: this.stlmtDate,
          symbol: this.symbol,
          action: this.action,
          description: this.description,
          type: this.type,
          qty: this.qty,
          price: this.price,
          amt: this.amt,
          accountId : this.$state.user.curAccountId,
        }),
      })
      this.symbol = this.description = ''
      this.stlmtDate = this.action = ''
      this.$router.push({ name: 'txn', params: { id: result._id } })
    },
  },
}
</script>
