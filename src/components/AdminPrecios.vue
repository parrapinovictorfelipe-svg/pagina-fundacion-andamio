<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import AdminConfiguracion from '@/components/AdminConfiguracion.vue'

const tipos = ref([])
const cargando = ref(true)
const mensaje = ref('')
const guardandoId = ref(null)

const snap = (t) =>
  JSON.stringify({
    nombre: t.nombre,
    detalle: t.detalle || '',
    valor: Number(t.valor) || 0,
    orden: Number(t.orden) || 0,
    activo: !!t.activo
  })

const cambiado = (t) => t._snap !== snap(t)

async function cargar() {
  cargando.value = true
  const { data, error } = await supabase
    .from('tipos_boleta')
    .select('*')
    .is('funcion_id', null)
    .order('orden', { ascending: true })
    .order('id', { ascending: true })
  if (error) mensaje.value = 'Error al cargar: ' + error.message
  else tipos.value = data.map((t) => ({ ...t, _snap: snap(t) }))
  cargando.value = false
}

async function guardar(t) {
  mensaje.value = ''
  if (!t.nombre || !t.nombre.trim()) {
    mensaje.value = 'El nombre de la boleta es obligatorio.'
    return
  }
  if (Number(t.valor) < 0 || t.valor === '') {
    mensaje.value = 'El precio debe ser un número, 0 o mayor.'
    return
  }
  guardandoId.value = t.id
  const { error } = await supabase
    .from('tipos_boleta')
    .update({
      nombre: t.nombre.trim(),
      detalle: (t.detalle || '').trim() || null,
      valor: Number(t.valor) || 0,
      orden: Number(t.orden) || 0,
      activo: !!t.activo
    })
    .eq('id', t.id)
  guardandoId.value = null
  if (error) mensaje.value = 'Error: ' + error.message
  else {
    t._snap = snap(t)
    mensaje.value = 'Precio guardado.'
  }
}

async function nuevo() {
  mensaje.value = ''
  const { error } = await supabase.from('tipos_boleta').insert({
    nombre: 'Nuevo tipo',
    detalle: '',
    valor: 0,
    orden: tipos.value.length + 1,
    activo: true
  })
  if (error) mensaje.value = 'Error: ' + error.message
  else await cargar()
}

async function borrar(t) {
  if (!confirm(`¿Borrar "${t.nombre}"? Las compras ya hechas no se afectan. Si solo quieres dejar de venderla, desmarca "Activa".`)) return
  const { error } = await supabase.from('tipos_boleta').delete().eq('id', t.id)
  if (error) mensaje.value = 'Error: ' + error.message
  else {
    mensaje.value = 'Tipo de boleta borrado.'
    await cargar()
  }
}

onMounted(cargar)
</script>

<template>
  <section>
    <div class="encabezado">
      <div>
        <h1 class="titulo-l">Plantilla de precios</h1>
        <p class="subtitulo">Las boletas con las que arranca cada fecha nueva. Cada fecha puede cambiar sus precios en Fechas y horarios</p>
      </div>
      <button class="accion accion--principal" @click="nuevo">+ Nuevo tipo</button>
    </div>

    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>
    <p v-if="cargando">Cargando precios...</p>
    <p v-else-if="tipos.length === 0">No hay tipos de boleta. Crea el primero con "+ Nuevo tipo".</p>

    <div v-else class="tarjeta tabla-caja">
      <table class="tabla">
        <thead>
          <tr>
            <th>Orden</th>
            <th>Nombre</th>
            <th>Detalle</th>
            <th>Precio (COP)</th>
            <th>Activa</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tipos" :key="t.id">
            <td><input v-model="t.orden" type="number" min="0" class="entrada entrada--corta" /></td>
            <td><input v-model="t.nombre" class="entrada" /></td>
            <td><input v-model="t.detalle" class="entrada" placeholder="Opcional" /></td>
            <td><input v-model="t.valor" type="number" min="0" step="500" class="entrada entrada--media" /></td>
            <td><input v-model="t.activo" type="checkbox" class="casilla" /></td>
            <td>
              <div class="acciones">
                <button
                  class="accion accion--principal"
                  :disabled="!cambiado(t) || guardandoId === t.id"
                  @click="guardar(t)"
                >
                  {{ guardandoId === t.id ? 'Guardando...' : 'Guardar' }}
                </button>
                <button class="accion accion--peligro" @click="borrar(t)">Borrar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <AdminConfiguracion />
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
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--borde-claro);
  vertical-align: middle;
}
.tabla tbody tr:last-child td { border-bottom: none; }

.entrada {
  width: 100%;
  min-width: 140px;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  font-size: 0.9rem;
  font-family: inherit;
}
.entrada--corta { min-width: 60px; width: 70px; }
.entrada--media { min-width: 110px; }
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
