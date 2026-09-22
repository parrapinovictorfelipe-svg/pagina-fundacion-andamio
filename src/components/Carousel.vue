<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  fotos: { type: Array, required: true }, // [{ src, alt }]
  autoplay: { type: Boolean, default: true },
  intervalo: { type: Number, default: 4500 },
})

const actual = ref(0)
let temporizador = null

function ir(i) {
  actual.value = (i + props.fotos.length) % props.fotos.length
}
function siguiente() { ir(actual.value + 1) }
function anterior() { ir(actual.value - 1) }

function iniciar() {
  detener()
  if (props.autoplay && props.fotos.length > 1) {
    temporizador = setInterval(siguiente, props.intervalo)
  }
}
function detener() {
  if (temporizador) clearInterval(temporizador)
  temporizador = null
}

onMounted(iniciar)
onBeforeUnmount(detener)
</script>

<template>
  <div
    class="carrusel"
    role="region"
    aria-roledescription="carrusel"
    aria-label="Galería de fotos"
    @mouseenter="detener"
    @mouseleave="iniciar"
  >
    <div class="carrusel__ventana">
      <img
        v-for="(f, i) in fotos"
        :key="f.src"
        :src="f.src"
        :alt="f.alt"
        class="carrusel__foto"
        :class="{ 'carrusel__foto--activa': i === actual }"
        loading="lazy"
      />
    </div>

    <button class="carrusel__flecha carrusel__flecha--izq" aria-label="Foto anterior" @click="anterior">‹</button>
    <button class="carrusel__flecha carrusel__flecha--der" aria-label="Foto siguiente" @click="siguiente">›</button>

    <div class="carrusel__puntos">
      <button
        v-for="(f, i) in fotos"
        :key="f.src"
        class="carrusel__punto"
        :class="{ 'carrusel__punto--activo': i === actual }"
        :aria-label="'Ir a la foto ' + (i + 1)"
        @click="ir(i)"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.carrusel {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: var(--radio);
  overflow: hidden;
  background: var(--noche);
}

.carrusel__ventana { position: relative; width: 100%; height: 100%; }

.carrusel__foto {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.6s ease;
}
.carrusel__foto--activa { opacity: 1; }

.carrusel__flecha {
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: rgba(15, 8, 26, 0.55);
  color: var(--blanco);
  font-size: 1.4rem;
  line-height: 1;
  display: grid;
  place-items: center;
  backdrop-filter: blur(2px);
}
.carrusel__flecha:hover { background: rgba(107, 33, 168, 0.85); }
.carrusel__flecha--izq { left: 0.85rem; }
.carrusel__flecha--der { right: 0.85rem; }

.carrusel__puntos {
  position: absolute;
  bottom: 0.9rem;
  left: 50%;
  translate: -50% 0;
  display: flex;
  gap: 0.4rem;
}

.carrusel__punto {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.45);
  padding: 0;
}
.carrusel__punto--activo { background: var(--blanco); width: 20px; border-radius: 4px; }

@media (max-width: 640px) {
  .carrusel { aspect-ratio: 4 / 5; }
}
</style>