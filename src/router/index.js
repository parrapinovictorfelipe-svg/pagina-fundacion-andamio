import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'

import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',            name: 'home',        component: HomeView },
    { path: '/funciones',   name: 'funciones',   component: () => import('@/views/FuncionesView.vue') },
    { path: '/boleteria',   name: 'boleteria',   component: () => import('@/views/BoleteriaView.vue') },
    { path: '/inscripcion', name: 'inscripcion', component: () => import('@/views/InscripcionView.vue') },
    { path: '/donaciones',  name: 'donaciones',  component: () => import('@/views/DonacionesView.vue') },
    { path: '/admin/login', name: 'admin-login', component: () => import('@/views/AdminLogin.vue') },
    { path: '/admin',       name: 'admin',       component: () => import('@/views/AdminView.vue') },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return '/admin/login'
  }
})

export default router
