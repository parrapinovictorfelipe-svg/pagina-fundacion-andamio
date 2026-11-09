<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const solicitudes = ref([])
const cargando = ref(true)
const mensaje = ref('')
const filtro = ref('todas')

const formatoFecha = (iso) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

const filtradas = computed(() =>
  filtro.value === 'todas' ? solicitudes.value : solicitudes.value.filter((s) => s.estado === filtro.value)
)
const pendientes = computed(() => solicitudes.value.filter((s) => s.estado === 'pendiente').length)

async function cargar() {
  cargando.value = true
  const { data, error } = await supabase
    .from('inscripciones')
    .select('*, talleres(nombre)')
    .order('created_at', { ascending: false })
  if (error) mensaje.value = 'Error al cargar: ' + error.message
  else solicitudes.value = data
  cargando.value = false
}

async function cambiarEstado(s, estado) {
  mensaje.value = ''
  const { error } = await supabase.from('inscripciones').update({ estado }).eq('id', s.id)
  if (error) mensaje.value = 'Error: ' + error.message
  else s.estado = estado
}

async function borrar(s) {
  if (!confirm(`¿Borrar la solicitud de ${s.nombre}? Esta acción no se puede deshacer. Si solo quieres liberar el cupo, mejor recházala.`)) return
  const { error } = await supabase.from('inscripciones').delete().eq('id', s.id)
  if (error) mensaje.value = 'Error: ' + error.message
  else await cargar()
}

onMounted(cargar)
</script>

<template>
  <section>
    <div class="encabezado">
      <div>
        <h1 class="titulo-l">Solicitudes</h1>
        <p class="subtitulo">Personas que se inscribieron desde el sitio</p>
      </div>
      <button class="accion" @click="cargar">Actualizar</button>
    </div>

    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>

    <div class="filtros">
      <button class="accion" :class="{ 'accion--activa': filtro === 'todas' }" @click="filtro = 'todas'">Todas</button>
      <button class="accion" :class="{ 'accion--activa': filtro === 'pendiente' }" @click="filtro = 'pendiente'">
        Pendientes ({{ pendientes }})
      </button>
      <button class="accion" :class="{ 'accion--activa': filtro === 'aprobado' }" @click="filtro = 'aprobado'">Aprobadas</button>
      <button class="accion" :class="{ 'accion--activa': filtro === 'rechazado' }" @click="filtro = 'rechazado'">Rechazadas</button>
    </div>

    <p v-if="cargando">Cargando solicitudes...</p>
    <p v-else-if="filtradas.length === 0">Todavía no hay solicitudes en esta lista.</p>

    <div v-else class="tarjeta tabla-caja">
      <table class="tabla">
        <thead>
          <tr>
            <th>Solicitante</th>
            <th>Programa</th>
            <th>Detalle</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filtradas" :key="s.id">
            <td class="tabla__fuerte">
              {{ s.nombre }}
              <span class="secundario">{{ s.email }}</span>
              <span class="secundario">{{ s.telefono }}</span>
              <span class="secundario">Doc. {{ s.documento }} · {{ s.edad }} años</span>
              <span v-if="s.acudiente" class="secundario">Acudiente: {{ s.acudiente }}</span>
            </td>
            <td>
              {{ s.talleres?.nombre || s.taller_nombre || 'Programa eliminado' }}
              <span class="secundario">{{ formatoFecha(s.created_at) }}</span>
            </td>
            <td class="detalle">
              <span v-if="s.experiencia" class="secundario">Experiencia: {{ s.experiencia }}</span>
              <details v-if="s.motivacion">
                <summary>Ver por qué quiere participar</summary>
                {{ s.motivacion }}
              </details>
            </td>
            <td><span class="badge" :class="'badge--' + s.estado">{{ s.estado }}</span></td>
            <td>
              <div class="acciones">
                <button v-if="s.estado !== 'aprobado'" class="accion accion--principal" @click="cambiarEstado(s, 'aprobado')">Aprobar</button>
                <button v-if="s.estado !== 'rechazado'" class="accion" @click="cambiarEstado(s, 'rechazado')">Rechazar</button>
                <button class="accion accion--peligro" @click="borrar(s)">Borrar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}
.subtitulo {
  color: var(--gris);
  font-size: 0.95rem;
  margin: 0.5rem 0 1.5rem;
}
.mensaje {
  font-size: 0.9rem;
  margin: 0 0 1rem;
  color: var(--morado-acento);
}
.filtros { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem; }

.tabla-caja { padding: 0; overflow-x: auto; }
.tabla { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.tabla th {
  text-align: left;
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 400;
  color: var(--gris);
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--borde-claro);
  white-space: nowrap;
}
.tabla td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--borde-claro);
  vertical-align: top;
}
.tabla tbody tr:last-child td { border-bottom: none; }
.tabla tbody tr:hover { background: var(--claro); }
.tabla__fuerte { font-weight: 600; }
.secundario { display: block; font-size: 0.78rem; font-weight: 400; color: var(--gris); }
.detalle { max-width: 280px; font-size: 0.85rem; }
.detalle summary { cursor: pointer; color: var(--morado-acento); font-size: 0.8rem; }

.acciones { display: flex; gap: 0.5rem; justify-content: flex-end; flex-wrap: wrap; }
.accion {
  background: transparent;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  padding: 0.35rem 0.85rem;
  font-size: 0.8rem;
  color: var(--gris);
  cursor: pointer;
  transition: all 0.18s ease;
}
.accion:hover { border-color: var(--morado-acento); color: var(--morado-acento); }
.accion--activa { border-color: var(--morado-acento); color: var(--morado-acento); background: var(--lila-fondo); }
.accion--principal {
  background: var(--morado-acento);
  border-color: var(--morado-acento);
  color: var(--blanco);
}
.accion--principal:hover { background: var(--morado-vivo); color: var(--blanco); }
.accion--peligro:hover { border-color: #b34242; color: #b34242; }
</style>
