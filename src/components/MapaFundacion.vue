<script setup>
import { computed } from 'vue'
import { useContenido } from '@/lib/contenido'

const { t } = useContenido()

// Acepta el código completo de "Insertar un mapa" o solo la dirección del mapa.
// Por seguridad, solo se muestran mapas que vengan de Google Maps.
const mapaSrc = computed(() => {
  const crudo = t('home.mapa.embed').trim()
  if (!crudo) return ''
  const m = crudo.match(/src\s*=\s*["']([^"']+)["']/i)
  const url = (m ? m[1] : crudo).replace(/&amp;/g, '&')
  return url.startsWith('https://www.google.com/maps/embed') ? url : ''
})

const enlace = computed(() => {
  const u = t('home.mapa.enlace').trim()
  return u.startsWith('https://') ? u : ''
})
</script>

<template>
  <section v-if="mapaSrc" class="seccion seccion--clara">
    <div class="contenedor mapa">
      <div class="mapa__texto">
        <p class="etiqueta">{{ t('home.mapa.etiqueta') }}</p>
        <h2 class="titulo-l mapa__titulo">{{ t('home.mapa.titulo') }}</h2>
        <p v-if="t('home.mapa.texto')" class="parrafo">{{ t('home.mapa.texto') }}</p>
        <p v-if="t('home.mapa.direccion')" class="mapa__dato">{{ t('home.mapa.direccion') }}</p>
        <p v-if="t('home.mapa.horario')" class="mapa__dato">{{ t('home.mapa.horario') }}</p>
        <a v-if="enlace" :href="enlace" target="_blank" rel="noopener" class="btn btn--morado">
          {{ t('home.mapa.boton') || 'Cómo llegar' }}
        </a>
      </div>

      <iframe
        class="mapa__marco"
        :src="mapaSrc"
        title="Mapa con la ubicación de Fundación Andamio"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen
      ></iframe>
    </div>
  </section>
</template>

<style scoped>
.mapa {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
}
.mapa__titulo { margin-bottom: 1.25rem; }
.mapa__dato {
  font-size: 0.95rem;
  color: var(--gris);
  margin: 0 0 0.5rem;
}
.mapa__texto .btn { margin-top: 1.25rem; display: inline-block; }
.mapa__marco {
  width: 100%;
  height: 420px;
  border: 0;
  border-radius: var(--radio);
  background: var(--claro);
}

@media (max-width: 900px) {
  .mapa { grid-template-columns: 1fr; }
  .mapa__marco { height: 320px; }
}
</style>
