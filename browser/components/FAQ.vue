<template>
  <main class="faq">
    <h1>Frequently Asked Questions</h1>

    <Loading v-if="remoteDataBusy" />

    <div class="error" v-if="hasRemoteErrors">
      Can't load the questions
    </div>

    <section class="list">
      <article v-for="question of questionList">
        <h2 v-html="question.title"></h2>
        <p v-html="question.content"></p>
      </article>
    </section>

  </main>
</template>

<script>
/* import RemoteData from '../mixins/RemoteData' */

export default {
  /* mixins: [ */
    /* RemoteData({ */
      /* questionList: 'questions', */
    /* }), */
  /* ], */

   data () {
    return {
      questionList: [],
      /* error: null, */
      /* loading: false, */
      /* $remoteDataLoading: 42, */
      remoteDataBusy: false,
      hasRemoteErrors: false,
    }
  },
/*
  async created () {
    try {
      this.questions = await this.$fetch('questions')
    } catch (e) {
      this.error = e
    }
  }, */
}
</script>
