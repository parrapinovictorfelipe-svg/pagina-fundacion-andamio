<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'

const route = useRoute()

/* ---------- DATOS (vienen de Supabase) ---------- */
const obras = ref([])
const funciones = ref([])
const tiposTodos = ref([])
const vendidas = ref({})
const instruccionesPago = ref('')
const mensajeGratis = ref('')
const cargando = ref(true)
const errorCarga = ref('')

/* ---------- ESTADO ---------- */
const paso = ref(1)
const obraId = ref(null)
const fechaId = ref(null)
const cantidades = ref({})
const datos = ref({ nombre: '', correo: '', telefono: '', documento: '' })
const enviando = ref(false)
const errorCompra = ref('')
const compra = ref(null)

/* ---------- DERIVADOS ---------- */
const obrasConFunciones = computed(() =>
  obras.value.filter((o) => funciones.value.some((f) => f.obra_id === o.id))
)
const obra = computed(() => obras.value.find((o) => o.id === obraId.value) || null)
const fechasObra = computed(() => funciones.value.filter((f) => f.obra_id === obraId.value))
const fecha = computed(() => funciones.value.find((f) => f.id === fechaId.value) || null)

// Las boletas y el cargo dependen de la función elegida
const tipos = computed(() => tiposTodos.value.filter((t) => t.funcion_id === fechaId.value))
const cargoServicio = computed(() => Number(fecha.value?.cargo_servicio) || 0)

// Función gratuita: todas sus boletas valen 0 y no tiene cargo por servicio
const esGratis = computed(
  () =>
    !!fecha.value &&
    tipos.value.length > 0 &&
    cargoServicio.value === 0 &&
    tipos.value.every((t) => Number(t.valor) === 0)
)

const lineas = computed(() =>
  tipos.value
    .filter((t) => (cantidades.value[t.id] || 0) > 0)
    .map((t) => ({
      ...t,
      cantidad: cantidades.value[t.id],
      subtotal: Number(t.valor) * cantidades.value[t.id],
    }))
)
const totalBoletas = computed(() => lineas.value.reduce((s, l) => s + l.cantidad, 0))
const subtotal = computed(() => lineas.value.reduce((s, l) => s + l.subtotal, 0))
const total = computed(() => (totalBoletas.value ? subtotal.value + cargoServicio.value : 0))

const datosCompletos = computed(
  () => datos.value.nombre && datos.value.correo && datos.value.telefono && datos.value.documento
)

/* ---------- FORMATOS ---------- */
const pesos = (n) => '$' + Number(n || 0).toLocaleString('es-CO')
const formatoDia = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
const formatoHora = (iso) =>
  new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })

// Texto "Desde $X" de cada obra, con el precio más bajo de sus funciones
function textoDesde(idObra) {
  const ids = funciones.value.filter((f) => f.obra_id === idObra).map((f) => f.id)
  const valores = tiposTodos.value
    .filter((t) => ids.includes(t.funcion_id))
    .map((t) => Number(t.valor))
  if (!valores.length) return ''
  const minimo = Math.min(...valores)
  return minimo === 0 ? 'Entrada gratuita' : 'Desde ' + pesos(minimo)
}

function disponibles(f) {
  return Math.max(0, (f.aforo || 0) - (vendidas.value[f.id] || 0))
}
function ocupado(f) {
  return f.aforo ? 100 - (disponibles(f) / f.aforo) * 100 : 100
}
const maxBoletas = computed(() => (fecha.value ? Math.min(10, disponibles(fecha.value)) : 10))

/* ---------- CARGA ---------- */
async function recargarCupos() {
  const { data } = await supabase.rpc('cupos_funciones')
  const mapa = {}
  for (const c of data || []) mapa[c.funcion_id] = Number(c.vendidas)
  vendidas.value = mapa
}

