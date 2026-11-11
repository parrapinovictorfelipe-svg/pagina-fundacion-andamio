<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const montos = ref([])
const cargando = ref(true)
const error = ref('')
const mensaje = ref('')
const nuevo = ref({ monto: '', impacto: '', link_pago: '', orden: 0 })

async function cargar() {
  cargando.value = true
  const { data, error: err } = await supabase
    .from('donacion_montos')
    .select('*')
    .order('orden', { ascending: true })
    .order('monto', { ascending: true })
  if (err) error.value = err.message
  else montos.value = data
  cargando.value = false
}

async function guardar(m) {
  error.value = ''
  mensaje.value = ''
  const { error: err } = await supabase
    .from('donacion_montos')
    .update({
      monto: Number(m.monto),
      impacto: m.impacto || null,
      link_pago: m.link_pago || null,
      orden: Number(m.orden) || 0,
      activo: m.activo,
    })
    .eq('id', m.id)
  if (err) error.value = err.message
  else mensaje.value = 'Guardado'
}

async function crear() {
  error.value = ''
  mensaje.value = ''
  if (!(Number(nuevo.value.monto) > 0)) {
    error.value = 'Escribe un monto mayor a 0'
    return
  }
  const { error: err } = await supabase.from('donacion_montos').insert({
    monto: Number(nuevo.value.monto),
    impacto: nuevo.value.impacto || null,
    link_pago: nuevo.value.link_pago || null,
    orden: Number(nuevo.value.orden) || 0,
    activo: true,
  })
  if (err) {
    error.value = err.message
    return
  }
  nuevo.value = { monto: '', impacto: '', link_pago: '', orden: 0 }
  mensaje.value = 'Monto creado'
  cargar()
}

async function borrar(m) {
  if (!confirm('¿Borrar el monto ' + m.monto + '?')) return
  const { error: err } = await supabase.from('donacion_montos').delete().eq('id', m.id)
  if (err) error.value = err.message
  else cargar()
}

onMounted(cargar)
</script>

<template>
  <div>
    <p v-if="cargando">Cargando montos...</p>
    <p v-if="error" class="err">{{ error }}</p>
    <p v-if="mensaje" class="ok">{{ mensaje }}</p>

    <div v-for="m in montos" :key="m.id" class="fila">
      <label>Monto <input v-model="m.monto" type="number" min="1" /></label>
      <label>Qué logra <input v-model="m.impacto" type="text" placeholder="Qué se financia con este aporte" /></label>
      <label>Link de pago (Wompi) <input v-model="m.link_pago" type="url" placeholder="https://checkout.wompi.co/l/..." /></label>
      <label>Orden <input v-model="m.orden" type="number" /></label>
      <label class="check"><input v-model="m.activo" type="checkbox" /> Activo</label>
      <button @click="guardar(m)">Guardar</button>
      <button class="peligro" @click="borrar(m)">Borrar</button>
    </div>

    <h3>Agregar monto</h3>
    <div class="fila">
      <label>Monto <input v-model="nuevo.monto" type="number" min="1" /></label>
      <label>Qué logra <input v-model="nuevo.impacto" type="text" /></label>
      <label>Link de pago (Wompi) <input v-model="nuevo.link_pago" type="url" /></label>
      <label>Orden <input v-model="nuevo.orden" type="number" /></label>
      <button @click="crear">Agregar</button>
    </div>
  </div>
</template>

<style scoped>
.fila { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: flex-end; padding: 1rem 0; border-bottom: 1px solid #ddd; }
.fila label { display: flex; flex-direction: column; font-size: 0.8rem; gap: 0.25rem; }
.fila input[type='text'], .fila input[type='url'], .fila input[type='number'] { padding: 0.4rem; min-width: 8rem; }
.fila .check { flex-direction: row; align-items: center; }
.fila button { padding: 0.5rem 1rem; cursor: pointer; }
.peligro { color: #b34242; }
.err { color: #b34242; }
.ok { color: #2e7d32; }
</style>
