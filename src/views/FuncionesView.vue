<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const funciones = ref([])
const cargando = ref(true)
const error = ref(null)

const formatoFecha = (iso) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })

const formatoPrecio = (valor) => Number(valor || 0).toLocaleString('es-CO')

const obtenerFunciones = async () => {
  try {
    cargando.value = true
    const { data, error: errSupabase } = await supabase
      .from('funciones')
      .select('*')
      .order('fecha', { ascending: true })

    if (errSupabase) throw errSupabase
    funciones.value = data
  } catch (err) {
    console.error('Error al cargar:', err.message)
    error.value = 'No se pudieron cargar las funciones en este momento.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  obtenerFunciones()
})
</script>

<template>
  <div class="container">
    <h2>Próximas Funciones - Fundación Andamio</h2>

    <div v-if="cargando" class="state-msg">Cargando próximas funciones...</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <div v-else-if="funciones.length === 0" class="state-msg">
      Pronto anunciaremos nuevas funciones.
    </div>

    <div v-else class="grid-funciones">
      <div v-for="funcion in funciones" :key="funcion.id" class="card">
        <img v-if="funcion.imagen_url" :src="funcion.imagen_url" :alt="funcion.titulo" class="foto" />
        <h3>{{ funcion.titulo }}</h3>
        <p v-if="funcion.categoria"><strong>Categoría:</strong> {{ funcion.categoria }}</p>
        <p><strong>Sala:</strong> {{ funcion.sala }}</p>
        <p><strong>Fecha:</strong> {{ formatoFecha(funcion.fecha) }}</p>
        <p class="precio">$ {{ formatoPrecio(funcion.precio) }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
  background-color: #32065A;
  color: #fff;
  min-height: 100vh;
}
.grid-funciones {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.card {
  background: #fff;
  color: #333;
  padding: 20px;
  border-radius: 8px;
}
.foto {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 12px;
}
.precio {
  font-weight: bold;
  color: #6A22AA;
}
.state-msg {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 40px;
}
.error {
  color: #ff6b6b;
}
</style>
