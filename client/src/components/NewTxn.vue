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
        placeholder="Short description (max 100 chars)"
        maxlength="100"
        required/>

      <FormInput
        type="textarea"
        name="description"
        v-model="description"
        placeholder="Describe your problem in details"
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

<!--<script>
export default {
  data () {
    return {
      symbol: '',
      description:'',
    }
  },
}
</script>-->

<script>
import PersistantData from '../mixins/PersistantData'

export default {
  mixins: [
    PersistantData('NewTxn', [
      'symbol',
      'description',
    ]),
  ],

  data () {
    return {
      symbol: '',
      description: '',
    }
  },

  computed: {
    valid () {
      return !!this.symbol && !!this.description
    },
  },

  methods: {
    async operation () {
      const result = await this.$fetch('txns/new', {
        method: 'POST',
        body: JSON.stringify({
          symbol: this.symbol,
          description: this.description,
        }),
      })
      this.symbol = this.description = ''
      this.$router.push({ name: 'txn', params: { id: result._id } })
    },
  },
}
</script>
