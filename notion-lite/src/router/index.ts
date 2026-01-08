import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  auth.init()

  if (to.meta.requiresAuth && !auth.user) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
    return
  }

  if (to.name === 'Login' && auth.user) {
    const redirect = (to.query.redirect as string | undefined) || '/'
    next(redirect)
    return
  }

  next()
})

export default router