async function cargar() {
  try {
    const [rObras, rFunc, rTipos, rConfig] = await Promise.all([
      supabase.from('obras').select('*').eq('activa', true).order('titulo', { ascending: true }),
      supabase
        .from('funciones')
        .select('*')
        .gte('fecha', new Date().toISOString())
        .order('fecha', { ascending: true }),
      supabase
        .from('tipos_boleta')
        .select('*')
        .eq('activo', true)
        .not('funcion_id', 'is', null)
        .order('orden', { ascending: true }),
      supabase.from('configuracion').select('clave, valor').in('clave', ['instrucciones_pago', 'mensaje_gratis']),
    ])
    for (const r of [rObras, rFunc, rTipos]) if (r.error) throw r.error

    obras.value = rObras.data
    funciones.value = rFunc.data
    tiposTodos.value = rTipos.data
    for (const c of rConfig.data || []) {
      if (c.clave === 'instrucciones_pago') instruccionesPago.value = c.valor || ''
      if (c.clave === 'mensaje_gratis') mensajeGratis.value = c.valor || ''
    }
    await recargarCupos()

    // Si viene desde la página Funciones (?obra=ID), se elige esa obra
    const id = Number(route.query.obra)
    if (id && obrasConFunciones.value.some((o) => o.id === id)) {
      elegirObra(id)
      paso.value = 2
    }
  } catch (e) {
    console.error(e)
    errorCarga.value = 'No pudimos cargar la boletería. Intenta de nuevo en un momento.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

/* ---------- ACCIONES ---------- */
function elegirObra(id) {
  obraId.value = id
  fechaId.value = null
  cantidades.value = {}
}

function elegirFecha(f) {
  if (disponibles(f) <= 0) return
  fechaId.value = f.id
  cantidades.value = {}
}

function cambiar(tipoId, delta) {
  const nuevo = (cantidades.value[tipoId] || 0) + delta
  if (nuevo < 0) return
  if (delta > 0 && totalBoletas.value >= maxBoletas.value) return
  cantidades.value = { ...cantidades.value, [tipoId]: nuevo }
}

function avanzar() {
  if (paso.value < 4) paso.value += 1
}

function volver() {
  if (paso.value > 1) paso.value -= 1
}

async function confirmar() {
  errorCompra.value = ''
  enviando.value = true
  try {
    const { data, error } = await supabase.rpc('crear_compra', {
      p_funcion_id: fechaId.value,
      p_nombre: datos.value.nombre,
      p_correo: datos.value.correo,
      p_telefono: datos.value.telefono,
      p_documento: datos.value.documento,
      p_items: lineas.value.map((l) => ({ tipo_id: l.id, cantidad: l.cantidad })),
    })
    if (error) throw error
    compra.value = data
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    errorCompra.value = e.message || 'No se pudo registrar la reserva. Intenta de nuevo.'
    await recargarCupos()
  } finally {
    enviando.value = false
  }
}

async function reiniciar() {
  paso.value = 1
  obraId.value = null
  fechaId.value = null
  cantidades.value = {}
  datos.value = { nombre: '', correo: '', telefono: '', documento: '' }
  errorCompra.value = ''
  compra.value = null
  await recargarCupos()
}
</script>

<template>
  <section class="cabecera-pagina">
    <div class="contenedor">
      <p class="etiqueta">Compra en línea</p>
      <h1 class="titulo-l">Boletería</h1>
    </div>
  </section>

  <section class="seccion seccion--clara">
    <div class="contenedor">
      <p v-if="cargando" class="estado-vacio">Cargando funciones...</p>
      <p v-else-if="errorCarga" class="estado-vacio">{{ errorCarga }}</p>
      <p v-else-if="obrasConFunciones.length === 0 && !compra" class="estado-vacio">
        Por ahora no hay funciones a la venta. Vuelve pronto.
      </p>

      <!-- ============ RESERVA REGISTRADA ============ -->
      <div v-else-if="compra" class="confirmacion tarjeta">
        <p class="etiqueta etiqueta--claro">Reserva registrada</p>
        <h2 class="titulo-m">Tu código es <span class="codigo">{{ compra.codigo }}</span></h2>
        <p class="parrafo">
          Reservamos {{ totalBoletas }} {{ totalBoletas === 1 ? 'boleta' : 'boletas' }}
          para {{ obra.titulo }}, {{ formatoDia(fecha.fecha) }} a las {{ formatoHora(fecha.fecha) }}.
          Total a pagar: {{ Number(compra.total) === 0 ? 'ninguno, la entrada es gratuita' : pesos(compra.total) }}. Guarda este código.
        </p>
        <p v-if="instruccionesPago && total > 0" class="instrucciones">{{ instruccionesPago }}</p>
        <button class="btn btn--morado" @click="reiniciar">Reservar otra función</button>
      </div>

      <template v-else>
        <!-- ============ INDICADOR DE PASOS ============ -->
        <nav v-if="!esGratis" class="pasos" aria-label="Progreso de compra">
          <span class="paso" :class="{ 'paso--activo': paso === 1, 'paso--hecho': paso > 1 }">
            <span class="paso__num">1</span> Función
          </span>
          <span class="pasos__sep">›</span>
          <span class="paso" :class="{ 'paso--activo': paso === 2, 'paso--hecho': paso > 2 }">
            <span class="paso__num">2</span> Boletas
          </span>
          <span class="pasos__sep">›</span>
          <span class="paso" :class="{ 'paso--activo': paso === 3, 'paso--hecho': paso > 3 }">
            <span class="paso__num">3</span> Datos
          </span>
          <span class="pasos__sep">›</span>
          <span class="paso" :class="{ 'paso--activo': paso === 4 }">
            <span class="paso__num">4</span> Confirmar
          </span>
        </nav>

        <!-- ============ PASO 1: FUNCIÓN ============ -->
        <div v-if="paso === 1">
          <h2 class="titulo-m bloque__titulo">Selecciona una función</h2>

          <div class="obras-grid">
            <button
              v-for="o in obrasConFunciones"
              :key="o.id"
              class="seleccionable obra-mini"
              :class="{ activa: obraId === o.id }"
              @click="elegirObra(o.id)"
            >
              <img v-if="o.imagen_url" :src="o.imagen_url" :alt="o.titulo" class="obra-mini__foto" />
              <div v-else class="obra-mini__foto obra-mini__foto--vacia">Sin foto</div>
              <div>
                <span class="obra-mini__genero">{{ o.genero }}</span>
                <p class="titulo-s obra-mini__titulo">{{ o.titulo }}</p>
                <p v-if="textoDesde(o.id)" class="obra-mini__precio">{{ textoDesde(o.id) }}</p>
              </div>
            </button>
          </div>

          <button class="btn btn--morado" :disabled="!obraId" @click="avanzar">
            Continuar →
          </button>
        </div>

        <!-- ============ PASO 2: BOLETAS ============ -->
        <div v-else-if="paso === 2" class="columnas">
          <div>
            <div class="resumen-obra">
              <img v-if="obra.imagen_url" :src="obra.imagen_url" :alt="obra.titulo" class="resumen-obra__foto" />
              <div v-else class="resumen-obra__foto resumen-obra__foto--vacia">Sin foto</div>
              <div>
                <p class="titulo-s">{{ obra.titulo }}</p>
                <p v-if="obra.genero" class="resumen-obra__meta">{{ obra.genero }}</p>
                <p v-if="obra.compania" class="resumen-obra__meta">Producción: {{ obra.compania }}</p>
                <p v-if="obra.duracion || obra.publico" class="resumen-obra__meta">
                  {{ obra.duracion }}<span v-if="obra.duracion && obra.publico"> · </span>{{ obra.publico }}
                </p>
              </div>
            </div>

            <p class="campo__label">Fecha de función</p>
            <div class="fechas-grid">
              <button
                v-for="f in fechasObra"
                :key="f.id"
                class="seleccionable fecha"
                :class="{ activa: fechaId === f.id, 'fecha--agotada': disponibles(f) <= 0 }"
                :disabled="disponibles(f) <= 0"
                @click="elegirFecha(f)"
              >
                <p class="fecha__dia">{{ formatoDia(f.fecha) }}</p>
                <p class="fecha__hora">{{ formatoHora(f.fecha) }}</p>
                <p class="fecha__sala">{{ f.sala }}</p>
                <div class="progreso fecha__progreso">
                  <div class="progreso__relleno" :style="{ width: ocupado(f) + '%' }"></div>
                </div>
                <p class="fecha__cupos">
                  {{ disponibles(f) > 0 ? disponibles(f) + ' disponibles' : 'Agotada' }}
                </p>
              </button>
            </div>

            <p v-if="!esGratis" class="campo__label tipos__titulo">Tipo de boleta</p>
            <div v-if="esGratis" class="aviso-gratis">
              <p class="aviso-gratis__titulo">Entrada gratuita</p>
              <p class="aviso-gratis__texto">
                {{ mensajeGratis || 'Esta función es gratuita. Llega a la sala y no te quedes sin tu asiento.' }}
              </p>
              <p class="aviso-gratis__datos">
                {{ formatoDia(fecha.fecha) }} · {{ formatoHora(fecha.fecha) }} · {{ fecha.sala }}
              </p>
            </div>
            <p v-if="tipos.length === 0" class="estado-vacio">{{ fechaId ? 'Esta función no tiene boletas a la venta.' : 'Primero elige una fecha para ver las boletas y sus precios.' }}</p>
            <div v-else-if="!esGratis" class="tipos tarjeta">
              <div v-for="t in tipos" :key="t.id" class="tipo">
                <div>
                  <p class="tipo__nombre">{{ t.nombre }}</p>
                  <p v-if="t.detalle" class="tipo__detalle">{{ t.detalle }}</p>
                </div>
                <div class="tipo__control">
                  <span class="precio tipo__precio">{{ Number(t.valor) === 0 ? 'Gratis' : pesos(t.valor) }}</span>
                  <button class="contador" :disabled="!fechaId" @click="cambiar(t.id, -1)" aria-label="Quitar una">−</button>
                  <span class="contador__valor">{{ cantidades[t.id] || 0 }}</span>
                  <button class="contador" :disabled="!fechaId" @click="cambiar(t.id, 1)" aria-label="Agregar una">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen lateral -->
          <aside v-if="!esGratis" class="resumen tarjeta">
            <p class="etiqueta">Resumen</p>
            <p class="titulo-s">{{ obra.titulo }}</p>
            <p v-if="fecha" class="resumen__fecha">
              {{ formatoDia(fecha.fecha) }} · {{ formatoHora(fecha.fecha) }} · {{ fecha.sala }}
            </p>
            <p v-else class="resumen__aviso">Selecciona una fecha</p>

            <hr class="resumen__linea" />

            <p v-if="!totalBoletas" class="resumen__aviso">Selecciona al menos una boleta</p>
            <ul v-else class="resumen__lista">
              <li v-for="l in lineas" :key="l.id">
                <span>{{ l.nombre }} × {{ l.cantidad }}</span>
                <span>{{ l.subtotal === 0 ? 'Gratis' : pesos(l.subtotal) }}</span>
              </li>
              <li v-if="cargoServicio">
                <span>Cargo por servicio</span>
                <span>{{ pesos(cargoServicio) }}</span>
              </li>
            </ul>

            <div class="resumen__total">
              <span>Total</span>
              <span class="precio">{{ totalBoletas && total === 0 ? 'Gratis' : pesos(total) }}</span>
            </div>

            <button
              class="btn btn--morado btn--bloque"
              :disabled="!fechaId || !totalBoletas"
              @click="avanzar"
            >
              Continuar →
            </button>
            <button class="volver" @click="volver">← Cambiar función</button>
          </aside>
        </div>

        <!-- ============ PASO 3: DATOS ============ -->
        <div v-else-if="paso === 3" class="formulario">
          <h2 class="titulo-m bloque__titulo">Tus datos</h2>

          <div class="campo">
            <label class="campo__label" for="nombre">Nombre completo</label>
            <input id="nombre" v-model="datos.nombre" class="campo__input" type="text" placeholder="Nombre y apellido" />
          </div>

          <div class="campo">
            <label class="campo__label" for="correo">Correo electrónico</label>
            <input id="correo" v-model="datos.correo" class="campo__input" type="email" placeholder="tucorreo@email.com" />
          </div>

          <div class="campo">
            <label class="campo__label" for="tel">Teléfono / WhatsApp</label>
            <input id="tel" v-model="datos.telefono" class="campo__input" type="tel" placeholder="+57 300 123 4567" />
          </div>

          <div class="campo">
            <label class="campo__label" for="doc">Documento de identidad</label>
            <input id="doc" v-model="datos.documento" class="campo__input" type="text" placeholder="1234567890" />
          </div>

          <div class="acciones">
            <button class="btn btn--fantasma" @click="volver">← Atrás</button>
            <button class="btn btn--morado" :disabled="!datosCompletos" @click="avanzar">
              Continuar →
            </button>
          </div>
        </div>

        <!-- ============ PASO 4: CONFIRMAR ============ -->
        <div v-else class="columnas">
          <div>
            <h2 class="titulo-m bloque__titulo">Revisa tu reserva</h2>

            <div class="tarjeta revision">
              <p class="revision__linea"><strong>{{ datos.nombre }}</strong></p>
              <p class="revision__linea">{{ datos.correo }} · {{ datos.telefono }}</p>
              <p class="revision__linea">Documento: {{ datos.documento }}</p>
            </div>

            <p v-if="instruccionesPago && total > 0" class="instrucciones">{{ instruccionesPago }}</p>
            <p v-if="errorCompra" class="error-compra">{{ errorCompra }}</p>
          </div>

          <aside class="resumen tarjeta">
            <p class="etiqueta">Resumen</p>
            <p class="titulo-s">{{ obra.titulo }}</p>
            <p class="resumen__fecha">
              {{ formatoDia(fecha.fecha) }} · {{ formatoHora(fecha.fecha) }} · {{ fecha.sala }}
            </p>

            <hr class="resumen__linea" />

            <ul class="resumen__lista">
              <li v-for="l in lineas" :key="l.id">
                <span>{{ l.nombre }} × {{ l.cantidad }}</span>
                <span>{{ l.subtotal === 0 ? 'Gratis' : pesos(l.subtotal) }}</span>
              </li>
              <li v-if="cargoServicio">
                <span>Cargo por servicio</span>
                <span>{{ pesos(cargoServicio) }}</span>
              </li>
            </ul>

            <div class="resumen__total">
              <span>Total</span>
              <span class="precio">{{ totalBoletas && total === 0 ? 'Gratis' : pesos(total) }}</span>
            </div>

            <button class="btn btn--morado btn--bloque" :disabled="enviando" @click="confirmar">
              {{ enviando ? 'Reservando...' : 'Reservar boletas' }}
            </button>
            <button class="volver" @click="volver">← Atrás</button>
          </aside>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.bloque__titulo { margin-bottom: 1.75rem; }

.columnas {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
  align-items: start;
}

/* ---------- PASO 1 ---------- */
.obras-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.obra-mini {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 1rem;
  padding: 1rem;
}

.obra-mini__foto {
  width: 90px;
  height: 90px;
  border-radius: var(--radio);
  object-fit: cover;
}

.obra-mini__genero {
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  color: var(--gris);
}

.obra-mini__titulo { margin: 0.3rem 0 0.2rem; }
.obra-mini__autor  { font-size: 0.82rem; color: var(--gris); margin: 0 0 0.4rem; }
.obra-mini__precio { font-size: 0.85rem; font-weight: 600; color: var(--morado-acento); margin: 0; }

/* ---------- PASO 2 ---------- */
.resumen-obra {
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 1rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--borde-claro);
}
.resumen-obra__foto {
  width: 70px; height: 70px;
  border-radius: var(--radio);
  object-fit: cover;
}
.resumen-obra__meta { font-size: 0.82rem; color: var(--gris); margin: 0.2rem 0 0; }

.fechas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.fecha { padding: 1rem; }
.fecha__dia  { font-weight: 600; margin: 0; }
.fecha__hora { font-family: var(--mono); font-size: 0.82rem; margin: 0.2rem 0; }
.fecha__sala { font-size: 0.78rem; color: var(--gris); margin: 0 0 0.75rem; }
.fecha__progreso { margin-bottom: 0.4rem; }
.fecha__cupos { font-size: 0.72rem; color: var(--gris); margin: 0; }

.tipos__titulo { margin-top: 0; }
.tipos { padding: 0; }

.tipo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--borde-claro);
}
.tipo:last-child { border-bottom: none; }

