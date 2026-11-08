<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

defineEmits(['ir'])

const cargando = ref(true)
const error = ref('')

const pendientes = ref([])
const totalPendientes = ref(0)
const boletasMes = ref(0)
const donacionesMes = ref(0)
const inscripciones = ref(0)
const proximas = ref([])
const totalProximas = ref(0)
const vendidas = ref({})

const mes = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
const pesos = (n) => '$' + Number(n || 0).toLocaleString('es-CO')
const formatoFecha = (iso) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

function disponibles(f) {
  return Math.max(0, (f.aforo || 0) - (vendidas.value[f.id] || 0))
}

async function cargar() {
  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString()
  try {
    const [rPend, rAprob, rDon, rIns, rFunc, rCupos] = await Promise.all([
      supabase
        .from('compras')
        .select('id, codigo, nombre, total, created_at, funciones(fecha, obras(titulo))', { count: 'exact' })
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('compras')
        .select('compra_items(cantidad)')
        .eq('estado', 'aprobado')
        .gte('created_at', inicioMes),
      supabase.from('donaciones').select('monto').eq('estado', 'aprobado').gte('created_at', inicioMes),
      supabase.from('inscripciones').select('*', { count: 'exact', head: true }),
      supabase
        .from('funciones')
        .select('id, fecha, sala, aforo, obras(titulo)', { count: 'exact' })
        .gte('fecha', ahora.toISOString())
        .order('fecha', { ascending: true })
        .limit(5),
      supabase.rpc('cupos_funciones'),
    ])
    for (const r of [rPend, rAprob, rDon, rIns, rFunc]) if (r.error) throw r.error

    pendientes.value = rPend.data
    totalPendientes.value = rPend.count || 0
    boletasMes.value = rAprob.data.reduce(
      (s, c) => s + (c.compra_items || []).reduce((a, i) => a + i.cantidad, 0),
      0
    )
    donacionesMes.value = rDon.data.reduce((s, d) => s + Number(d.monto || 0), 0)
    inscripciones.value = rIns.count || 0
    proximas.value = rFunc.data
    totalProximas.value = rFunc.count || 0

    const mapa = {}
    for (const c of rCupos.data || []) mapa[c.funcion_id] = Number(c.vendidas)
    vendidas.value = mapa
  } catch (e) {
    error.value = 'Error al cargar: ' + e.message
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <section>
    <h1 class="titulo-l">Dashboard</h1>
    <p class="subtitulo">Resumen de actividad — {{ mes }}</p>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="cargando">Cargando...</p>

    <template v-else>
      <div class="metricas">
        <div class="tarjeta metrica">
          <p class="metrica__titulo">Compras por aprobar</p>
          <p class="metrica__valor">{{ totalPendientes }}</p>
          <p class="metrica__nota">esperando confirmación de pago</p>
        </div>
        <div class="tarjeta metrica">
          <p class="metrica__titulo">Boletas vendidas</p>
          <p class="metrica__valor">{{ boletasMes }}</p>
          <p class="metrica__nota">aprobadas este mes</p>
        </div>
        <div class="tarjeta metrica">
          <p class="metrica__titulo">Donaciones</p>
          <p class="metrica__valor">{{ pesos(donacionesMes) }}</p>
          <p class="metrica__nota">aprobadas este mes</p>
        </div>
        <div class="tarjeta metrica">
          <p class="metrica__titulo">Inscripciones</p>
          <p class="metrica__valor">{{ inscripciones }}</p>
          <p class="metrica__nota">recibidas en total</p>
        </div>
        <div class="tarjeta metrica">
          <p class="metrica__titulo">Funciones próximas</p>
          <p class="metrica__valor">{{ totalProximas }}</p>
          <p class="metrica__nota">con fecha futura</p>
        </div>
      </div>

      <div class="dos-columnas">
        <div class="tarjeta">
          <p class="etiqueta">Compras por aprobar</p>
          <p v-if="pendientes.length === 0" class="vacio">No hay compras pendientes.</p>
          <ul v-else class="lista">
            <li v-for="c in pendientes" :key="c.id" class="lista__fila">
              <div>
                <p class="lista__principal">{{ c.nombre }} · {{ c.codigo }}</p>
                <p class="lista__secundario">{{ c.funciones?.obras?.titulo || 'Función eliminada' }}</p>
              </div>
              <span class="lista__monto">{{ pesos(c.total) }}</span>
            </li>
          </ul>
          <button v-if="pendientes.length" class="enlace" @click="$emit('ir', 'boleteria')">
            Ver todas →
          </button>
        </div>

        <div class="tarjeta">
          <p class="etiqueta">Próximas funciones</p>
          <p v-if="proximas.length === 0" class="vacio">
            No hay funciones próximas. Crea una en Boletería → Fechas y horarios.
          </p>
          <ul v-else class="lista">
            <li v-for="f in proximas" :key="f.id" class="lista__fila">
              <div>
                <p class="lista__principal">{{ f.obras?.titulo || 'Sin obra asignada' }}</p>
                <p class="lista__secundario">{{ formatoFecha(f.fecha) }} · {{ f.sala }}</p>
              </div>
              <span class="lista__monto">{{ disponibles(f) }} libres</span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.subtitulo {
  color: var(--gris);
  font-size: 0.95rem;
  margin: 0.5rem 0 2.5rem;
  text-transform: capitalize;
}
.error { color: #b34242; }
.vacio { font-size: 0.9rem; color: var(--gris); margin: 1rem 0 0; }

.metricas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}
.metrica { padding: 1.5rem; }
.metrica__titulo {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: var(--gris);
  margin: 0 0 0.75rem;
}
.metrica__valor {
  font-family: var(--serif);
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--morado-acento);
  margin: 0 0 0.5rem;
}
.metrica__nota {
  font-family: var(--mono);
  font-size: 0.72rem;
  color: var(--gris);
  margin: 0;
}

.dos-columnas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}
.lista { list-style: none; margin: 0; padding: 0; }
.lista__fila {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.85rem;
  border-bottom: 1px solid var(--borde-claro);
}
.lista__fila:last-child { border-bottom: none; }
.lista__principal { font-weight: 600; font-size: 0.92rem; margin: 0; }
.lista__secundario { font-size: 0.8rem; color: var(--gris); margin: 0; }
.lista__monto {
  font-family: var(--mono);
  font-size: 0.88rem;
  color: var(--morado-acento);
  white-space: nowrap;
}
.enlace {
  margin-top: 0.75rem;
  background: none;
  border: none;
  padding: 0;
  font-size: 0.85rem;
  color: var(--morado-acento);
  cursor: pointer;
}

@media (max-width: 1000px) {
  .dos-columnas { grid-template-columns: 1fr; }
}
</style>
