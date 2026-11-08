<script setup>
import { ref } from 'vue'
import AdminCompras from '@/components/AdminCompras.vue'
import AdminHorarios from '@/components/AdminHorarios.vue'
import AdminPrecios from '@/components/AdminPrecios.vue'

const pestana = ref('compras')
const pestanas = [
  { id: 'compras', nombre: 'Compras' },
  { id: 'horarios', nombre: 'Fechas y horarios' },
  { id: 'precios', nombre: 'Plantilla y pago' },
]
</script>

<template>
  <section>
    <h1 class="titulo-l">Boletería</h1>

    <div class="pestanas">
      <button
        v-for="p in pestanas"
        :key="p.id"
        class="pestana"
        :class="{ 'pestana--activa': pestana === p.id }"
        @click="pestana = p.id"
      >
        {{ p.nombre }}
      </button>
    </div>

    <div class="cuerpo">
      <AdminCompras v-if="pestana === 'compras'" />
      <AdminHorarios v-else-if="pestana === 'horarios'" />
      <AdminPrecios v-else />
    </div>
  </section>
</template>

<style scoped>
.pestanas {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--borde-claro);
  margin: 1.25rem 0 1.75rem;
  overflow-x: auto;
}
.pestana {
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 0.7rem 1.1rem;
  font-size: 0.92rem;
  color: var(--gris);
  cursor: pointer;
  white-space: nowrap;
}
.pestana:hover { color: var(--tinta); }
.pestana--activa {
  border-bottom-color: var(--morado-acento);
  color: var(--morado-acento);
  font-weight: 600;
}
.cuerpo :deep(.titulo-l) { display: none; }
</style>
