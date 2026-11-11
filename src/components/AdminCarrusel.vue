<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const props = defineProps({
  seccion: { type: String, default: 'galeria' }
})

const fotos = ref([])
const cargando = ref(true)
const mensaje = ref('')
const guardando = ref(false)
const mostrarForm = ref(false)
const editandoId = ref(null)
const archivo = ref(null)
const imagenActual = ref(null)
const form = ref({ descripcion: '', orden: 0 })

async function cargar() {
  cargando.value = true
  const { data, error } = await supabase
    .from('fotos_carrusel')
    .select('*')
    .eq('seccion', props.seccion)
    .order('orden', { ascending: true })
    .order('id', { ascending: true })
  if (error) mensaje.value = 'Error al cargar: ' + error.message
  else fotos.value = data
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
  form.value = { descripcion: '', orden: fotos.value.length + 1 }
  archivo.value = null
  imagenActual.value = null
  mensaje.value = ''
  mostrarForm.value = true
}

function editar(f) {
  editandoId.value = f.id
  form.value = { descripcion: f.descripcion || '', orden: f.orden || 0 }
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
  if (!editandoId.value && !archivo.value) {
    mensaje.value = 'Selecciona una imagen.'
    return
  }
  guardando.value = true
  try {
    const datos = {
      descripcion: form.value.descripcion.trim() || null,
      orden: Number(form.value.orden) || 0
    }
    if (archivo.value) datos.imagen_url = await subirImagen(archivo.value)
    datos.seccion = props.seccion

    const { error } = editandoId.value
      ? await supabase.from('fotos_carrusel').update(datos).eq('id', editandoId.value)
      : await supabase.from('fotos_carrusel').insert(datos)
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
  if (!confirm('¿Borrar esta foto del carrusel?')) return
  const { error } = await supabase.from('fotos_carrusel').delete().eq('id', f.id)
  if (error) {
    mensaje.value = 'Error: ' + error.message
    return
  }
  // Intenta borrar también el archivo guardado (si falla, no pasa nada)
  const ruta = (f.imagen_url || '').split('/imagenes/')[1]
  if (ruta) await supabase.storage.from('imagenes').remove([decodeURIComponent(ruta)])
  mensaje.value = 'Foto borrada.'
  await cargar()
}

onMounted(cargar)
</script>

<template>
  <section>
    <div class="encabezado">
      <div>
        <h1 class="titulo-l">Carrusel</h1>
        <p class="subtitulo">{{ seccion === 'portada' ? 'Fotos que rotan arriba del todo en el Inicio (si subes solo una, se queda fija)' : 'Fotos de la galería del Inicio' }}</p>
      </div>
      <button class="accion accion--principal" @click="abrirNueva">+ Nueva foto</button>
    </div>

    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>

    <div v-if="mostrarForm" class="tarjeta formulario">
      <p class="etiqueta">{{ editandoId ? 'Editar foto' : 'Nueva foto' }}</p>
      <form class="campos" @submit.prevent="guardar">
        <label class="campos__ancho">Descripción de la foto
          <input v-model="form.descripcion" placeholder="Ensayo de La Casa de Bernarda Alba" />
        </label>
        <label>Orden (1 aparece primero)
          <input v-model="form.orden" type="number" min="0" />
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

    <p v-if="cargando">Cargando fotos...</p>
    <p v-else-if="fotos.length === 0">
      Todavía no hay fotos aquí, por eso el sitio muestra las fotos originales. Sube la primera con "+ Nueva foto".
    </p>

    <div v-else class="rejilla">
      <div v-for="f in fotos" :key="f.id" class="tarjeta foto">
        <img :src="f.imagen_url" :alt="f.descripcion || 'Foto del carrusel'" class="foto__img" />
        <div class="foto__info">
          <p class="foto__desc">{{ f.descripcion || 'Sin descripción' }}</p>
          <p class="foto__orden">Orden: {{ f.orden }}</p>
          <div class="acciones">
            <button class="accion" @click="editar(f)">Editar</button>
            <button class="accion accion--peligro" @click="borrar(f)">Borrar</button>
          </div>
        </div>
      </div>
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
.campos input {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  font-size: 0.95rem;
}
.vista-previa {
  width: 200px;
  height: 125px;
  object-fit: cover;
  border-radius: var(--radio);
}
.botones { display: flex; gap: 0.5rem; }

.rejilla {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}
.foto { padding: 0; overflow: hidden; }
.foto__img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  display: block;
}
.foto__info { padding: 1rem; }
.foto__desc { font-weight: 600; font-size: 0.9rem; margin: 0 0 0.25rem; }
.foto__orden {
  font-family: var(--mono);
  font-size: 0.75rem;
  color: var(--gris);
  margin: 0 0 0.75rem;
}

.acciones { display: flex; gap: 0.5rem; }
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