.tipo__nombre  { font-weight: 600; margin: 0; }
.tipo__detalle { font-size: 0.8rem; color: var(--gris); margin: 0; }

.tipo__control { display: flex; align-items: center; gap: 0.75rem; }
.tipo__precio { font-size: 1.2rem; }

.contador {
  width: 30px; height: 30px;
  display: grid; place-items: center;
  background: var(--blanco);
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  color: var(--tinta);
  font-size: 1rem;
}
.contador:hover { border-color: var(--morado-acento); color: var(--morado-acento); }

.contador__valor {
  font-family: var(--mono);
  min-width: 18px;
  text-align: center;
}

/* ---------- RESUMEN LATERAL ---------- */
.resumen { position: sticky; top: 100px; }

.resumen__fecha { font-size: 0.85rem; color: var(--gris); margin: 0.35rem 0 0; }

.resumen__aviso {
  font-size: 0.85rem;
  font-style: italic;
  color: var(--gris);
  margin: 0;
}

.resumen__linea {
  border: none;
  border-top: 1px solid var(--borde-claro);
  margin: 1.25rem 0;
}

.resumen__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
  font-size: 0.88rem;
}
.resumen__lista li { display: flex; justify-content: space-between; gap: 1rem; }

.resumen__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1.25rem 0;
  padding-top: 1.25rem;
  border-top: 1px solid var(--borde-claro);
  font-weight: 600;
}

