<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const compras = ref([])
const cargando = ref(true)
const mensaje = ref('')
const filtro = ref('todas')

const pesos = (n) => '$' + Number(n || 0).toLocaleString('es-CO')
const formatoFecha = (iso) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

const filtradas = computed(() =>
  filtro.value === 'todas' ? compras.value : compras.value.filter((c) => c.estado === filtro.value)
)
const pendientes = computed(() => compras.value.filter((c) => c.estado === 'pendiente').length)

const detalle = (c) => (c.compra_items || []).map((i) => `${i.tipo} × ${i.cantidad}`).join(', ')

async function cargar() {
  cargando.value = true
  const { data, error } = await supabase
    .from('compras')
    .select('*, funciones(fecha, sala, obras(titulo)), compra_items(tipo, cantidad, valor)')
    .order('created_at', { ascending: false })
  if (error) mensaje.value = 'Error al cargar: ' + error.message
  else compras.value = data
  cargando.value = false
}

async function cambiarEstado(c, estado) {
  mensaje.value = ''
  const { error } = await supabase.from('compras').update({ estado }).eq('id', c.id)
  if (error) mensaje.value = 'Error: ' + error.message
  else c.estado = estado
}

async function borrar(c) {
  if (!confirm(`¿Borrar la compra ${c.codigo}? Esta acción no se puede deshacer. Si solo quieres liberar los cupos, mejor cancélala.`)) return
  const { error } = await supabase.from('compras').delete().eq('id', c.id)
  if (error) mensaje.value = 'Error: ' + error.message
  else await cargar()
}

onMounted(cargar)
</script>

<template>
  <section>
    <div class="encabezado">
      <div>
        <h1 class="titulo-l">Boletería</h1>
        <p class="subtitulo">Compras registradas desde el sitio</p>
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
      <button class="accion" :class="{ 'accion--activa': filtro === 'cancelado' }" @click="filtro = 'cancelado'">Canceladas</button>
    </div>

    <p v-if="cargando">Cargando compras...</p>
    <p v-else-if="filtradas.length === 0">Todavía no hay compras en esta lista.</p>

    <div v-else class="tarjeta tabla-caja">
      <table class="tabla">
        <thead>
          <tr>
            <th>Código</th>
            <th>Comprador</th>
            <th>Función</th>
            <th>Boletas</th>
            <th>Estado</th>
            <th class="tabla__derecha">Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtradas" :key="c.id">
            <td class="tabla__mono tabla__fuerte">
              {{ c.codigo }}
              <span class="secundario">{{ formatoFecha(c.created_at) }}</span>
            </td>
            <td>
              {{ c.nombre }}
              <span class="secundario">{{ c.correo }}</span>
              <span v-if="c.telefono" class="secundario">{{ c.telefono }}</span>
              <span v-if="c.documento" class="secundario">Doc. {{ c.documento }}</span>
            </td>
            <td>
              <template v-if="c.funciones">
                {{ c.funciones.obras?.titulo || 'Sin obra' }}
                <span class="secundario">{{ formatoFecha(c.funciones.fecha) }} · {{ c.funciones.sala }}</span>
              </template>
              <span v-else class="secundario">Función eliminada</span>
            </td>
            <td>{{ detalle(c) }}</td>
            <td><span class="badge" :class="'badge--' + c.estado">{{ c.estado }}</span></td>
            <td class="tabla__derecha tabla__monto">{{ pesos(c.total) }}</td>
            <td>
              <div class="acciones">
                <button v-if="c.estado !== 'aprobado'" class="accion accion--principal" @click="cambiarEstado(c, 'aprobado')">Aprobar</button>
                <button v-if="c.estado !== 'cancelado'" class="accion" @click="cambiarEstado(c, 'cancelado')">Cancelar</button>
                <button class="accion accion--peligro" @click="borrar(c)">Borrar</button>
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
.tabla__mono { font-family: var(--mono); font-size: 0.82rem; }
.tabla__derecha { text-align: right; }
.tabla__monto { font-family: var(--mono); color: var(--morado-acento); }
.secundario { display: block; font-size: 0.78rem; font-weight: 400; color: var(--gris); }

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
