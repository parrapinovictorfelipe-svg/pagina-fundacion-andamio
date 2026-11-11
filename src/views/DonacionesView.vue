<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useContenido } from '@/lib/contenido'

const { t, listo } = useContenido()

const montos = ref([])
const minimo = ref(1000)
const instrucciones = ref('')
const linkWompi = ref('')
const linkPago = computed(() => (linkWompi.value.startsWith('https://') ? linkWompi.value : ''))
const cargando = ref(true)
const errorCarga = ref('')

const frecuencias = [
  { id: 'unica',   nombre: 'Donación única' },
  { id: 'mensual', nombre: 'Aporte mensual' },
]

const montoElegido = ref(0)
const montoOtro = ref('')
const frecuencia = ref('unica')
const donante = ref({ nombre: '', correo: '', mensaje: '' })
const enviado = ref(false)
const enviando = ref(false)
const errorEnvio = ref('')
const resultado = ref(null)

const transparencia = computed(() =>
  [1, 2, 3]
    .map((n) => ({
      area: t(`donaciones.transp.${n}.area`),
      porcentaje: Number(t(`donaciones.transp.${n}.pct`)) || 0,
    }))
    .filter((x) => x.area)
)

const montoFinal = computed(() => {
  const otro = Number(montoOtro.value)
  return otro > 0 ? otro : montoElegido.value
})

// Si el monto elegido tiene su propio link fijo en Wompi, se usa ese (el valor ya viene fijado);
// si no, se usa el link abierto, donde la persona escribe el valor
const presetConLink = computed(() => {
  const preset = montos.value.find((m) => Number(m.monto) === montoFinal.value)
  const url = (preset?.link_pago || '').trim()
  return url.startsWith('https://') ? url : ''
})
const linkFinal = computed(() => presetConLink.value || linkPago.value)
const linkEsFijo = computed(() => !!presetConLink.value)

const impactoActual = computed(() => {
  const lista = [...montos.value].sort((a, b) => Number(a.monto) - Number(b.monto))
  if (!lista.length) return ''
  const exacto = lista.find((m) => Number(m.monto) === montoFinal.value)
  if (exacto) return exacto.impacto
  const tramo = [...lista].reverse().find((m) => montoFinal.value >= Number(m.monto))
  return tramo?.impacto || 'Cada aporte suma a los programas'
})

const formValido = computed(
  () => montoFinal.value >= minimo.value && donante.value.correo.includes('@')
)

function pesos(n) {
  return '$' + Number(n).toLocaleString('es-CO')
}

function elegirMonto(m) {
  montoElegido.value = m
  montoOtro.value = ''
}

function montoPorDefecto() {
  const lista = montos.value
  montoElegido.value = lista.length ? Number(lista[Math.floor(lista.length / 2)].monto) : 0
}

