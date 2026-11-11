<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const donaciones = ref([])
const cargando = ref(true)
const error = ref('')
const estados = ['pendiente', 'aprobada', 'rechazada']

function pesos(n) {
  return '$' + Number(n).toLocaleString('es-CO')
}
function fecha(f) {
  return f ? new Date(f).toLocaleString('es-CO') : ''
}

async function cargar() {
  cargando.value = true
  const { data, error: err } = await supabase
    .from('donaciones')
    .select('*')
    .order('created_at', { ascending: false })
  if (err) error.value = err.message
  else donaciones.value = data
  cargando.value = false
}

async function cambiarEstado(d, estado) {
  const { error: err } = await supabase.from('donaciones').update({ estado }).eq('id', d.id)
  if (err) {
    error.value = err.message
    return
  }
  d.estado = estado
}

onMounted(cargar)
</script>

<template>
  <div>
    <p v-if="cargando">Cargando donaciones...</p>
    <p v-else-if="error" class="err">{{ error }}</p>
    <p v-else-if="!donaciones.length">Aún no hay donaciones registradas.</p>
    <div v-else class="tabla-wrap">
      <table class="tabla">
        <thead>
          <tr>
            <th>Código</th>
            <th>Fecha</th>
            <th>Donante</th>
            <th>Correo</th>
            <th>Monto</th>
            <th>Frecuencia</th>
            <th>Mensaje</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in donaciones" :key="d.id">
            <td>{{ d.codigo }}</td>
            <td>{{ fecha(d.created_at) }}</td>
            <td>{{ d.nombre || 'Anónimo' }}</td>
            <td>{{ d.email }}</td>
            <td>{{ pesos(d.monto) }}</td>
            <td>{{ d.frecuencia }}</td>
            <td>{{ d.mensaje }}</td>
            <td>
              <select :value="d.estado" @change="cambiarEstado(d, $event.target.value)">
                <option v-for="e in estados" :key="e" :value="e">{{ e }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <button class="btn-adm" @click="cargar">Actualizar</button>
  </div>
</template>

<style scoped>
.tabla-wrap { overflow-x: auto; margin-bottom: 1rem; }
.tabla { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.tabla th, .tabla td { text-align: left; padding: 0.6rem 0.75rem; border-bottom: 1px solid #ddd; }
.err { color: #b34242; }
.btn-adm { padding: 0.5rem 1rem; cursor: pointer; }
</style>
