<script setup>
import { ref } from 'vue'
import AdminSolicitudes from '@/components/AdminSolicitudes.vue'
import AdminTalleres from '@/components/AdminTalleres.vue'

const pestana = ref('solicitudes')
const pestanas = [
  { id: 'solicitudes', nombre: 'Solicitudes' },
  { id: 'talleres', nombre: 'Talleres y programas' },
]
</script>

<template>
  <section>
    <h1 class="titulo-l">Inscripciones</h1>

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
      <AdminSolicitudes v-if="pestana === 'solicitudes'" />
      <AdminTalleres v-else />
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
