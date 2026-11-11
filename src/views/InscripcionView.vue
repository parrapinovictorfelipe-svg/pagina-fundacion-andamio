<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const programas = ref([])
const ocupados = ref({})
const cargando = ref(true)
const errorCarga = ref('')

const niveles = ['Ninguna', 'Menos de 1 año', 'Entre 1 y 3 años', 'Más de 3 años', 'Formación profesional']

const programaId = ref(null)
const enviado = ref(false)
const enviando = ref(false)
const errorEnvio = ref('')

const form = ref({
  nombre: '',
  correo: '',
  telefono: '',
  documento: '',
  edad: '',
  acudiente: '',
  experiencia: 'Ninguna',
  motivacion: '',
  autoriza: false,
})

const programa = computed(() => programas.value.find((p) => p.id === programaId.value) || null)
const esMenor = computed(() => Number(form.value.edad) > 0 && Number(form.value.edad) < 18)

const formCompleto = computed(
  () =>
    form.value.nombre &&
    form.value.correo &&
    form.value.telefono &&
    form.value.documento &&
    form.value.edad &&
    form.value.autoriza &&
    (!esMenor.value || form.value.acudiente)
)

function ocupadosDe(p) {
  return ocupados.value[p.id] || 0
}
function lleno(p) {
  return p.cupos > 0 && ocupadosDe(p) >= p.cupos
}
function quedan(p) {
  return p.cupos > 0 ? Math.max(0, p.cupos - ocupadosDe(p)) : null
}
const esGratuito = (p) => /gratu|libre/i.test(p.costo || '')

async function cargarOcupados() {
  const { data } = await supabase.rpc('cupos_talleres')
  const mapa = {}
  for (const c of data || []) mapa[c.taller_id] = Number(c.ocupados)
  ocupados.value = mapa
}