async function cargar() {
  try {
    const [rM, rC] = await Promise.all([
      supabase
        .from('donacion_montos')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })
        .order('monto', { ascending: true }),
      supabase
        .from('configuracion')
        .select('clave, valor')
        .in('clave', ['instrucciones_donacion', 'donacion_minima', 'wompi_link_donacion']),
    ])
    if (rM.error) throw rM.error
    montos.value = rM.data
    for (const c of rC.data || []) {
      if (c.clave === 'instrucciones_donacion') instrucciones.value = c.valor || ''
      if (c.clave === 'donacion_minima') minimo.value = Number(c.valor) || 1000
      if (c.clave === 'wompi_link_donacion') linkWompi.value = c.valor || ''
    }
    montoPorDefecto()
  } catch (e) {
    console.error(e)
    errorCarga.value = 'No pudimos cargar los montos. Intenta de nuevo en un momento.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

async function donar() {
  errorEnvio.value = ''
  enviando.value = true
  try {
    const { data, error } = await supabase.rpc('crear_donacion', {
      p_nombre: donante.value.nombre,
      p_correo: donante.value.correo,
      p_monto: montoFinal.value,
      p_frecuencia: frecuencia.value,
      p_mensaje: donante.value.mensaje,
    })
    if (error) throw error
    resultado.value = data
    if (frecuencia.value === 'unica' && linkFinal.value) {
      window.location.href = linkFinal.value
      return
    }
    enviado.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    errorEnvio.value = e.message || 'No se pudo registrar la donación. Intenta de nuevo.'
  } finally {
    enviando.value = false
  }
}

function reiniciar() {
  enviado.value = false
  resultado.value = null
  errorEnvio.value = ''
  montoOtro.value = ''
  frecuencia.value = 'unica'
  donante.value = { nombre: '', correo: '', mensaje: '' }
  montoPorDefecto()
}
</script>

<template>
  <section v-if="listo" class="cabecera-pagina">
    <div class="contenedor">
      <p class="etiqueta">{{ t('donaciones.etiqueta') }}</p>
      <h1 class="titulo-l">{{ t('donaciones.titulo') }}</h1>
      <p class="parrafo">{{ t('donaciones.bajada') }}</p>
    </div>
  </section>

  <section class="seccion seccion--clara">
    <div class="contenedor">
      <p v-if="cargando" class="aviso">Cargando...</p>
      <p v-else-if="errorCarga" class="aviso">{{ errorCarga }}</p>

      <!-- ============ CONFIRMACIÓN ============ -->
      <div v-else-if="enviado" class="confirmacion tarjeta">
        <p class="etiqueta etiqueta--claro">Donación registrada</p>
        <h2 class="titulo-m">Gracias por apoyar la escena</h2>
        <p class="parrafo">
          Registramos tu aporte de {{ pesos(resultado.monto) }}{{ frecuencia === 'mensual' ? ' mensual' : '' }}.
          Tu código es <span class="codigo">{{ resultado.codigo }}</span>.
        </p>
        <p v-if="instrucciones" class="instrucciones">{{ instrucciones }}</p>
        <a v-if="linkFinal && frecuencia === 'unica'" :href="linkFinal" target="_blank" rel="noopener" class="btn btn--morado btn--pagar">Donar {{ pesos(resultado.monto) }} con Wompi →</a>
        <p v-if="linkFinal && frecuencia === 'unica'" class="nota-pago">{{ linkEsFijo ? 'El valor ya viene fijado en Wompi.' : 'En Wompi escribe exactamente ' + pesos(resultado.monto) + '.' }} Guarda tu código {{ resultado.codigo }}.</p>
        <button class="btn btn--morado" @click="reiniciar">Hacer otra donación</button>
      </div>

      <div v-else class="columnas">
        <!-- ============ FORMULARIO ============ -->
        <div>
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
          <p v-if="frecuencia === 'mensual' && t('donaciones.nota_mensual')" class="nota-mensual">
            {{ t('donaciones.nota_mensual') }}
          </p>

          <p class="campo__label">Elige un monto</p>
          <div class="montos">
            <button
              v-for="m in montos"
              :key="m.id"
              class="seleccionable monto"
              :class="{ activa: montoElegido === Number(m.monto) && !montoOtro }"
              @click="elegirMonto(Number(m.monto))"
            >
              {{ pesos(m.monto) }}
            </button>

            <div class="monto monto--otro" :class="{ activa: Number(montoOtro) > 0 }">
              <span class="monto__signo">$</span>
              <input
                v-model="montoOtro"
                class="monto__input"
                type="number"
                :min="minimo"
                placeholder="Otro"
                aria-label="Otro monto"
              />
            </div>
          </div>

          <div v-if="impactoActual" class="impacto">
            <p class="etiqueta etiqueta--claro impacto__titulo">Tu impacto</p>
            <p class="impacto__texto">{{ impactoActual }}</p>
          </div>

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

          <p v-if="errorEnvio" class="error-envio">{{ errorEnvio }}</p>
          <p v-else-if="montoFinal > 0 && montoFinal < minimo" class="error-envio">
            El monto mínimo es {{ pesos(minimo) }}.
          </p>

          <button class="btn btn--morado btn--bloque" :disabled="!formValido || enviando" @click="donar">
            {{ enviando ? 'Registrando...' : 'Donar ' + pesos(montoFinal) + ' →' }}
          </button>
        </div>

        <!-- ============ LATERAL ============ -->
        <aside class="lateral">
          <div v-if="montos.length" class="tarjeta">
            <p class="etiqueta">{{ t('donaciones.lateral.titulo') }}</p>
            <ul class="impactos">
              <li v-for="m in montos" :key="m.id" class="impactos__item">
                <span class="impactos__monto">{{ pesos(m.monto) }}</span>
                <span class="impactos__texto">{{ m.impacto }}</span>
              </li>
            </ul>
          </div>

          <div v-if="transparencia.length" class="tarjeta">
            <p class="etiqueta">{{ t('donaciones.transp.titulo') }}</p>
            <div v-for="x in transparencia" :key="x.area" class="barra">
              <div class="barra__fila">
                <span>{{ x.area }}</span>
                <span class="barra__pct">{{ x.porcentaje }}%</span>
              </div>
              <div class="progreso">
                <div class="progreso__relleno" :style="{ width: x.porcentaje + '%' }"></div>
              </div>
            </div>
            <p v-if="t('donaciones.transp.nota')" class="nota">{{ t('donaciones.transp.nota') }}</p>
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
<style scoped>
.aviso { padding: 2rem 0; color: var(--gris); }
.error-envio { color: #b34242; font-size: 0.88rem; margin: 0 0 1rem; }
.nota-mensual { font-size: 0.85rem; color: var(--gris); margin: -1rem 0 1.5rem; max-width: 52ch; }
.instrucciones {
  margin: 0 0 1.75rem;
  padding: 1.25rem 1.5rem;
  border-left: 3px solid var(--morado-acento);
  background: var(--lila-fondo);
  font-size: 0.92rem;
  white-space: pre-line;
}
.codigo { font-family: var(--mono); color: var(--morado-acento); }
.btn--pagar { display: inline-block; margin: 0 1rem 1rem 0; }
.nota-pago { font-size: 0.85rem; color: var(--gris); margin: 0 0 1.25rem; }
</style>
