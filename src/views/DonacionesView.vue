<script setup>
import { ref, computed } from 'vue'

const montos = [10000, 25000, 50000, 100000, 250000]

const impactos = {
  10000:  'Costea una sesión de ensayo',
  25000:  'Financia materiales de escenografía',
  50000:  'Cubre un taller comunitario',
  100000: 'Beca parcial para un joven talento',
  250000: 'Financia una producción completa',
}

const transparencia = [
  { area: 'Programas y producción', porcentaje: 72 },
  { area: 'Formación y becas',      porcentaje: 18 },
  { area: 'Admin y operación',      porcentaje: 10 },
]

const frecuencias = [
  { id: 'unica',   nombre: 'Donación única' },
  { id: 'mensual', nombre: 'Aporte mensual' },
]

const montoElegido = ref(50000)
const montoOtro = ref('')
const frecuencia = ref('unica')
const donante = ref({ nombre: '', correo: '', mensaje: '' })
const enviado = ref(false)

const montoFinal = computed(() => {
  const otro = Number(montoOtro.value)
  return otro > 0 ? otro : montoElegido.value
})

const impactoActual = computed(() => {
  if (Number(montoOtro.value) > 0) {
    // Busca el impacto del tramo más cercano por debajo
    const tramo = [...montos].reverse().find((m) => montoFinal.value >= m)
    return tramo ? impactos[tramo] : 'Cada aporte suma a los programas'
  }
  return impactos[montoElegido.value]
})

function pesos(n) {
  return '$' + Number(n).toLocaleString('es-CO')
}

function elegirMonto(m) {
  montoElegido.value = m
  montoOtro.value = ''
}

function donar() {
  enviado.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function reiniciar() {
  enviado.value = false
  montoElegido.value = 50000
  montoOtro.value = ''
  donante.value = { nombre: '', correo: '', mensaje: '' }
}
</script>

<template>
  <section class="cabecera-pagina">
    <div class="contenedor">
      <p class="etiqueta">Apoya el arte</p>
      <h1 class="titulo-l">Tu donación mueve el telón</h1>
      <p class="parrafo">
        Cada peso llega directamente a los programas y artistas de
        Fundación Andamio.
      </p>
    </div>
  </section>

  <section class="seccion seccion--clara">
    <div class="contenedor">
      <!-- ============ CONFIRMACIÓN ============ -->
      <div v-if="enviado" class="confirmacion tarjeta">
        <p class="etiqueta etiqueta--claro">Donación registrada</p>
        <h2 class="titulo-m">Gracias por apoyar la escena</h2>
        <p class="parrafo">
          Tu aporte de {{ pesos(montoFinal) }}
          {{ frecuencia === 'mensual' ? 'mensual' : '' }} queda registrado.
          Enviamos el certificado de donación a
          {{ donante.correo || 'tu correo' }} dentro de los próximos días.
        </p>
        <button class="btn btn--morado" @click="reiniciar">Hacer otra donación</button>
      </div>

      <div v-else class="columnas">
        <!-- ============ FORMULARIO ============ -->
        <div>
          <!-- Frecuencia -->
          <div class="frecuencias">
            <button
              v-for="f in frecuencias"
              :key="f.id"
              class="frecuencia"
              :class="{ 'frecuencia--activa': frecuencia === f.id }"
              @click="frecuencia = f.id"
            >
              {{ f.nombre }}
            </button>
          </div>

          <p class="campo__label">Elige un monto</p>
          <div class="montos">
            <button
              v-for="m in montos"
              :key="m"
              class="seleccionable monto"
              :class="{ activa: montoElegido === m && !montoOtro }"
              @click="elegirMonto(m)"
            >
              {{ pesos(m) }}
            </button>

            <div class="monto monto--otro" :class="{ activa: Number(montoOtro) > 0 }">
              <span class="monto__signo">$</span>
              <input
                v-model="montoOtro"
                class="monto__input"
                type="number"
                min="1000"
                placeholder="Otro"
                aria-label="Otro monto"
              />
            </div>
          </div>

          <!-- Impacto -->
          <div class="impacto">
            <p class="etiqueta etiqueta--claro impacto__titulo">Tu impacto</p>
            <p class="impacto__texto">{{ impactoActual }}</p>
          </div>

          <!-- Datos del donante -->
          <div class="campo">
            <label class="campo__label" for="d-nombre">Nombre (opcional)</label>
            <input id="d-nombre" v-model="donante.nombre" class="campo__input" type="text" placeholder="Anónimo" />
          </div>

          <div class="campo">
            <label class="campo__label" for="d-correo">Correo electrónico</label>
            <input id="d-correo" v-model="donante.correo" class="campo__input" type="email" placeholder="tu@correo.com" />
          </div>

          <div class="campo">
            <label class="campo__label" for="d-msj">Mensaje (opcional)</label>
            <textarea
              id="d-msj"
              v-model="donante.mensaje"
              class="campo__area"
              placeholder="¿Hay algo que quieras compartir con el equipo?"
            ></textarea>
          </div>

          <button class="btn btn--morado btn--bloque" @click="donar">
            Continuar con {{ pesos(montoFinal) }} →
          </button>
        </div>

        <!-- ============ LATERAL ============ -->
        <aside class="lateral">
          <div class="tarjeta">
            <p class="etiqueta">A dónde va tu aporte</p>
            <ul class="impactos">
              <li v-for="m in montos" :key="m" class="impactos__item">
                <span class="impactos__monto">{{ pesos(m) }}</span>
                <span class="impactos__texto">{{ impactos[m] }}</span>
              </li>
            </ul>
          </div>

          <div class="tarjeta">
            <p class="etiqueta">Transparencia</p>
            <div v-for="t in transparencia" :key="t.area" class="barra">
              <div class="barra__fila">
                <span>{{ t.area }}</span>
                <span class="barra__pct">{{ t.porcentaje }}%</span>
              </div>
              <div class="progreso">
                <div class="progreso__relleno" :style="{ width: t.porcentaje + '%' }"></div>
              </div>
            </div>
            <p class="nota">
              Fundación Andamio publica informes financieros anuales auditados.
            </p>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.columnas {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2.5rem;
  align-items: start;
}

/* ---------- FRECUENCIA ---------- */
.frecuencias {
  display: inline-flex;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  overflow: hidden;
  margin-bottom: 2rem;
}

.frecuencia {
  background: var(--blanco);
  border: none;
  padding: 0.7rem 1.5rem;
  font-size: 0.88rem;
  color: var(--gris);
  transition: all 0.18s ease;
}
.frecuencia--activa { background: var(--morado-acento); color: var(--blanco); }

/* ---------- MONTOS ---------- */
.montos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
  margin-bottom: 1.5rem;
}

