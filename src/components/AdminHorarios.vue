<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const horarios = ref([])
const obras = ref([])
const cargando = ref(true)
const mensaje = ref('')
const guardando = ref(false)
const mostrarForm = ref(false)
const editandoId = ref(null)
const boletas = ref([])
const quitados = ref([])
const cargoDefecto = ref(0)

const vacio = () => ({
  obra_id: '',
  fecha: '',
  sala: '',
  aforo: 100,
  cargo_servicio: cargoDefecto.value
})
const form = ref(vacio())

const pesos = (n) => (Number(n) === 0 ? 'Gratis' : '$' + Number(n || 0).toLocaleString('es-CO'))
const formatoFecha = (iso) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

function aInputFecha(iso) {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function vendidas(h) {
  let total = 0
  for (const c of h.compras || []) {
    if (c.estado === 'cancelado') continue
    for (const i of c.compra_items || []) total += i.cantidad
  }
  return total
}

function porcentaje(h) {
  if (!h.aforo) return 0
  return Math.min(100, Math.round((vendidas(h) / h.aforo) * 100))
}

function estado(h) {
  if (new Date(h.fecha) < new Date()) return 'Finalizada'
  const p = porcentaje(h)
  if (p >= 100) return 'Agotada'
  if (p >= 90) return 'Casi llena'
  return 'En venta'
}

function resumenPrecios(h) {
  const activos = (h.tipos_boleta || []).filter((t) => t.activo)
  if (!activos.length) return 'Sin boletas'
  return activos.map((t) => `${t.nombre} ${pesos(t.valor)}`).join(' · ')
}

async function cargar() {
  cargando.value = true
  const [resObras, resHorarios, resConfig] = await Promise.all([
    supabase.from('obras').select('id, titulo').order('titulo', { ascending: true }),
    supabase
      .from('funciones')
      .select('*, obras(titulo), compras(estado, compra_items(cantidad)), tipos_boleta(nombre, valor, activo)'),
    supabase.from('configuracion').select('valor').eq('clave', 'cargo_servicio').maybeSingle()
  ])
  if (resObras.error) mensaje.value = 'Error al cargar obras: ' + resObras.error.message
  else obras.value = resObras.data

  cargoDefecto.value = Number(resConfig.data?.valor) || 0

  if (resHorarios.error) mensaje.value = 'Error al cargar: ' + resHorarios.error.message
  else {
    const ahora = Date.now()
    const futuras = resHorarios.data
      .filter((h) => new Date(h.fecha) >= ahora)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    const pasadas = resHorarios.data
      .filter((h) => new Date(h.fecha) < ahora)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    horarios.value = [...futuras, ...pasadas]
  }
  cargando.value = false
}

async function abrirNueva() {
  editandoId.value = null
  mensaje.value = ''
  form.value = vacio()
  quitados.value = []
  // La plantilla de precios es el punto de partida de cada fecha nueva
  const { data } = await supabase
    .from('tipos_boleta')
    .select('nombre, detalle, valor, orden, activo')
    .is('funcion_id', null)
    .order('orden', { ascending: true })
  boletas.value = (data || []).map((t) => ({ ...t }))
  mostrarForm.value = true
}

async function editar(h) {
  editandoId.value = h.id
  mensaje.value = ''
  form.value = {
    obra_id: h.obra_id || '',
    fecha: aInputFecha(h.fecha),
    sala: h.sala || '',
    aforo: h.aforo || 0,
    cargo_servicio: h.cargo_servicio || 0
  }
  quitados.value = []
  const { data } = await supabase
    .from('tipos_boleta')
    .select('*')
    .eq('funcion_id', h.id)
    .order('orden', { ascending: true })
    .order('id', { ascending: true })
  boletas.value = data || []
  mostrarForm.value = true
}

function cancelar() {
  mostrarForm.value = false
  editandoId.value = null
  boletas.value = []
  quitados.value = []
}

function agregarBoleta() {
  boletas.value.push({ nombre: '', detalle: '', valor: 0, orden: boletas.value.length + 1, activo: true })
}

function quitarBoleta(i) {
  const [b] = boletas.value.splice(i, 1)
  if (b.id) quitados.value.push(b.id)
}

async function guardar() {
  mensaje.value = ''
  if (!form.value.obra_id || !form.value.fecha || !form.value.sala.trim()) {
    mensaje.value = 'Elige la obra y completa la fecha y la sala.'
    return
  }
  if (boletas.value.some((b) => !String(b.nombre || '').trim())) {
    mensaje.value = 'Cada boleta necesita un nombre.'
    return
  }
  guardando.value = true
  try {
    const datos = {
      obra_id: Number(form.value.obra_id),
      fecha: new Date(form.value.fecha).toISOString(),
      sala: form.value.sala.trim(),
      aforo: Number(form.value.aforo) || 0,
      cargo_servicio: Number(form.value.cargo_servicio) || 0
    }

    let id = editandoId.value
    if (id) {
      const { error } = await supabase.from('funciones').update(datos).eq('id', id)
      if (error) throw error
    } else {
      const { data, error } = await supabase.from('funciones').insert(datos).select('id').single()
      if (error) throw error
      id = data.id
    }

    if (quitados.value.length) {
      const { error } = await supabase.from('tipos_boleta').delete().in('id', quitados.value)
      if (error) throw error
    }

    for (const [i, b] of boletas.value.entries()) {
      const fila = {
        funcion_id: id,
        nombre: String(b.nombre).trim(),
        detalle: String(b.detalle || '').trim() || null,
        valor: Number(b.valor) || 0,
        orden: i + 1,
        activo: !!b.activo
      }
      const res = b.id
        ? await supabase.from('tipos_boleta').update(fila).eq('id', b.id)
        : await supabase.from('tipos_boleta').insert(fila)
      if (res.error) throw res.error
    }

    cancelar()
    await cargar()
    mensaje.value = 'Guardado correctamente.'
  } catch (e) {
    mensaje.value = 'Error: ' + e.message
  } finally {
    guardando.value = false
  }
}

async function borrar(h) {
  const compras = vendidas(h)
  const aviso = compras > 0
    ? `Esta fecha ya tiene ${compras} boletas vendidas o reservadas. Si la borras, esas compras quedarán sin función asignada. ¿Seguro que quieres borrarla?`
    : '¿Borrar esta fecha y sus precios?'
  if (!confirm(aviso)) return
  const { error } = await supabase.from('funciones').delete().eq('id', h.id)
  if (error) mensaje.value = 'Error: ' + error.message
  else {
    mensaje.value = 'Fecha borrada.'
    await cargar()
  }
}

onMounted(cargar)
</script>

<template>
  <section>
    <div class="encabezado">
      <div>
        <h1 class="titulo-l">Fechas y horarios</h1>
        <p class="subtitulo">Cuándo y dónde se presenta cada obra, cuántas sillas hay y cuánto cuesta cada boleta</p>
      </div>
      <button class="accion accion--principal" @click="abrirNueva">+ Nueva fecha</button>
    </div>

    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>

    <div v-if="mostrarForm" class="tarjeta formulario">
      <p class="etiqueta">{{ editandoId ? 'Editar fecha' : 'Nueva fecha' }}</p>
      <p v-if="obras.length === 0" class="mensaje">
        Primero crea una obra en la sección Obras.
      </p>
      <form v-else class="campos" @submit.prevent="guardar">
        <label class="campos__ancho">Obra
          <select v-model="form.obra_id" required>
            <option value="" disabled>Elige una obra</option>
            <option v-for="o in obras" :key="o.id" :value="o.id">{{ o.titulo }}</option>
          </select>
        </label>
        <label>Fecha y hora
          <input v-model="form.fecha" type="datetime-local" required />
        </label>
        <label>Sala
          <input v-model="form.sala" placeholder="Sala Principal" required />
        </label>
        <label>Aforo (sillas)
          <input v-model="form.aforo" type="number" min="0" />
        </label>
        <label>Cargo por servicio (COP)
          <input v-model="form.cargo_servicio" type="number" min="0" step="500" />
        </label>

        <div class="campos__ancho boletas">
          <p class="boletas__titulo">Boletas y precios de esta función</p>
          <p class="boletas__nota">
            Cada función tiene sus propios precios. Pon 0 si la entrada es gratuita.
          </p>
          <p v-if="boletas.length === 0" class="boletas__nota">
            Esta función no tiene boletas. Agrega al menos una para que se pueda reservar.
          </p>
          <div v-for="(b, i) in boletas" :key="b.id || 'n' + i" class="boleta">
            <input v-model="b.nombre" placeholder="Nombre (General, Estudiante...)" />
            <input v-model="b.detalle" placeholder="Detalle (opcional)" />
            <input v-model="b.valor" type="number" min="0" step="500" placeholder="Precio" />
            <label class="casilla"><input v-model="b.activo" type="checkbox" /> Activa</label>
            <button type="button" class="accion accion--peligro" @click="quitarBoleta(i)">Quitar</button>
          </div>
          <div>
            <button type="button" class="accion" @click="agregarBoleta">+ Agregar tipo de boleta</button>
          </div>
        </div>

        <div class="campos__ancho botones">
          <button type="submit" class="accion accion--principal" :disabled="guardando">
            {{ guardando ? 'Guardando...' : 'Guardar' }}
          </button>
          <button type="button" class="accion" @click="cancelar">Cancelar</button>
        </div>
      </form>
    </div>

    <p v-if="cargando">Cargando fechas...</p>
    <p v-else-if="horarios.length === 0">Todavía no hay fechas. Crea la primera con "+ Nueva fecha".</p>

    <div v-else class="tarjeta tabla-caja">
      <table class="tabla">
        <thead>
          <tr>
            <th>Obra</th>
            <th>Fecha y hora</th>
            <th>Sala</th>
            <th>Precios</th>
            <th>Aforo</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in horarios" :key="h.id">
            <td class="tabla__fuerte">{{ h.obras?.titulo || h.titulo || 'Sin obra asignada' }}</td>
            <td class="tabla__mono">{{ formatoFecha(h.fecha) }}</td>
            <td>{{ h.sala }}</td>
            <td class="precios">
              {{ resumenPrecios(h) }}
              <span v-if="Number(h.cargo_servicio) > 0" class="secundario">
                + cargo por servicio {{ pesos(h.cargo_servicio) }}
              </span>
            </td>
            <td>
              <div class="aforo">
                <span class="tabla__mono">{{ vendidas(h) }}/{{ h.aforo }}</span>
                <div class="progreso aforo__barra">
                  <div class="progreso__relleno" :style="{ width: porcentaje(h) + '%' }"></div>
                </div>
              </div>
            </td>
            <td><span class="badge">{{ estado(h) }}</span></td>
            <td>
              <div class="acciones">
                <button class="accion" @click="editar(h)">Editar</button>
                <button class="accion accion--peligro" @click="borrar(h)">Borrar</button>
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

.formulario { padding: 1.5rem; margin-bottom: 1.5rem; }
.campos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}
.campos label {
  display: grid;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--gris);
}
.campos__ancho { grid-column: 1 / -1; }
.campos input:not([type="checkbox"]),
.campos select {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  font-size: 0.95rem;
  font-family: inherit;
}
.botones { display: flex; gap: 0.5rem; }

