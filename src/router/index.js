// Ubicación: src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',            name: 'home',        component: HomeView },
    { path: '/funciones',   name: 'funciones',   component: () => import('@/views/FuncionesView.vue') },
    { path: '/boleteria',   name: 'boleteria',   component: () => import('@/views/BoleteriaView.vue') },
    { path: '/inscripcion', name: 'inscripcion', component: () => import('@/views/InscripcionView.vue') },
    { path: '/donaciones',  name: 'donaciones',  component: () => import('@/views/DonacionesView.vue') },
    { path: '/admin',       name: 'admin',       component: () => import('@/views/AdminView.vue') },
  ],
  // Al cambiar de página, vuelve arriba
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router