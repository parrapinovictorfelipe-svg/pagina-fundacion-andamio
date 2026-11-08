<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { recargarContenido } from '@/lib/contenido'

const props = defineProps({
  incluir: { type: Array, default: () => [] },
  excluir: { type: Array, default: () => [] }
})

const filas = ref([])
const cargando = ref(true)
const guardando = ref(false)
const subiendo = ref('')
const mensaje = ref('')

const cambiado = (f) => (f.valor || '') !== (f.original || '')
const cambiados = computed(() => filas.value.filter(cambiado))

const secciones = computed(() => {
  const grupos = []
  for (const f of filas.value) {
    let g = grupos.find((x) => x.nombre === f.seccion)
    if (!g) {
      g = { nombre: f.seccion, filas: [] }
      grupos.push(g)
    }
    g.filas.push(f)
  }
  return grupos
})

async function cargar() {
  cargando.value = true
  const { data, error } = await supabase
    .from('contenido')
    .select('*')
    .order('orden', { ascending: true })
  if (error) mensaje.value = 'Error al cargar: ' + error.message
  else filas.value = data.filter((f) => (props.incluir.length === 0 || props.incluir.some((p) => f.clave.startsWith(p))) && !props.excluir.some((p) => f.clave.startsWith(p))).map((f) => ({ ...f, original: f.valor }))
  cargando.value = false
}

async function subirImagen(fila, evento) {
  const file = evento.target.files[0]
  if (!file) return
  subiendo.value = fila.clave
  mensaje.value = ''
  try {
    const nombre = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const { error } = await supabase.storage.from('imagenes').upload(nombre, file)
    if (error) throw error
    fila.valor = supabase.storage.from('imagenes').getPublicUrl(nombre).data.publicUrl
  } catch (e) {
    mensaje.value = 'Error al subir la imagen: ' + e.message
  } finally {
    subiendo.value = ''
    evento.target.value = ''
  }
}

async function guardar() {
  guardando.value = true
  mensaje.value = ''
  try {
    for (const f of cambiados.value) {
      const { error } = await supabase
        .from('contenido')
        .update({ valor: f.valor || null })
        .eq('clave', f.clave)
      if (error) throw error
      f.original = f.valor
    }
    recargarContenido()
    mensaje.value = 'Cambios guardados. Ya se ven en el sitio.'
  } catch (e) {
    mensaje.value = 'Error: ' + e.message
  } finally {
    guardando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <section>
    <div class="encabezado">
      <div>
        <h1 class="titulo-l">Textos e imágenes</h1>
        <p class="subtitulo">Cambia aquí lo que se lee y se ve en el sitio</p>
      </div>
      <button class="accion accion--principal" :disabled="guardando || cambiados.length === 0" @click="guardar">
        {{ guardando ? 'Guardando...' : 'Guardar cambios (' + cambiados.length + ')' }}
      </button>
    </div>

    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>
    <p v-if="cargando">Cargando...</p>

    <div v-for="g in secciones" :key="g.nombre" class="tarjeta grupo">
      <p class="etiqueta">{{ g.nombre }}</p>

      <div v-for="f in g.filas" :key="f.clave" class="campo">
        <label>{{ f.etiqueta }}</label>

        <textarea
          v-if="f.tipo === 'parrafo'"
          v-model="f.valor"
          rows="4"
          :class="{ cambiado: cambiado(f) }"
        ></textarea>

        <div v-else-if="f.tipo === 'imagen'" class="imagen">
          <img v-if="f.valor" :src="f.valor" class="imagen__vista" alt="Imagen actual" />
          <p v-else class="imagen__nota">Se está usando la foto original del sitio.</p>
          <input type="file" accept="image/*" @change="subirImagen(f, $event)" />
          <p v-if="subiendo === f.clave" class="imagen__nota">Subiendo...</p>
          <button v-if="f.valor" type="button" class="accion" @click="f.valor = ''">
            Volver a la foto original
          </button>
        </div>

        <input v-else v-model="f.valor" :class="{ cambiado: cambiado(f) }" />
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
.grupo { padding: 1.5rem; margin-bottom: 1.25rem; }
.campo {
  display: grid;
  gap: 0.35rem;
  margin-top: 1rem;
}
.campo label { font-size: 0.85rem; color: var(--gris); }
.campo input,
.campo textarea {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  font-size: 0.95rem;
  font-family: inherit;
}
.cambiado { border-color: var(--morado-acento) !important; background: var(--lila-fondo); }

.imagen { display: grid; gap: 0.6rem; justify-items: start; }
.imagen__vista {
  width: 220px;
  height: 140px;
  object-fit: cover;
  border-radius: var(--radio);
}
.imagen__nota { font-size: 0.82rem; color: var(--gris); margin: 0; }

.accion {
  background: transparent;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
  color: var(--gris);
  cursor: pointer;
  transition: all 0.18s ease;
}
.accion:hover { border-color: var(--morado-acento); color: var(--morado-acento); }
.accion:disabled { opacity: 0.5; cursor: default; }
.accion--principal {
  background: var(--morado-acento);
  border-color: var(--morado-acento);
  color: var(--blanco);
}
.accion--principal:hover { background: var(--morado-vivo); color: var(--blanco); }
</style>
