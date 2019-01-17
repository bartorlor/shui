<template>
  <main class="login">
    <h1>Please login to continue</h1>
    <SmartForm
      class="form"
      :title="title"
      :operation="operation"
      :valid="valid">
      <FormInput
        name="email"
        v-model="email"
        type="email"
        placeholder="email" />
      <FormInput
        name="password"
        type="password"
        v-model="password"
        placeholder="Password" />
      <template v-if="mode === 'signup'">
        <FormInput
          name="verify-password"
          type="password"
          v-model="password2"
          placeholder="Retype Password"
          :invalid="retypePasswordError" />
      </template>

      <template slot="actions">
        <template v-if="mode === 'login'">
          <button
            type="button"
            class="secondary"
            @click="mode = 'signup'">
            Sign up
          </button>
          <button
            type="submit"
            :disabled="!valid">
            Login
          </button>
        </template>
        <template v-else-if="mode === 'signup'">
          <button
            type="button"
            class="secondary"
            @click="mode = 'login'">
            Back to login
          </button>
          <button
            type="submit"
            :disabled="!valid">
            Create account
          </button>
        </template>
      </template>
    </SmartForm>
  </main>
</template>

<script>

import {debug, info, error} from '../utils/logging'
export default {
  data () {
    return {
      mode: 'login',
      password: '',
      password2: '',
      email:'',
    }
  },

  computed: {
    title () {
      switch (this.mode) {
        case 'login': return 'Login'
        case 'signup': return 'Create a new account'
      }
    },

    retypePasswordError () {
      return !!this.password2 && this.password !== this.password2
    },

    signupValid () {
      return !!this.password2 &&  !!this.email && !this.retypePasswordError
    },

    valid () {
      return !!this.email && !!this.password &&
      (this.mode !== 'signup' || this.signupValid)
    },
  },

  methods: {
    async operation() {
      await this[this.mode]()
    },

    async login () {
      this.$state.user = await this.$fetch('login', {
        method: 'POST',
        body: JSON.stringify({
          username: this.email,
          password: this.password,
        }),
      })
      if(await this.hasAccount() === false){
        await this.addDefaultPortfolio();
      }
      await this.saveCurAccount();
      this.$router.replace(this.$route.params.wantedRoute || { name: 'home' })
    },

    async signup () {
      await this.$fetch('signup', {
        method: 'POST',
        body: JSON.stringify({
          username: this.email,
          password: this.password,
          email: this.email,
        }),
      })
      this.mode = 'login'
    },
      async hasAccount() {
        try {
          let accounts = await this.$fetch('accounts');
          let ret = accounts.length > 0  ?  true : false;
          // info(`hasAccount :${ret}`)
          return ret
        } catch (e) {
          error(e)
        }
      },
     async addDefaultPortfolio () {
      const response = await this.$fetch('accounts/new', {
        method: 'POST',
        body: JSON.stringify({
          name: `My Default Portfolio`,
          selected: true,
          email: this.email,
        }),
      })
    },
      async saveCurAccount() {
        try {
          let accounts = await this.$fetch('accounts');
          let ret = accounts.length > 0 ? true : false;
          accounts.forEach(item => {
            if (item !== null && typeof item !== 'undefined') {
              const account = item;
              if (account.selected === true)
                this.$state.user.curAccountId = account._id;
                this.$state.user.curAccountName = account.name;
            }
          })
          // info(`hasAccount :${ret}`)
          return ret
        } catch (e) {
          error(e)
        }
      },
  },
}
</script>

<style lang="stylus" scoped>
.form {
  >>> .content {
    max-width: 400px;
  }
}
</style>
