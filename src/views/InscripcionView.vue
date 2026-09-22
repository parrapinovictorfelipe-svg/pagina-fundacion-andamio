<script setup>
import { ref, computed } from 'vue'

const programas = [
  {
    id: 'escuela',
    nombre: 'Escuela de Teatro',
    descripcion: 'Formación actoral para jóvenes de 14 a 25 años. Módulos de actuación, voz, movimiento y dramaturgia.',
    periodo: 'Feb – Nov 2026',
    horario: 'Sáb 9:00 AM – 1:00 PM',
    costo: 'Gratuito (selección por audición)',
    gratuito: true,
    ocupados: 17,
    cupos: 24,
  },
  {
    id: 'adultos',
    nombre: 'Taller de Teatro para Adultos',
    descripcion: 'Espacio de exploración escénica para adultos de 26 años en adelante. Sin experiencia previa necesaria.',
    periodo: 'Oct – Dic 2026',
    horario: 'Mar y Jue 6:30 PM – 9:00 PM',
    costo: '$120.000 / mes',
    gratuito: false,
    ocupados: 7,
    cupos: 18,
  },
  {
    id: 'comunitario',
    nombre: 'Teatro Comunitario',
    descripcion: 'Proyecto de teatro aplicado en comunidades. Requiere disponibilidad para trabajo de campo en barrios.',
    periodo: 'Nov 2026 – Abr 2027',
    horario: 'Flexible según comunidad',
    costo: 'Gratuito',
    gratuito: true,
    ocupados: 8,
    cupos: 12,
  },
  {
    id: 'infantil',
    nombre: 'Teatro Infantil y Juvenil',
    descripcion: 'Para niñas y niños de 7 a 13 años. Juego teatral, títeres, expresión corporal y montaje final.',
    periodo: 'Oct – Dic 2026',
    horario: 'Sáb 10:00 AM – 12:00 PM',
    costo: '$80.000 / mes',
    gratuito: false,
    ocupados: 7,
    cupos: 20,
  },
]

const niveles = ['Ninguna', 'Menos de 1 año', 'Entre 1 y 3 años', 'Más de 3 años', 'Formación profesional']

const programaId = ref(null)
const enviado = ref(false)

const form = ref({
  nombre: '',
  correo: '',
  telefono: '',
  documento: '',
  edad: '',
  experiencia: 'Ninguna',
  motivacion: '',
  autoriza: false,
})

const programa = computed(() => programas.find((p) => p.id === programaId.value) || null)

const formCompleto = computed(
  () =>
    form.value.nombre &&
    form.value.correo &&
    form.value.telefono &&
    form.value.documento &&
    form.value.edad &&
    form.value.autoriza
)

function disponibles(p) {
  return p.cupos - p.ocupados
}

function enviar() {
  enviado.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function reiniciar() {
  enviado.value = false
  programaId.value = null
  form.value = {
    nombre: '', correo: '', telefono: '', documento: '',
    edad: '', experiencia: 'Ninguna', motivacion: '', autoriza: false,
  }
}
</script>

<template>
  <section class="cabecera-pagina">
    <div class="contenedor">
      <p class="etiqueta">Convocatoria abierta</p>
      <h1 class="titulo-l">Inscripción a talleres</h1>
      <p class="parrafo">
        Forma parte de nuestros espacios de formación artística y comunitaria
        en Bogotá.
      </p>
    </div>
  </section>

  <section class="seccion seccion--clara">
    <div class="contenedor">
      <!-- ============ CONFIRMACIÓN ============ -->
      <div v-if="enviado" class="confirmacion tarjeta">
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
            @click="programaId = p.id"
          >
            <div class="programa__cabecera">
              <h3 class="titulo-s">{{ p.nombre }}</h3>
              <span v-if="disponibles(p) <= 5" class="badge">
                {{ disponibles(p) }} cupos
              </span>
            </div>

            <p class="programa__desc">{{ p.descripcion }}</p>

            <ul class="programa__datos">
              <li>{{ p.periodo }}</li>
              <li>{{ p.horario }}</li>
              <li :class="p.gratuito ? 'programa__gratis' : 'programa__costo'">
                {{ p.costo }}
              </li>
            </ul>

            <div class="progreso programa__progreso">
              <div
                class="progreso__relleno"
                :style="{ width: (p.ocupados / p.cupos) * 100 + '%' }"
              ></div>
            </div>
            <p class="programa__cupos">{{ p.ocupados }} de {{ p.cupos }} cupos ocupados</p>
          </button>
        </div>

        <!-- ============ FORMULARIO ============ -->
        <div v-if="programa" class="formulario">
          <h2 class="titulo-m formulario__titulo">{{ programa.nombre }}</h2>

          <div class="campo">
            <label class="campo__label" for="i-nombre">Nombre completo</label>
            <input id="i-nombre" v-model="form.nombre" class="campo__input" type="text" placeholder="Ana Rodríguez" />
          </div>

          <div class="campo">
            <label class="campo__label" for="i-correo">Correo electrónico</label>
            <input id="i-correo" v-model="form.correo" class="campo__input" type="email" placeholder="ana@correo.com" />
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
              <input id="i-edad" v-model="form.edad" class="campo__input" type="number" min="5" max="99" placeholder="22" />
            </div>
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

          <button class="btn btn--morado" :disabled="!formCompleto" @click="enviar">
            Inscribirme al programa →
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