<script setup>
import { ref, computed } from 'vue'
import galeria from '@/assets/galeria.js'


const obras = [
  {
    id: 1, genero: 'Teatro folclórico', titulo: 'El Bunde del Agua',
    duracion: 'EDITAR', publico: 'EDITAR', desde: 0,
    imagen: galeria[19].src,
    fechas: [
      { id: 'a', fecha: 'EDITAR', hora: 'EDITAR', sala: 'EDITAR', disponibles: 0, total: 100 },
    ],
  },
  {
    id: 2, genero: 'Teatro contemporáneo', titulo: 'Lluvia Roja',
    duracion: 'EDITAR', publico: 'EDITAR', desde: 0,
    imagen: galeria[15].src,
    fechas: [
      { id: 'a', fecha: 'EDITAR', hora: 'EDITAR', sala: 'EDITAR', disponibles: 0, total: 100 },
    ],
  },
  {
    id: 3, genero: 'Teatro contemporáneo', titulo: 'Gotita Herida',
    duracion: 'EDITAR', publico: 'EDITAR', desde: 0,
    imagen: galeria[12].src,
    fechas: [
      { id: 'a', fecha: 'EDITAR', hora: 'EDITAR', sala: 'EDITAR', disponibles: 0, total: 100 },
    ],
  },
  {
    id: 4, genero: 'Comedia', titulo: 'La Abuela Pone la Casa y Nosotros Ponemos el Drama',
    duracion: 'EDITAR', publico: 'EDITAR', desde: 0,
    imagen: galeria[8].src,
    fechas: [
      { id: 'a', fecha: 'EDITAR', hora: 'EDITAR', sala: 'EDITAR', disponibles: 0, total: 100 },
    ],
  },
  {
    id: 5, genero: 'Títeres / Infantil', titulo: 'Títeres El Sol y La Luna',
    duracion: 'EDITAR', publico: 'Todo público', desde: 0,
    imagen: galeria[1].src,
    fechas: [
      { id: 'a', fecha: 'EDITAR', hora: 'EDITAR', sala: 'EDITAR', disponibles: 0, total: 100 },
    ],
  },
  {
    id: 6, genero: 'Teatro comunitario', titulo: 'En la Mitad del Río',
    duracion: 'EDITAR', publico: 'EDITAR', desde: 0,
    imagen: galeria[5].src,
    fechas: [
      { id: 'a', fecha: 'EDITAR', hora: 'EDITAR', sala: 'EDITAR', disponibles: 0, total: 100 },
    ],
  },
  {
    id: 7, genero: 'Teatro folclórico', titulo: 'Negrita',
    duracion: 'EDITAR', publico: 'EDITAR', desde: 0,
    imagen: galeria[20].src,
    fechas: [
      { id: 'a', fecha: 'EDITAR', hora: 'EDITAR', sala: 'EDITAR', disponibles: 0, total: 100 },
    ],
  },
]

const tiposBoleta = [
  { id: 'general',    nombre: 'General',               detalle: 'Localidad general',        valor: 35000 },
  { id: 'estudiante', nombre: 'Estudiante / Comunidad', detalle: 'Con carné vigente',        valor: 18000 },
  { id: 'vip',        nombre: 'VIP',                    detalle: 'Primera fila + Meet & Greet', valor: 65000 },
]

const metodosPago = [
  { id: 'tarjeta',  nombre: 'Tarjeta de crédito o débito', detalle: 'Visa, Mastercard, Amex' },
  { id: 'pse',      nombre: 'PSE — Transferencia bancaria', detalle: 'Débito directo desde tu banco' },
  { id: 'efectivo', nombre: 'Efectivo (Bancolombia / Efecty)', detalle: 'Paga en puntos autorizados' },
]

const CARGO_SERVICIO = 3500

/* ---------- ESTADO ---------- */
const paso = ref(1)
const obraId = ref(null)
const fechaId = ref(null)
const cantidades = ref({ general: 0, estudiante: 0, vip: 0 })
const datos = ref({ nombre: '', correo: '', telefono: '', documento: '' })
const metodo = ref('tarjeta')
const tarjeta = ref({ numero: '', vencimiento: '', cvv: '' })
const compraLista = ref(false)

/* ---------- DERIVADOS ---------- */
const obra = computed(() => obras.find((o) => o.id === obraId.value) || null)
const fecha = computed(() => obra.value?.fechas.find((f) => f.id === fechaId.value) || null)

