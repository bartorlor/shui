<template>
  <div class="txn">
    <h2>Txn</h2>

    <Loading v-if="remoteDataBusy"/>

    <div class="empty" v-else-if="!txn">
      Txn not found.
     id:  {{this.id}}
    </div>

    <template v-else>
      <!-- General info -->
      <section class="infos">
        <div class="info">
          Created on <strong>{{ txn.stlmtDate | date }}</strong>
        </div>
        <!--<div class="info">-->
          <!--Author <strong>{{ txn.user.username }}</strong>-->
        <!--</div>-->
        <div class="info">
          Status <span class="badge">{{ txn.action}}</span>
        </div>
      </section>
      <!-- Content -->
      <section class="content">
        <h3>{{ txn.symbol}}</h3>
        <p>{{ txn.description }}</p>
      </section>
    </template>
  </div>
</template>

<script>
import RemoteData from '../mixins/RemoteData'

export default {
  mixins: [
    RemoteData({
      txn () {
        return `txns/${this.id}`
      },
    }),
  ],

  props: {
    id: {
      type: String,
      required: true,
    },
  },
}
</script>
