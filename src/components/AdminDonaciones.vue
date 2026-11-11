<script setup>
import { ref } from 'vue'
import AdminDonacionesLista from './AdminDonacionesLista.vue'
import AdminDonacionesMontos from './AdminDonacionesMontos.vue'

const pestana = ref('lista')
</script>

<template>
  <div>
    <h2>Donaciones</h2>
    <div class="pestanas">
      <button :class="{ activa: pestana === 'lista' }" @click="pestana = 'lista'">Donaciones recibidas</button>
      <button :class="{ activa: pestana === 'montos' }" @click="pestana = 'montos'">Montos y pago</button>
    </div>
    <AdminDonacionesLista v-if="pestana === 'lista'" />
    <AdminDonacionesMontos v-else />
  </div>
</template>

<style scoped>
.pestanas { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
.pestanas button { padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ccc; background: transparent; }
.pestanas .activa { background: #6b3fa0; color: #fff; border-color: #6b3fa0; }
</style>