.boletas {
  display: grid;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--borde-claro);
}
.boletas__titulo { font-weight: 600; font-size: 0.95rem; margin: 0; }
.boletas__nota { font-size: 0.82rem; color: var(--gris); margin: 0; }
.boleta {
  display: grid;
  grid-template-columns: 1.4fr 1.4fr 1fr auto auto;
  gap: 0.5rem;
  align-items: center;
}
.campos .casilla {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
}

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
  vertical-align: middle;
}
.tabla tbody tr:last-child td { border-bottom: none; }
.tabla tbody tr:hover { background: var(--claro); }
.tabla__fuerte { font-weight: 600; }
.tabla__mono { font-family: var(--mono); font-size: 0.82rem; }
.precios { font-size: 0.82rem; max-width: 260px; }
.secundario { display: block; font-size: 0.75rem; color: var(--gris); }

.aforo { display: grid; gap: 0.35rem; min-width: 110px; }
.aforo__barra { width: 100%; }

.acciones { display: flex; gap: 0.5rem; justify-content: flex-end; }
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
.accion--principal {
  background: var(--morado-acento);
  border-color: var(--morado-acento);
  color: var(--blanco);
}
.accion--principal:hover { background: var(--morado-vivo); color: var(--blanco); }
.accion--peligro:hover { border-color: #b34242; color: #b34242; }

@media (max-width: 760px) {
  .campos { grid-template-columns: 1fr; }
  .boleta { grid-template-columns: 1fr; }
}
</style>
