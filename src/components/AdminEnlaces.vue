<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const enlaces = ref([])
const cargando = ref(true)
const mensaje = ref('')
const guardandoId = ref(null)

const snap = (e) =>
  JSON.stringify({
    etiqueta: e.etiqueta || '',
    sigla: e.sigla || '',
    url: e.url || '',
    orden: Number(e.orden) || 0,
    activo: !!e.activo
  })
const cambiado = (e) => e._snap !== snap(e)

const redes = computed(() => enlaces.value.filter((e) => e.grupo === 'redes'))
const otros = computed(() => enlaces.value.filter((e) => e.grupo === 'enlaces'))

const grupos = computed(() => [
  {
    id: 'redes',
    titulo: 'Redes sociales',
    nota: 'Aparecen como botones en el pie de página. La sigla es el texto del botón (2 o 3 letras, por ejemplo TT para TikTok).',
    lista: redes.value
  },
  {
    id: 'enlaces',
    titulo: 'Otros enlaces',
    nota: 'Aparecen en la lista de enlaces del pie de página. Pueden llevar a otro sitio (https://...) o a una página de este mismo sitio (por ejemplo /funciones).',
    lista: otros.value
  }
])

function urlValida(e) {
  const u = (e.url || '').trim()
  if (u === '') return true
  return u.startsWith('https://') || (e.grupo === 'enlaces' && u.startsWith('/'))
}

async function cargar() {
  cargando.value = true
  const { data, error } = await supabase
    .from('enlaces_pie')
    .select('*')
    .order('grupo', { ascending: true })
    .order('orden', { ascending: true })
    .order('id', { ascending: true })
  if (error) mensaje.value = 'Error al cargar: ' + error.message
  else enlaces.value = data.map((e) => ({ ...e, _snap: snap(e) }))
  cargando.value = false
}

async function guardar(e) {
  mensaje.value = ''
  if (!(e.etiqueta || '').trim()) {
    mensaje.value = 'El nombre es obligatorio.'
    return
  }
  if (!urlValida(e)) {
    mensaje.value = 'La dirección debe empezar con https:// (o con / si es una página de este sitio).'
    return
  }
  guardandoId.value = e.id
  const { error } = await supabase
    .from('enlaces_pie')
    .update({
      etiqueta: e.etiqueta.trim(),
      sigla: (e.sigla || '').trim().toUpperCase() || null,
      url: (e.url || '').trim(),
      orden: Number(e.orden) || 0,
      activo: !!e.activo
    })
    .eq('id', e.id)
  guardandoId.value = null
  if (error) mensaje.value = 'Error: ' + error.message
  else {
    e._snap = snap(e)
    mensaje.value = 'Guardado. Ya se ve en el pie de página.'
  }
}

async function nuevo(grupo) {
  mensaje.value = ''
  const cantidad = enlaces.value.filter((e) => e.grupo === grupo).length
  const { error } = await supabase.from('enlaces_pie').insert({
    grupo,
    etiqueta: grupo === 'redes' ? 'Nueva red' : 'Nuevo enlace',
    sigla: null,
    url: '',
    orden: cantidad + 1,
    activo: true
  })
  if (error) mensaje.value = 'Error: ' + error.message
  else {
    await cargar()
    mensaje.value = 'Agregado. Cámbiale el nombre, pega la dirección y pulsa Guardar.'
  }
}

async function borrar(e) {
  if (!confirm(`¿Borrar "${e.etiqueta}" del pie de página?`)) return
  const { error } = await supabase.from('enlaces_pie').delete().eq('id', e.id)
  if (error) mensaje.value = 'Error: ' + error.message
  else await cargar()
}

onMounted(cargar)
</script>

<template>
  <div>
    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>
    <p v-if="cargando">Cargando enlaces...</p>

    <div v-for="g in grupos" :key="g.id" class="tarjeta bloque">
      <div class="bloque__cab">
        <div>
          <p class="etiqueta">{{ g.titulo }}</p>
          <p class="nota">{{ g.nota }}</p>
        </div>
        <button class="accion accion--principal" @click="nuevo(g.id)">+ Agregar</button>
      </div>

      <p v-if="g.lista.length === 0 && !cargando" class="vacio">Todavía no hay nada aquí.</p>

      <div v-else-if="g.lista.length" class="tabla-caja">
        <table class="tabla">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Nombre</th>
              <th v-if="g.id === 'redes'">Sigla</th>
              <th>Dirección</th>
              <th>Visible</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in g.lista" :key="e.id">
              <td><input v-model="e.orden" type="number" min="0" class="entrada entrada--corta" /></td>
              <td><input v-model="e.etiqueta" class="entrada" /></td>
              <td v-if="g.id === 'redes'">
                <input v-model="e.sigla" maxlength="3" class="entrada entrada--corta" placeholder="TT" />
              </td>
              <td><input v-model="e.url" class="entrada entrada--ancha" placeholder="https://..." /></td>
              <td><input v-model="e.activo" type="checkbox" class="casilla" /></td>
              <td>
                <div class="acciones">
                  <button
                    class="accion accion--principal"
                    :disabled="!cambiado(e) || guardandoId === e.id"
                    @click="guardar(e)"
                  >
                    {{ guardandoId === e.id ? 'Guardando...' : 'Guardar' }}
                  </button>
                  <button class="accion accion--peligro" @click="borrar(e)">Borrar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mensaje { font-size: 0.9rem; margin: 0 0 1rem; color: var(--morado-acento); }
.bloque { padding: 1.5rem; margin-top: 1.5rem; }
.bloque__cab {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.nota { font-size: 0.85rem; color: var(--gris); margin: 0.35rem 0 0; max-width: 60ch; }
.vacio { font-size: 0.9rem; color: var(--gris); margin: 0; }

.tabla-caja { overflow-x: auto; }
.tabla { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.tabla th {
  text-align: left;
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 400;
  color: var(--gris);
  padding: 0.75rem 0.75rem;
  border-bottom: 1px solid var(--borde-claro);
  white-space: nowrap;
}
.tabla td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--borde-claro);
  vertical-align: middle;
}
.tabla tbody tr:last-child td { border-bottom: none; }

.entrada {
  width: 100%;
  min-width: 130px;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  font-size: 0.9rem;
  font-family: inherit;
}
.entrada--corta { min-width: 60px; width: 70px; }
.entrada--ancha { min-width: 260px; }
.casilla { width: 18px; height: 18px; accent-color: var(--morado-acento); }

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
.accion:disabled { opacity: 0.45; cursor: default; }
.accion--principal {
  background: var(--morado-acento);
  border-color: var(--morado-acento);
  color: var(--blanco);
}
.accion--principal:hover { background: var(--morado-vivo); color: var(--blanco); }
.accion--peligro:hover { border-color: #b34242; color: #b34242; }
</style>
