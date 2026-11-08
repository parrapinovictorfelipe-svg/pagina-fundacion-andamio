<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const cargo = ref('')
const instrucciones = ref('')
const mensajeGratis = ref('')
const mensaje = ref('')
const guardando = ref(false)

async function cargar() {
  const { data, error } = await supabase.from('configuracion').select('clave, valor')
  if (error) {
    mensaje.value = 'Error al cargar: ' + error.message
    return
  }
  for (const f of data) {
    if (f.clave === 'cargo_servicio') cargo.value = f.valor || '0'
    if (f.clave === 'instrucciones_pago') instrucciones.value = f.valor || ''
    if (f.clave === 'mensaje_gratis') mensajeGratis.value = f.valor || ''
  }
}

async function guardar() {
  guardando.value = true
  mensaje.value = ''
  const { error } = await supabase.from('configuracion').upsert([
    { clave: 'cargo_servicio', valor: String(Number(cargo.value) || 0) },
    { clave: 'instrucciones_pago', valor: instrucciones.value.trim() },
    { clave: 'mensaje_gratis', valor: mensajeGratis.value.trim() }
  ])
  guardando.value = false
  mensaje.value = error ? 'Error: ' + error.message : 'Guardado correctamente.'
}

onMounted(cargar)
</script>

<template>
  <div class="tarjeta bloque">
    <p class="etiqueta">Cargo, pago y funciones gratuitas</p>
    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>
    <form class="campos" @submit.prevent="guardar">
      <label>Cargo por servicio de las fechas nuevas (COP)
        <input v-model="cargo" type="number" min="0" step="500" />
      </label>
      <label>Cómo se paga (se muestra a quien reserva)
        <textarea v-model="instrucciones" rows="4"></textarea>
      </label>
      <label>Mensaje para funciones gratuitas (se muestra en lugar de la compra)
        <textarea v-model="mensajeGratis" rows="3"></textarea>
      </label>
      <div>
        <button type="submit" class="accion accion--principal" :disabled="guardando">
          {{ guardando ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.bloque { padding: 1.5rem; margin-top: 1.5rem; }
.mensaje { font-size: 0.9rem; margin: 0.5rem 0 0; color: var(--morado-acento); }
.campos { display: grid; gap: 1rem; margin-top: 1rem; max-width: 560px; }
.campos label { display: grid; gap: 0.35rem; font-size: 0.85rem; color: var(--gris); }
.campos input,
.campos textarea {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  font-size: 0.95rem;
  font-family: inherit;
}
.accion {
  background: transparent;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
  color: var(--gris);
  cursor: pointer;
}
.accion:disabled { opacity: 0.5; cursor: default; }
.accion--principal {
  background: var(--morado-acento);
  border-color: var(--morado-acento);
  color: var(--blanco);
}
</style>
