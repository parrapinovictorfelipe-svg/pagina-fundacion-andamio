<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const obras = ref([])
const cargando = ref(true)
const mensaje = ref('')
const guardando = ref(false)
const mostrarForm = ref(false)
const editandoId = ref(null)
const archivo = ref(null)
const imagenActual = ref(null)

const vacio = () => ({
  titulo: '',
  genero: '',
  duracion: '',
  publico: '',
  compania: 'Fundación Andamio',
  sinopsis: '',
  activa: true
})
const form = ref(vacio())

async function cargar() {
  cargando.value = true
  const { data, error } = await supabase
    .from('obras')
    .select('*')
    .order('titulo', { ascending: true })
  if (error) mensaje.value = 'Error al cargar: ' + error.message
  else obras.value = data
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

function editar(o) {
  editandoId.value = o.id
  form.value = {
    titulo: o.titulo || '',
    genero: o.genero || '',
    duracion: o.duracion || '',
    publico: o.publico || '',
    compania: o.compania || '',
    sinopsis: o.sinopsis || '',
    activa: o.activa !== false
  }
  archivo.value = null
  imagenActual.value = o.imagen_url
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
  if (!form.value.titulo.trim()) {
    mensaje.value = 'El título es obligatorio.'
    return
  }
  guardando.value = true
  try {
    const datos = {
      titulo: form.value.titulo.trim(),
      genero: form.value.genero.trim() || null,
      duracion: form.value.duracion.trim() || null,
      publico: form.value.publico.trim() || null,
      compania: form.value.compania.trim() || null,
      sinopsis: form.value.sinopsis.trim() || null,
      activa: form.value.activa
    }
    if (archivo.value) datos.imagen_url = await subirImagen(archivo.value)

    const { error } = editandoId.value
      ? await supabase.from('obras').update(datos).eq('id', editandoId.value)
      : await supabase.from('obras').insert(datos)
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

async function borrar(o) {
  if (!confirm(`¿Borrar "${o.titulo}"? También se borrarán todas sus fechas y horarios. Si solo quieres ocultarla del sitio, mejor edítala y desmarca "Mostrar en el sitio".`)) return
  const { error } = await supabase.from('obras').delete().eq('id', o.id)
  if (error) mensaje.value = 'Error: ' + error.message
  else {
    mensaje.value = 'Obra borrada.'
    await cargar()
  }
}

onMounted(cargar)
</script>

<template>
  <section>
    <div class="encabezado">
      <div>
        <h1 class="titulo-l">Obras</h1>
        <p class="subtitulo">Lo que presenta la fundación. Se muestra en la página Funciones</p>
      </div>
      <button class="accion accion--principal" @click="abrirNueva">+ Nueva obra</button>
    </div>

    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>

    <div v-if="mostrarForm" class="tarjeta formulario">
      <p class="etiqueta">{{ editandoId ? 'Editar obra' : 'Nueva obra' }}</p>
      <form class="campos" @submit.prevent="guardar">
        <label class="campos__ancho">Título
          <input v-model="form.titulo" required />
        </label>
        <label>Género
          <input v-model="form.genero" placeholder="Teatro folclórico, Comedia..." />
        </label>
        <label>Duración
          <input v-model="form.duracion" placeholder="75 minutos" />
        </label>
        <label>Público
          <input v-model="form.publico" placeholder="Mayores de 12 años, Todo público..." />
        </label>
        <label class="campos__ancho">Producción (quién presenta la obra)
          <input v-model="form.compania" placeholder="Fundación Andamio, Compañía invitada..." />
        </label>
        <label class="campos__ancho">De qué trata
          <textarea v-model="form.sinopsis" rows="5" placeholder="Escribe aquí la sinopsis de la obra"></textarea>
        </label>
        <label class="campos__ancho">Foto
          <img v-if="imagenActual && !archivo" :src="imagenActual" class="vista-previa" alt="Foto actual" />
          <input type="file" accept="image/*" @change="archivo = $event.target.files[0]" />
        </label>
        <label class="campos__ancho casilla">
          <input v-model="form.activa" type="checkbox" />
          Mostrar en el sitio
        </label>
        <div class="campos__ancho botones">
          <button type="submit" class="accion accion--principal" :disabled="guardando">
            {{ guardando ? 'Guardando...' : 'Guardar' }}
          </button>
          <button type="button" class="accion" @click="cancelar">Cancelar</button>
        </div>
      </form>
    </div>

    <p v-if="cargando">Cargando obras...</p>
    <p v-else-if="obras.length === 0">Todavía no hay obras. Crea la primera con "+ Nueva obra".</p>

    <div v-else class="tarjeta tabla-caja">
      <table class="tabla">
        <thead>
          <tr>
            <th>Obra</th>
            <th>Género</th>
            <th>Duración</th>
            <th>Público</th>
            <th>Sitio</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in obras" :key="o.id">
            <td class="tabla__fuerte">
              <div class="obra">
                <img v-if="o.imagen_url" :src="o.imagen_url" class="miniatura" :alt="o.titulo" />
                <div v-else class="miniatura miniatura--vacia">Sin foto</div>
                <div>
                  {{ o.titulo }}
                  <span v-if="!o.sinopsis" class="categoria">Falta la sinopsis</span>
                </div>
              </div>
            </td>
            <td>{{ o.genero || '—' }}</td>
            <td>{{ o.duracion || '—' }}</td>
            <td>{{ o.publico || '—' }}</td>
            <td><span class="badge">{{ o.activa ? 'Visible' : 'Oculta' }}</span></td>
            <td>
              <div class="acciones">
                <button class="accion" @click="editar(o)">Editar</button>
                <button class="accion accion--peligro" @click="borrar(o)">Borrar</button>
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
.campos input,
.campos textarea {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  font-size: 0.95rem;
  font-family: inherit;
}
.casilla { display: flex !important; align-items: center; gap: 0.5rem; }
.casilla input { width: 16px; height: 16px; padding: 0; }
.vista-previa {
  width: 160px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radio);
}
.botones { display: flex; gap: 0.5rem; }

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

.obra { display: flex; align-items: center; gap: 0.75rem; }
.miniatura {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: var(--radio);
  flex-shrink: 0;
}
.miniatura--vacia {
  display: grid;
  place-items: center;
  background: var(--claro);
  border: 1px dashed var(--borde-claro);
  font-size: 0.6rem;
  color: var(--gris);
  font-weight: 400;
}
.categoria {
  display: block;
  font-weight: 400;
  font-size: 0.78rem;
  color: var(--gris);
}

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