async function cargar() {
  try {
    const { data, error } = await supabase
      .from('talleres')
      .select('*')
      .eq('activo', true)
      .eq('inscripcion_abierta', true)
      .order('orden', { ascending: true })
      .order('id', { ascending: true })
    if (error) throw error
    programas.value = data
    await cargarOcupados()
  } catch (e) {
    console.error(e)
    errorCarga.value = 'No pudimos cargar los programas. Intenta de nuevo en un momento.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

async function enviar() {
  errorEnvio.value = ''
  enviando.value = true
  try {
    const { error } = await supabase.rpc('crear_inscripcion', {
      p_taller_id: programaId.value,
      p_nombre: form.value.nombre,
      p_correo: form.value.correo,
      p_telefono: form.value.telefono,
      p_documento: form.value.documento,
      p_edad: Number(form.value.edad),
      p_acudiente: esMenor.value ? form.value.acudiente : '',
      p_experiencia: form.value.experiencia,
      p_motivacion: form.value.motivacion,
      p_autoriza: form.value.autoriza,
    })
    if (error) throw error
    enviado.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    errorEnvio.value = e.message || 'No se pudo registrar la inscripción. Intenta de nuevo.'
    await cargarOcupados()
  } finally {
    enviando.value = false
  }
}

async function reiniciar() {
  enviado.value = false
  programaId.value = null
  errorEnvio.value = ''
  form.value = {
    nombre: '', correo: '', telefono: '', documento: '', edad: '',
    acudiente: '', experiencia: 'Ninguna', motivacion: '', autoriza: false,
  }
  await cargarOcupados()
}
</script>

<template>
  <section class="cabecera-pagina">
    <div class="contenedor">
      <p class="etiqueta">Convocatoria abierta</p>
      <h1 class="titulo-l">Inscripción a talleres</h1>
      <p class="parrafo">
        Forma parte de nuestros espacios de formación artística y comunitaria
        en Quibdó.
      </p>
    </div>
  </section>

  <section class="seccion seccion--clara">
    <div class="contenedor">
      <p v-if="cargando" class="aviso">Cargando programas...</p>
      <p v-else-if="errorCarga" class="aviso">{{ errorCarga }}</p>
      <p v-else-if="programas.length === 0 && !enviado" class="aviso">
        Por ahora no hay inscripciones abiertas. Vuelve pronto.
      </p>

      <!-- ============ CONFIRMACIÓN ============ -->
      <div v-else-if="enviado" class="confirmacion tarjeta">
        <p class="etiqueta etiqueta--claro">Inscripción recibida</p>
        <h2 class="titulo-m">Gracias, {{ form.nombre.split(' ')[0] }}</h2>
        <p class="parrafo">
          Registramos tu inscripción a {{ programa.nombre }}. El equipo revisa
          las solicitudes cada semana y te escribe a {{ form.correo }} con los
          siguientes pasos.
        </p>
        <button class="btn btn--morado" @click="reiniciar">Inscribir a otra persona</button>
      </div>

      <template v-else>
        <!-- ============ PROGRAMAS ============ -->
        <h2 class="titulo-m bloque__titulo">Elige un programa</h2>

        <div class="programas">
          <button
            v-for="p in programas"
            :key="p.id"
            class="seleccionable programa"
            :class="{ activa: programaId === p.id }"
            :disabled="lleno(p)"
            @click="programaId = p.id"
          >
            <div class="programa__cabecera">
              <h3 class="titulo-s">{{ p.nombre }}</h3>
              <span v-if="lleno(p)" class="badge">Sin cupos</span>
              <span v-else-if="quedan(p) !== null && quedan(p) <= 5" class="badge">
                {{ quedan(p) }} cupos
              </span>
            </div>

            <p v-if="p.descripcion" class="programa__desc">{{ p.descripcion }}</p>

            <ul class="programa__datos">
              <li v-if="p.periodo">{{ p.periodo }}</li>
              <li v-if="p.horario">{{ p.horario }}</li>
              <li v-if="p.costo" :class="esGratuito(p) ? 'programa__gratis' : 'programa__costo'">
                {{ p.costo }}
              </li>
            </ul>

            <template v-if="p.cupos > 0">
              <div class="progreso programa__progreso">
                <div
                  class="progreso__relleno"
                  :style="{ width: Math.min(100, (ocupadosDe(p) / p.cupos) * 100) + '%' }"
                ></div>
              </div>
              <p class="programa__cupos">{{ ocupadosDe(p) }} de {{ p.cupos }} cupos ocupados</p>
            </template>
          </button>
        </div>

        <!-- ============ FORMULARIO ============ -->
        <div v-if="programa" class="formulario">
          <h2 class="titulo-m formulario__titulo">{{ programa.nombre }}</h2>

          <div class="campo">
            <label class="campo__label" for="i-nombre">Nombre completo</label>
            <input id="i-nombre" v-model="form.nombre" class="campo__input" type="text" placeholder="Nombre y apellido" />
          </div>

          <div class="campo">
            <label class="campo__label" for="i-correo">Correo electrónico</label>
            <input id="i-correo" v-model="form.correo" class="campo__input" type="email" placeholder="tucorreo@email.com" />
          </div>

          <div class="campo">
            <label class="campo__label" for="i-tel">Teléfono / WhatsApp</label>
            <input id="i-tel" v-model="form.telefono" class="campo__input" type="tel" placeholder="+57 310 987 6543" />
          </div>

          <div class="campo__fila">
            <div class="campo">
              <label class="campo__label" for="i-doc">Documento de identidad</label>
              <input id="i-doc" v-model="form.documento" class="campo__input" type="text" placeholder="CC / TI / Pasaporte" />
            </div>
            <div class="campo">
              <label class="campo__label" for="i-edad">Edad</label>
              <input id="i-edad" v-model="form.edad" class="campo__input" type="number" min="3" max="99" placeholder="22" />
            </div>
          </div>

          <div v-if="esMenor" class="campo">
            <label class="campo__label" for="i-acu">Nombre del acudiente (obligatorio para menores de edad)</label>
            <input id="i-acu" v-model="form.acudiente" class="campo__input" type="text" placeholder="Madre, padre o adulto responsable" />
          </div>

          <div class="campo">
            <label class="campo__label" for="i-exp">Experiencia previa en teatro</label>
            <select id="i-exp" v-model="form.experiencia" class="campo__select">
              <option v-for="n in niveles" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>

          <div class="campo">
            <label class="campo__label" for="i-mot">¿Por qué quieres participar?</label>
            <textarea
              id="i-mot"
              v-model="form.motivacion"
              class="campo__area"
              placeholder="Cuéntanos qué te motiva a unirte a este programa..."
            ></textarea>
          </div>

          <label class="autoriza">
            <input v-model="form.autoriza" type="checkbox" />
            <span>
              Autorizo el tratamiento de mis datos personales según la política
              de privacidad de Fundación Andamio.
            </span>
          </label>

          <p v-if="errorEnvio" class="error-envio">{{ errorEnvio }}</p>

          <button class="btn btn--morado" :disabled="!formCompleto || enviando" @click="enviar">
            {{ enviando ? 'Enviando...' : 'Inscribirme al programa →' }}
          </button>
        </div>

        <p v-else class="aviso">Selecciona un programa para ver el formulario.</p>
      </template>
    </div>
  </section>
</template>

<style scoped>
.bloque__titulo { margin-bottom: 1.75rem; }

/* ---------- PROGRAMAS ---------- */
.programas {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-bottom: 3rem;
}

.programa { padding: 1.75rem; }

.programa__cabecera {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.programa__desc {
  font-size: 0.92rem;
  color: var(--gris);
  margin: 0 0 1.25rem;
}

.programa__datos {
  list-style: none;
  margin: 0 0 1.25rem;
  padding: 0;
  display: grid;
  gap: 0.35rem;
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--gris);
}

.programa__gratis { color: var(--verde); }
.programa__costo  { color: var(--morado-acento); }

.programa__progreso { margin-bottom: 0.5rem; }

.programa__cupos {
  font-size: 0.75rem;
  color: var(--gris);
  margin: 0;
}

/* ---------- FORMULARIO ---------- */
.formulario {
  max-width: 560px;
  padding-top: 2.5rem;
  border-top: 1px solid var(--borde-claro);
}

/* Barra morada a la izquierda del título, como en el diseño */
.formulario__titulo {
  padding-left: 1rem;
  border-left: 3px solid var(--morado-acento);
  margin-bottom: 2rem;
}

.autoriza {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: var(--gris);
  margin-bottom: 1.75rem;
  cursor: pointer;
}
.autoriza input {
  margin-top: 0.2rem;
  accent-color: var(--morado-acento);
  width: 16px; height: 16px;
  flex-shrink: 0;
}

.aviso {
  font-size: 0.9rem;
  font-style: italic;
  color: var(--gris);
}

/* ---------- RESPONSIVE ---------- */
@media (max-width: 860px) {
  .programas { grid-template-columns: 1fr; }
}
</style>
<style scoped>
.programa:disabled { opacity: 0.55; cursor: not-allowed; }
.error-envio { color: #b34242; font-size: 0.88rem; margin: 0 0 1rem; }
</style>
