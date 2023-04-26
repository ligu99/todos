import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/all',
    name: 'Home',
    component: Home
  },
  {
    path: '/active',
    name: 'Home',
    component: Home
  },
  {
    path: '/completed',
    name: 'Home',
    component: Home
  }
]

const router = new VueRouter({
  routes
})

export default router
