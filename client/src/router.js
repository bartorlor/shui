import Vue from 'vue'
import VueRouter from 'vue-router'
import state from './state'

import Home from './components/Home.vue'
import FAQ from './components/FAQ.vue'
import Login from './components/Login.vue'
import AccountsLayout from './components/AccountsLayout.vue'
import Accounts from './components/Accounts.vue'
import NewAccount from './components/NewAccount.vue'
import Account from './components/Account.vue'
import TxnsLayout from './components/TxnsLayout.vue'
import Txns from './components/Txns.vue'
import Report from './components/Report.vue'
import NewTxn from './components/NewTxn.vue'
import ImportTxns from './components/ImportTxns.vue'
import Txn from './components/Txn.vue'
import NotFound from './components/NotFound.vue'
import * as log from './utils/logging.js';

Vue.use(VueRouter)

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/faq', name: 'faq', component: FAQ },
  { path: '/login', name: 'login', component: Login, meta: { guest: true } },
  { path: '/accounts', component: AccountsLayout, meta: { private: true }, children: [
    { path: '', name: 'accounts', component: Accounts },
    { path: 'new', name: 'new-account', component: NewAccount },
    { path: ':id', name: 'account', component: Account, props: true },
  ] },
  { path: '/txns', component: TxnsLayout, meta: { private: true }, children: [
      { path: '', name: 'txns', component: Txns },
      { path: 'new', name: 'new-txn', component: NewTxn },
      { path: 'import', name: 'import-txns', component: ImportTxns },
      { path: 'report', name: 'report', component: Report },
      { path: ':id', name: 'txn', component: Txn, props: true },
    ] },
  { path: '*', component: NotFound },
]

const router = new VueRouter({
  routes,
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { selector: to.hash }
    }
    return { x: 0, y: 0 }
  },
})

router.beforeEach((to, from, next) => {
  log.debug(` >>> to ${to.name}`)
  console.log('to', to.name)
  // if (to.meta.private && !state.user) {
  if (to.matched.some(r => r.meta.private) && !state.user) {
    next({
      name: 'login',
      params: {
        wantedRoute: to.fullPath,
      },
    })
    return
  }
  // if (to.meta.guest && state.user) {
  if (to.matched.some(r => r.meta.guest) && state.user) {
    next({ name: 'home' })
    return
  }
  next()
})

export default router
