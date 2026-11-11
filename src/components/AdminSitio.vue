<script setup>
import { ref } from 'vue'
import AdminContenido from '@/components/AdminContenido.vue'
import AdminCarrusel from '@/components/AdminCarrusel.vue'
import AdminEnlaces from '@/components/AdminEnlaces.vue'

const pestana = ref('textos')
const pestanas = [
  { id: 'textos', nombre: 'Textos e imágenes' },
  { id: 'navegacion', nombre: 'Navegación y pie de página' },
  { id: 'portada', nombre: 'Portada' },
  { id: 'galeria', nombre: 'Galería' },
]
</script>

<template>
  <section>
    <h1 class="titulo-l">Sitio web</h1>

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
      <AdminContenido v-if="pestana === 'textos'" key="textos" :excluir="['nav.', 'pie.']" />
      <template v-else-if="pestana === 'navegacion'">
        <AdminContenido key="navegacion" :incluir="['nav.', 'pie.']" />
        <AdminEnlaces />
      </template>
      <AdminCarrusel v-else-if="pestana === 'portada'" key="portada" seccion="portada" />
      <AdminCarrusel v-else key="galeria" seccion="galeria" />
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
