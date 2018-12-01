<template>
  <div class="report" id="report">
    <Loading v-if="remoteDataBusy"/>

    <div class="empty" v-else-if="report.length === 0">
      You don't have any row yet.
    </div>

    <section v-else class="report-list">
      <div v-for="row of report" class="ticket-item">
        <router-link :to="{name: 'account', params: { id: row._id }}">{{ row.title }}</router-link>
        <span class="badge">{{ row.status }}</span>
        <span class="date">{{ row.date | date }}</span>
      </div>
    </section>

  </div>
</template>

<script>
import RemoteData from '../mixins/RemoteData'

export default {
  mixins: [
    RemoteData({
      report: 'report',
    }),
  ],
}
</script>