.monto {
  padding: 0.95rem 1rem;
  text-align: center;
  font-family: var(--mono);
  font-size: 0.92rem;
  color: var(--tinta);
}

.monto--otro {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--blanco);
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  padding-inline: 1rem;
}
.monto--otro.activa { border-color: var(--morado-acento); background: var(--lila-fondo); }

.monto__signo { color: var(--gris); }

.monto__input {
  width: 100%;
  border: none;
  background: transparent;
  font-family: var(--mono);
  font-size: 0.92rem;
  color: var(--tinta);
}
.monto__input:focus { outline: none; }
/* Quita las flechitas del input number */
.monto__input::-webkit-outer-spin-button,
.monto__input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.monto__input { -moz-appearance: textfield; appearance: textfield; }

/* ---------- IMPACTO ---------- */
.impacto {
  background: var(--lila-fondo);
  border: 1px solid var(--morado-acento);
  border-radius: var(--radio);
  padding: 1.1rem 1.4rem;
  margin-bottom: 2rem;
}
.impacto__titulo { margin-bottom: 0.3rem; }
.impacto__texto  { margin: 0; font-weight: 600; }

/* ---------- LATERAL ---------- */
.lateral {
  display: grid;
  gap: 1.25rem;
  position: sticky;
  top: 100px;
}

.impactos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.impactos__item { display: grid; gap: 0.15rem; }

.impactos__monto {
  font-family: var(--mono);
  font-size: 0.9rem;
  color: var(--morado-acento);
}
.impactos__texto { font-size: 0.82rem; color: var(--gris); }

.barra { margin-bottom: 1rem; }

.barra__fila {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.82rem;
  margin-bottom: 0.35rem;
}
.barra__pct { font-family: var(--mono); color: var(--morado-acento); }

.nota {
  font-size: 0.75rem;
  color: var(--gris);
  margin: 1rem 0 0;
}

/* ---------- CONFIRMACIÓN ---------- */
.confirmacion { max-width: 560px; padding: 2.5rem; }
.confirmacion .parrafo { margin: 1rem 0 1.75rem; }

/* ---------- RESPONSIVE ---------- */
@media (max-width: 900px) {
  .columnas { grid-template-columns: 1fr; }
  .lateral { position: static; }
}

@media (max-width: 560px) {
  .montos { grid-template-columns: repeat(2, 1fr); }
}
</style>