.resumen__envio {
  font-size: 0.78rem;
  color: var(--gris);
  margin: 0 0 1rem;
}

.volver {
  display: block;
  width: 100%;
  margin-top: 0.85rem;
  background: none;
  border: none;
  font-size: 0.85rem;
  color: var(--gris);
}
.volver:hover { color: var(--morado-acento); }

/* ---------- PASO 3 ---------- */
.formulario { max-width: 520px; }
.acciones { display: flex; gap: 1rem; margin-top: 1.5rem; }

/* ---------- PASO 4 ---------- */
.metodos { display: grid; gap: 1rem; margin-bottom: 2rem; }

.metodo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.5rem;
  cursor: pointer;
}
.metodo__nombre  { font-weight: 600; margin: 0; }
.metodo__detalle { font-size: 0.82rem; color: var(--gris); margin: 0; }
.metodo input { accent-color: var(--morado-acento); width: 18px; height: 18px; }

.datos-tarjeta { padding: 1.5rem; }
.datos-tarjeta .campo:last-child { margin-bottom: 0; }

/* ---------- CONFIRMACIÓN ---------- */
.confirmacion { max-width: 560px; padding: 2.5rem; }
.confirmacion .parrafo { margin: 1rem 0 1.75rem; }

/* ---------- RESPONSIVE ---------- */
@media (max-width: 900px) {
  .columnas { grid-template-columns: 1fr; }
  .resumen { position: static; }
  .obras-grid { grid-template-columns: 1fr; }
}
</style>
<style scoped>
.estado-vacio { padding: 2rem 0; color: var(--gris); }