const lineas = computed(() =>
  tiposBoleta
    .filter((t) => cantidades.value[t.id] > 0)
    .map((t) => ({ ...t, cantidad: cantidades.value[t.id], subtotal: t.valor * cantidades.value[t.id] }))
)

const totalBoletas = computed(() => lineas.value.reduce((s, l) => s + l.cantidad, 0))
const subtotal = computed(() => lineas.value.reduce((s, l) => s + l.subtotal, 0))
const total = computed(() => (totalBoletas.value ? subtotal.value + CARGO_SERVICIO : 0))

const datosCompletos = computed(
  () => datos.value.nombre && datos.value.correo && datos.value.telefono && datos.value.documento
)

/* ---------- ACCIONES ---------- */
function pesos(n) {
  return '$' + Number(n).toLocaleString('es-CO')
}

function elegirObra(id) {
  obraId.value = id
  fechaId.value = null
  cantidades.value = { general: 0, estudiante: 0, vip: 0 }
}

function cambiar(tipo, delta) {
  const nuevo = cantidades.value[tipo] + delta
  if (nuevo >= 0 && nuevo <= 10) cantidades.value[tipo] = nuevo
}

function avanzar() {
  if (paso.value < 4) paso.value += 1
}

function volver() {
  if (paso.value > 1) paso.value -= 1
}

function confirmar() {
  compraLista.value = true
}

