<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const funciones = ref([])
const cargando = ref(true)
const mensaje = ref('')
const guardando = ref(false)
const mostrarForm = ref(false)
const editandoId = ref(null)
const archivo = ref(null)
const imagenActual = ref(null)

const vacio = () => ({ titulo: '', categoria: '', sala: '', fecha: '', precio: 0, aforo: 100 })
const form = ref(vacio())

const formatoFecha = (iso) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

const formatoPrecio = (valor) => '$' + Number(valor || 0).toLocaleString('es-CO')

function vendidas(f) {
  return (f.boletas || []).reduce((suma, b) => suma + b.cantidad, 0)
}

function porcentaje(f) {
  if (!f.aforo) return 0
  return Math.min(100, Math.round((vendidas(f) / f.aforo) * 100))
}

function estado(f) {
  const p = porcentaje(f)
  if (p >= 100) return 'Agotado'
  if (p >= 90) return 'Casi lleno'
  return 'En venta'
}

function aInputFecha(iso) {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

async function cargar() {
  cargando.value = true
  const { data, error } = await supabase
    .from('funciones')
    .select('*, boletas(cantidad)')
    .order('fecha', { ascending: true })
  if (error) mensaje.value = 'Error al cargar: ' + error.message
  else funciones.value = data
  cargando.value = false
}

async function subirImagen(file) {
  const nombre = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
  const { error } = await supabase.storage.from('imagenes').upload(nombre, file)
  if (error) throw error
  return supabase.storage.from('imagenes').getPublicUrl(nombre).data.publicUrl
}

function abrirNueva() {
  editandoId.value = null
  form.value = vacio()
  archivo.value = null
  imagenActual.value = null
  mensaje.value = ''
  mostrarForm.value = true
}

function editar(f) {
  editandoId.value = f.id
  form.value = {
    titulo: f.titulo || '',
    categoria: f.categoria || '',
    sala: f.sala || '',
    fecha: aInputFecha(f.fecha),
    precio: f.precio || 0,
    aforo: f.aforo || 0
  }
  archivo.value = null
  imagenActual.value = f.imagen_url
  mensaje.value = ''
  mostrarForm.value = true
}

function cancelar() {
  mostrarForm.value = false
  editandoId.value = null
  archivo.value = null
  imagenActual.value = null
}

async function guardar() {
  mensaje.value = ''
  if (!form.value.titulo || !form.value.sala || !form.value.fecha) {
    mensaje.value = 'Completa título, sala y fecha.'
    return
  }
  guardando.value = true
  try {
    const datos = {
      titulo: form.value.titulo.trim(),
      categoria: form.value.categoria.trim() || null,
      sala: form.value.sala.trim(),
      fecha: new Date(form.value.fecha).toISOString(),
      precio: Number(form.value.precio) || 0,
      aforo: Number(form.value.aforo) || 0
    }
    if (archivo.value) datos.imagen_url = await subirImagen(archivo.value)

    const { error } = editandoId.value
      ? await supabase.from('funciones').update(datos).eq('id', editandoId.value)
      : await supabase.from('funciones').insert(datos)
    if (error) throw error

    cancelar()
    await cargar()
    mensaje.value = 'Guardado correctamente.'
  } catch (e) {
    mensaje.value = 'Error: ' + e.message
  } finally {
    guardando.value = false
  }
}

async function borrar(f) {
  if (!confirm(`¿Borrar "${f.titulo}"? También se borrarán sus boletas registradas.`)) return
  const { error } = await supabase.from('funciones').delete().eq('id', f.id)
  if (error) mensaje.value = 'Error: ' + error.message
  else {
    mensaje.value = 'Función borrada.'
    await cargar()
  }
}

onMounted(cargar)
</script>

<template>
  <section>
    <div class="encabezado">
      <div>
        <h1 class="titulo-l">Funciones</h1>
        <p class="subtitulo">Programación y aforo de la temporada</p>
      </div>
      <button class="accion accion--principal" @click="abrirNueva">+ Nueva función</button>
    </div>

    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>

    <div v-if="mostrarForm" class="tarjeta formulario">
      <p class="etiqueta">{{ editandoId ? 'Editar función' : 'Nueva función' }}</p>
      <form class="campos" @submit.prevent="guardar">
        <label>Título
          <input v-model="form.titulo" required />
        </label>
        <label>Categoría
          <input v-model="form.categoria" placeholder="Teatro, Títeres..." />
        </label>
        <label>Sala
          <input v-model="form.sala" required />
        </label>
        <label>Fecha y hora
          <input v-model="form.fecha" type="datetime-local" required />
        </label>
        <label>Precio (COP)
          <input v-model="form.precio" type="number" min="0" step="500" />
        </label>
        <label>Aforo (sillas)
          <input v-model="form.aforo" type="number" min="0" />
        </label>
        <label class="campos__ancho">Imagen
          <img v-if="imagenActual && !archivo" :src="imagenActual" class="vista-previa" alt="Imagen actual" />
          <input type="file" accept="image/*" @change="archivo = $event.target.files[0]" />
        </label>
        <div class="campos__ancho botones">
          <button type="submit" class="accion accion--principal" :disabled="guardando">
            {{ guardando ? 'Guardando...' : 'Guardar' }}
          </button>
          <button type="button" class="accion" @click="cancelar">Cancelar</button>
        </div>
      </form>
    </div>

    <p v-if="cargando">Cargando funciones...</p>
    <p v-else-if="funciones.length === 0">Todavía no hay funciones. Crea la primera con "+ Nueva función".</p>

    <div v-else class="tarjeta tabla-caja">
      <table class="tabla">
        <thead>
          <tr>
            <th>Obra</th>
            <th>Fecha</th>
            <th>Sala</th>
            <th>Precio</th>
            <th>Aforo</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in funciones" :key="f.id">
            <td class="tabla__fuerte">
              <div class="obra">
                <img v-if="f.imagen_url" :src="f.imagen_url" class="miniatura" :alt="f.titulo" />
                <div>
                  {{ f.titulo }}
                  <span v-if="f.categoria" class="categoria">{{ f.categoria }}</span>
                </div>
              </div>
            </td>
            <td class="tabla__mono">{{ formatoFecha(f.fecha) }}</td>
            <td>{{ f.sala }}</td>
            <td class="tabla__mono">{{ formatoPrecio(f.precio) }}</td>
            <td>
              <div class="aforo">
                <span class="tabla__mono">{{ vendidas(f) }}/{{ f.aforo }}</span>
                <div class="progreso aforo__barra">
                  <div class="progreso__relleno" :style="{ width: porcentaje(f) + '%' }"></div>
                </div>
              </div>
            </td>
            <td><span class="badge">{{ estado(f) }}</span></td>
            <td>
              <div class="acciones">
                <button class="accion" @click="editar(f)">Editar</button>
                <button class="accion accion--peligro" @click="borrar(f)">Borrar</button>
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

/* ---------- FORMULARIO ---------- */
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
.campos input {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  font-size: 0.95rem;
}
.vista-previa {
  width: 160px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radio);
}
.botones { display: flex; gap: 0.5rem; }

/* ---------- TABLA ---------- */
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

.obra { display: flex; align-items: center; gap: 0.75rem; }
.miniatura {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: var(--radio);
}
.categoria {
  display: block;
  font-weight: 400;
  font-size: 0.78rem;
  color: var(--gris);
}

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
}
</style>
