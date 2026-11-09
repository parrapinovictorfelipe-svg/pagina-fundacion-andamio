<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const talleres = ref([])
const ocupados = ref({})
const cargando = ref(true)
const mensaje = ref('')
const guardando = ref(false)
const mostrarForm = ref(false)
const editandoId = ref(null)

const vacio = () => ({
  nombre: '',
  tipo: '',
  descripcion: '',
  periodo: '',
  horario: '',
  costo: 'Gratuito',
  cupos: 20,
  orden: 0,
  inscripcion_abierta: true,
  mostrar_en_inicio: false,
  activo: true
})
const form = ref(vacio())

async function cargar() {
  cargando.value = true
  const [rT, rC] = await Promise.all([
    supabase
      .from('talleres')
      .select('*')
      .order('orden', { ascending: true })
      .order('id', { ascending: true }),
    supabase.rpc('cupos_talleres')
  ])
  if (rT.error) mensaje.value = 'Error al cargar: ' + rT.error.message
  else talleres.value = rT.data
  const mapa = {}
  for (const c of rC.data || []) mapa[c.taller_id] = Number(c.ocupados)
  ocupados.value = mapa
  cargando.value = false
}

function abrirNuevo() {
  editandoId.value = null
  form.value = { ...vacio(), orden: talleres.value.length + 1 }
  mensaje.value = ''
  mostrarForm.value = true
}

function editar(t) {
  editandoId.value = t.id
  form.value = {
    nombre: t.nombre || '',
    tipo: t.tipo || '',
    descripcion: t.descripcion || '',
    periodo: t.periodo || '',
    horario: t.horario || '',
    costo: t.costo || '',
    cupos: t.cupos || 0,
    orden: t.orden || 0,
    inscripcion_abierta: !!t.inscripcion_abierta,
    mostrar_en_inicio: !!t.mostrar_en_inicio,
    activo: t.activo !== false
  }
  mensaje.value = ''
  mostrarForm.value = true
}

function cancelar() {
  mostrarForm.value = false
  editandoId.value = null
}

