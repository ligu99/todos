import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/all'
  },
  {
    path: '/all',
    name: 'all',
    component: Home
  },
  {
    path: '/active',
    name: 'active',
    component: Home
  },
  {
    path: '/completed',
    name: 'completed',
    component: Home
  }
]

const router = new VueRouter({
  routes
})

export default router
