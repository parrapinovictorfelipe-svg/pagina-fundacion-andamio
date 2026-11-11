<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  fotos: { type: Array, default: () => [] },
  intervalo: { type: Number, default: 5000 },
})

const actual = ref(0)
let temporizador = null

const hayVarias = computed(() => props.fotos.length > 1)

function ir(i) {
  actual.value = (i + props.fotos.length) % props.fotos.length
}
function siguiente() { ir(actual.value + 1) }
function anterior() { ir(actual.value - 1) }

function detener() {
  if (temporizador) {
    clearInterval(temporizador)
    temporizador = null
  }
}
function iniciar() {
  detener()
  if (hayVarias.value) temporizador = setInterval(siguiente, props.intervalo)
}

onMounted(iniciar)
onBeforeUnmount(detener)
watch(() => props.fotos.length, () => {
  actual.value = 0
  iniciar()
})
</script>

<template>
  <div class="slider" @mouseenter="detener" @mouseleave="iniciar">
    <img
      v-for="(f, i) in fotos"
      :key="i"
      :src="f.src"
      :alt="f.alt"
      class="slider__foto"
      :class="{ 'slider__foto--activa': i === actual }"
      :loading="i === 0 ? 'eager' : 'lazy'"
    />

    <template v-if="hayVarias">
      <button class="slider__flecha slider__flecha--izq" aria-label="Foto anterior" @click="anterior">‹</button>
      <button class="slider__flecha slider__flecha--der" aria-label="Foto siguiente" @click="siguiente">›</button>
      <div class="slider__puntos">
        <button
          v-for="(f, i) in fotos"
          :key="'p' + i"
          class="slider__punto"
          :class="{ 'slider__punto--activo': i === actual }"
          :aria-label="'Ir a la foto ' + (i + 1)"
          @click="ir(i)"
        ></button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.slider {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--noche);
}

.slider__foto {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.8s ease;
}
.slider__foto--activa { opacity: 1; }

.slider__flecha {
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
  cursor: pointer;
}
.slider__flecha:hover { background: rgba(107, 33, 168, 0.85); }
.slider__flecha--izq { left: 0.85rem; }
.slider__flecha--der { right: 0.85rem; }

.slider__puntos {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  translate: -50% 0;
  display: flex;
  gap: 0.4rem;
}
.slider__punto {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.45);
  padding: 0;
  cursor: pointer;
}
.slider__punto--activo { background: var(--blanco); width: 20px; border-radius: 4px; }
</style>