function reiniciar() {
  paso.value = 1
  obraId.value = null
  fechaId.value = null
  cantidades.value = { general: 0, estudiante: 0, vip: 0 }
  datos.value = { nombre: '', correo: '', telefono: '', documento: '' }
  tarjeta.value = { numero: '', vencimiento: '', cvv: '' }
  compraLista.value = false
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
      <!-- ============ CONFIRMACIÓN ============ -->
      <div v-if="compraLista" class="confirmacion tarjeta">
        <p class="etiqueta etiqueta--claro">Compra confirmada</p>
        <h2 class="titulo-m">Tus boletas están en camino</h2>
        <p class="parrafo">
          Enviamos {{ totalBoletas }} {{ totalBoletas === 1 ? 'boleta' : 'boletas' }}
          para {{ obra.titulo }} a {{ datos.correo }}. Preséntalas en taquilla
          desde 30 minutos antes de la función.
        </p>
        <button class="btn btn--morado" @click="reiniciar">Comprar otra función</button>
      </div>

      <template v-else>
        <!-- ============ INDICADOR DE PASOS ============ -->
        <nav class="pasos" aria-label="Progreso de compra">
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
            <span class="paso__num">4</span> Pago
          </span>
        </nav>

        <!-- ============ PASO 1: FUNCIÓN ============ -->
        <div v-if="paso === 1">
          <h2 class="titulo-m bloque__titulo">Selecciona una función</h2>

          <div class="obras-grid">
            <button
              v-for="o in obras"
              :key="o.id"
              class="seleccionable obra-mini"
              :class="{ activa: obraId === o.id }"
              @click="elegirObra(o.id)"
            >
              <img :src="o.imagen" :alt="o.titulo" class="obra-mini__foto" />
              <div>
                <span class="obra-mini__genero">{{ o.genero }}</span>
                <p class="titulo-s obra-mini__titulo">{{ o.titulo }}</p>
                <p class="obra-mini__precio">Desde {{ o.desde ? pesos(o.desde) : 'EDITAR' }}</p>
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
              <img :src="obra.imagen" :alt="obra.titulo" class="resumen-obra__foto" />
              <div>
                <p class="titulo-s">{{ obra.titulo }}</p>
                <p class="resumen-obra__meta">{{ obra.genero }}</p>
                <p class="resumen-obra__meta">{{ obra.duracion }} · {{ obra.publico }}</p>
              </div>
            </div>

            <p class="campo__label">Fecha de función</p>
            <div class="fechas-grid">
              <button
                v-for="f in obra.fechas"
                :key="f.id"
                class="seleccionable fecha"
                :class="{ activa: fechaId === f.id }"
                @click="fechaId = f.id"
              >
                <p class="fecha__dia">{{ f.fecha }}</p>
                <p class="fecha__hora">{{ f.hora }}</p>
                <p class="fecha__sala">{{ f.sala }}</p>
                <div class="progreso fecha__progreso">
                  <div
                    class="progreso__relleno"
                    :style="{ width: (100 - (f.disponibles / f.total) * 100) + '%' }"
                  ></div>
                </div>
                <p class="fecha__cupos">{{ f.disponibles }} disponibles</p>
              </button>
            </div>

            <p class="campo__label tipos__titulo">Tipo de boleta</p>
            <div class="tipos tarjeta">
              <div v-for="t in tiposBoleta" :key="t.id" class="tipo">
                <div>
                  <p class="tipo__nombre">{{ t.nombre }}</p>
                  <p class="tipo__detalle">{{ t.detalle }}</p>
                </div>
                <div class="tipo__control">
                  <span class="precio tipo__precio">{{ pesos(t.valor) }}</span>
                  <button class="contador" @click="cambiar(t.id, -1)" aria-label="Quitar una">−</button>
                  <span class="contador__valor">{{ cantidades[t.id] }}</span>
                  <button class="contador" @click="cambiar(t.id, 1)" aria-label="Agregar una">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen lateral -->
          <aside class="resumen tarjeta">
            <p class="etiqueta">Resumen</p>
            <p class="titulo-s">{{ obra.titulo }}</p>
            <p v-if="fecha" class="resumen__fecha">
              {{ fecha.fecha }} · {{ fecha.hora }} · {{ fecha.sala }}
            </p>
            <p v-else class="resumen__aviso">Selecciona una fecha</p>

            <hr class="resumen__linea" />

            <p v-if="!totalBoletas" class="resumen__aviso">Selecciona al menos una boleta</p>
            <ul v-else class="resumen__lista">
              <li v-for="l in lineas" :key="l.id">
                <span>{{ l.nombre }} × {{ l.cantidad }}</span>
                <span>{{ pesos(l.subtotal) }}</span>
              </li>
            </ul>

            <div class="resumen__total">
              <span>Total</span>
              <span class="precio">{{ pesos(total) }}</span>
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
            <input id="nombre" v-model="datos.nombre" class="campo__input" type="text" placeholder="Victor Parra" />
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

        <!-- ============ PASO 4: PAGO ============ -->
        <div v-else class="columnas">
          <div>
            <h2 class="titulo-m bloque__titulo">Método de pago</h2>

            <div class="metodos">
              <label
                v-for="m in metodosPago"
                :key="m.id"
                class="seleccionable metodo"
                :class="{ activa: metodo === m.id }"
              >
                <div>
                  <p class="metodo__nombre">{{ m.nombre }}</p>
                  <p class="metodo__detalle">{{ m.detalle }}</p>
                </div>
                <input v-model="metodo" type="radio" :value="m.id" name="pago" />
              </label>
            </div>

            <div v-if="metodo === 'tarjeta'" class="tarjeta datos-tarjeta">
              <div class="campo">
                <label class="campo__label" for="num">Número de tarjeta</label>
                <input id="num" v-model="tarjeta.numero" class="campo__input" type="text" placeholder="4242 4242 4242 4242" />
              </div>
              <div class="campo__fila">
                <div class="campo">
                  <label class="campo__label" for="venc">Vencimiento</label>
                  <input id="venc" v-model="tarjeta.vencimiento" class="campo__input" type="text" placeholder="MM/AA" />
                </div>
                <div class="campo">
                  <label class="campo__label" for="cvv">CVV</label>
                  <input id="cvv" v-model="tarjeta.cvv" class="campo__input" type="text" placeholder="123" />
                </div>
              </div>
            </div>
          </div>

          <aside class="resumen tarjeta">
            <p class="etiqueta">Resumen</p>
            <p class="titulo-s">{{ obra.titulo }}</p>
            <p class="resumen__fecha">{{ fecha.fecha }} · {{ fecha.hora }} · {{ fecha.sala }}</p>

            <hr class="resumen__linea" />

            <ul class="resumen__lista">
              <li v-for="l in lineas" :key="l.id">
                <span>{{ l.nombre }} × {{ l.cantidad }}</span>
                <span>{{ pesos(l.subtotal) }}</span>
              </li>
              <li>
                <span>Cargo por servicio</span>
                <span>{{ pesos(CARGO_SERVICIO) }}</span>
              </li>
            </ul>

            <div class="resumen__total">
              <span>Total</span>
              <span class="precio">{{ pesos(total) }}</span>
            </div>

            <p class="resumen__envio">Boletas a: {{ datos.correo }}</p>

            <button class="btn btn--morado btn--bloque" @click="confirmar">
              Confirmar compra
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