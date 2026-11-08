<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '@/lib/supabase'

const obras = ref([])
const cargando = ref(true)
const error = ref(null)

const obtenerObras = async () => {
  try {
    cargando.value = true
    const { data, error: errSupabase } = await supabase
      .from('obras')
      .select('*')
      .eq('activa', true)
      .order('titulo', { ascending: true })

    if (errSupabase) throw errSupabase
    obras.value = data
  } catch (err) {
    console.error('Error al cargar:', err.message)
    error.value = 'No se pudieron cargar las funciones en este momento.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  obtenerObras()
})
</script>

<template>
  <div class="container">
    <h2>Nuestras funciones - Fundación Andamio</h2>

    <div v-if="cargando" class="state-msg">Cargando funciones...</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <div v-else-if="obras.length === 0" class="state-msg">
      Pronto publicaremos nuestras funciones.
    </div>

    <div v-else class="grid-funciones">
      <article v-for="obra in obras" :key="obra.id" class="card">
        <img v-if="obra.imagen_url" :src="obra.imagen_url" :alt="obra.titulo" class="foto" />
        <p v-if="obra.genero" class="genero">{{ obra.genero }}</p>
        <h3>{{ obra.titulo }}</h3>
        <p v-if="obra.compania" class="meta">Producción: {{ obra.compania }}</p>
        <p v-if="obra.duracion || obra.publico" class="meta">
          <span v-if="obra.duracion">{{ obra.duracion }}</span>
          <span v-if="obra.duracion && obra.publico"> · </span>
          <span v-if="obra.publico">{{ obra.publico }}</span>
        </p>
        <p v-if="obra.sinopsis" class="sinopsis">{{ obra.sinopsis }}</p>
        <RouterLink :to="{ path: '/boleteria', query: { obra: obra.id } }" class="enlace">
          Ver horarios y comprar boletas →
        </RouterLink>
      </article>
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.card {
  background: #fff;
  color: #333;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}
.foto {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 12px;
}
.genero {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6A22AA;
  margin: 0 0 4px;
}
.meta {
  font-size: 0.85rem;
  color: #666;
  margin: 4px 0 10px;
}
.sinopsis {
  line-height: 1.5;
  margin: 0 0 16px;
}
.enlace {
  margin-top: auto;
  font-weight: bold;
  color: #6A22AA;
  text-decoration: none;
}
.enlace:hover { text-decoration: underline; }
.state-msg {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 40px;
}
.error {
  color: #ff6b6b;
}
</style>