.obra-mini__foto--vacia,
.resumen-obra__foto--vacia {
  display: grid;
  place-items: center;
  background: var(--claro);
  border: 1px dashed var(--borde-claro);
  font-size: 0.65rem;
  color: var(--gris);
  text-align: center;
}

.fecha--agotada { opacity: 0.55; cursor: not-allowed; }
.contador:disabled { opacity: 0.4; cursor: default; }

.revision { padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; }
.revision__linea { margin: 0 0 0.3rem; font-size: 0.92rem; }

.instrucciones {
  margin: 1.5rem 0;
  padding: 1.25rem 1.5rem;
  border-left: 3px solid var(--morado-acento);
  background: var(--lila-fondo);
  font-size: 0.92rem;
  white-space: pre-line;
}
.error-compra { color: #b34242; font-size: 0.88rem; margin: 0 0 1rem; }
.codigo { font-family: var(--mono); color: var(--morado-acento); }
</style>

<style scoped>
.aviso-gratis {
  padding: 1.75rem;
  border: 1px solid var(--morado-acento);
  border-left-width: 4px;
  border-radius: var(--radio);
  background: var(--lila-fondo);
}
.aviso-gratis__titulo {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--morado-acento);
  margin: 0 0 0.5rem;
}
.aviso-gratis__texto {
  font-family: var(--serif);
  font-size: 1.35rem;
  line-height: 1.35;
  margin: 0 0 0.75rem;
}
.aviso-gratis__datos {
  font-size: 0.9rem;
  color: var(--gris);
  margin: 0;
}
</style>