async function guardar() {
  mensaje.value = ''
  if (!form.value.nombre.trim()) {
    mensaje.value = 'El nombre es obligatorio.'
    return
  }
  guardando.value = true
  try {
    const datos = {
      nombre: form.value.nombre.trim(),
      tipo: form.value.tipo.trim() || null,
      descripcion: form.value.descripcion.trim() || null,
      periodo: form.value.periodo.trim() || null,
      horario: form.value.horario.trim() || null,
      costo: form.value.costo.trim() || null,
      cupos: Number(form.value.cupos) || 0,
      orden: Number(form.value.orden) || 0,
      inscripcion_abierta: form.value.inscripcion_abierta,
      mostrar_en_inicio: form.value.mostrar_en_inicio,
      activo: form.value.activo
    }
    const { error } = editandoId.value
      ? await supabase.from('talleres').update(datos).eq('id', editandoId.value)
      : await supabase.from('talleres').insert(datos)
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

async function borrar(t) {
  if (!confirm(`¿Borrar "${t.nombre}"? Las solicitudes ya recibidas se conservan, pero quedarán sin programa asignado. Si solo quieres ocultarlo, edítalo y desmarca "Visible en el sitio".`)) return
  const { error } = await supabase.from('talleres').delete().eq('id', t.id)
  if (error) mensaje.value = 'Error: ' + error.message
  else {
    mensaje.value = 'Programa borrado.'
    await cargar()
  }
}

onMounted(cargar)
</script>

<template>
  <section>
    <div class="encabezado">
      <div>
        <h1 class="titulo-l">Talleres y programas</h1>
        <p class="subtitulo">Lo que ofrece la fundación. Se ve en el Inicio y en la página Inscripción</p>
      </div>
      <button class="accion accion--principal" @click="abrirNuevo">+ Nuevo programa</button>
    </div>

    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>

    <div v-if="mostrarForm" class="tarjeta formulario">
      <p class="etiqueta">{{ editandoId ? 'Editar programa' : 'Nuevo programa' }}</p>
      <form class="campos" @submit.prevent="guardar">
        <label class="campos__ancho">Nombre
          <input v-model="form.nombre" required />
        </label>
        <label>Tipo (etiqueta que se ve en el Inicio)
          <input v-model="form.tipo" placeholder="Formación, Comunidad, Festival..." />
        </label>
        <label>Orden (1 aparece primero)
          <input v-model="form.orden" type="number" min="0" />
        </label>
        <label class="campos__ancho">Descripción
          <textarea v-model="form.descripcion" rows="4"></textarea>
        </label>
        <label>Periodo
          <input v-model="form.periodo" placeholder="Feb – Nov 2026" />
        </label>
        <label>Horario
          <input v-model="form.horario" placeholder="Sáb 9:00 AM – 1:00 PM" />
        </label>
        <label>Costo (texto que se ve)
          <input v-model="form.costo" placeholder="Gratuito, $80.000 / mes..." />
        </label>
        <label>Cupos (0 = sin límite)
          <input v-model="form.cupos" type="number" min="0" />
        </label>
        <label class="campos__ancho casilla">
          <input v-model="form.inscripcion_abierta" type="checkbox" />
          Recibe inscripciones (aparece en la página Inscripción)
        </label>
        <label class="campos__ancho casilla">
          <input v-model="form.mostrar_en_inicio" type="checkbox" />
          Mostrar en la sección Programas del Inicio
        </label>
        <label class="campos__ancho casilla">
          <input v-model="form.activo" type="checkbox" />
          Visible en el sitio
        </label>
        <div class="campos__ancho botones">
          <button type="submit" class="accion accion--principal" :disabled="guardando">
            {{ guardando ? 'Guardando...' : 'Guardar' }}
          </button>
          <button type="button" class="accion" @click="cancelar">Cancelar</button>
        </div>
      </form>
    </div>

    <p v-if="cargando">Cargando programas...</p>
    <p v-else-if="talleres.length === 0">Todavía no hay programas. Crea el primero con "+ Nuevo programa".</p>

    <div v-else class="tarjeta tabla-caja">
      <table class="tabla">
        <thead>
          <tr>
            <th>Programa</th>
            <th>Periodo y horario</th>
            <th>Costo</th>
            <th>Cupos</th>
            <th>Inscripción</th>
            <th>Inicio</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in talleres" :key="t.id">
            <td class="tabla__fuerte">
              {{ t.nombre }}
              <span class="secundario">{{ t.tipo || 'Sin tipo' }}{{ t.activo ? '' : ' · Oculto' }}</span>
            </td>
            <td>
              {{ t.periodo || '—' }}
              <span class="secundario">{{ t.horario || '' }}</span>
            </td>
            <td>{{ t.costo || '—' }}</td>
            <td class="tabla__mono">
              <template v-if="t.cupos > 0">{{ ocupados[t.id] || 0 }}/{{ t.cupos }}</template>
              <template v-else>Sin límite</template>
            </td>
            <td><span class="badge">{{ t.inscripcion_abierta ? 'Abierta' : 'Cerrada' }}</span></td>
            <td>{{ t.mostrar_en_inicio ? 'Sí' : '—' }}</td>
            <td>
              <div class="acciones">
                <button class="accion" @click="editar(t)">Editar</button>
                <button class="accion accion--peligro" @click="borrar(t)">Borrar</button>
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
.campos textarea {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  font-size: 0.95rem;
  font-family: inherit;
}
.campos .casilla { display: flex; align-items: center; gap: 0.5rem; }
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
.tabla__mono { font-family: var(--mono); font-size: 0.82rem; }
.secundario { display: block; font-size: 0.78rem; font-weight: 400; color: var(--gris); }

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
