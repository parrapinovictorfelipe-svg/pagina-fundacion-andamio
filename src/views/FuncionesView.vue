<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import galeria from '@/assets/galeria.js'

const router = useRouter()

const generos = [
  'Todas',
  'Teatro ritual',
  'Teatro contemporáneo',
  'Comedia',
  'Títeres / Infantil',
  'Teatro comunitario',
  'Teatro folclórico',
]
const generoActivo = ref('Todas')

// Todos los campos marcados EDITAR son de ejemplo — reemplázalos por
// la información real de cada obra (sinopsis, duración, fechas, precio).
const obras = [
  {
    id: 1,
    genero: 'Teatro folclórico',
    titulo: 'El Bunde del Agua',
    director: 'Dirección: EDITAR',
    sinopsis: 'EDITAR — sinopsis de El Bunde del Agua.',
    duracion: 'EDITAR',
    publico: 'EDITAR',
    desde: 0,
    alerta: null,
    imagen: galeria[19].src, // gal-20
    funciones: [{ fecha: 'EDITAR', hora: 'EDITAR', sala: 'EDITAR' }],
  },
  {
    id: 2,
    genero: 'Teatro contemporáneo',
    titulo: 'Lluvia Roja',
    director: 'Dirección: EDITAR',
    sinopsis: 'EDITAR — sinopsis de Lluvia Roja.',
    duracion: 'EDITAR',
    publico: 'EDITAR',
    desde: 0,
    alerta: null,
    imagen: galeria[15].src, // gal-16
    funciones: [{ fecha: 'EDITAR', hora: 'EDITAR', sala: 'EDITAR' }],
  },
  {
    id: 3,
    genero: 'Teatro contemporáneo',
    titulo: 'Gotita Herida',
    director: 'Dirección: EDITAR',
    sinopsis: 'EDITAR — sinopsis de Gotita Herida.',
    duracion: 'EDITAR',
    publico: 'EDITAR',
    desde: 0,
    alerta: null,
    imagen: galeria[12].src, // gal-13
    funciones: [{ fecha: 'EDITAR', hora: 'EDITAR', sala: 'EDITAR' }],
  },
  {
    id: 4,
    genero: 'Comedia',
    titulo: 'La Abuela Pone la Casa y Nosotros Ponemos el Drama',
    director: 'Dirección: EDITAR',
    sinopsis: 'EDITAR — sinopsis de La Abuela Pone la Casa y Nosotros Ponemos el Drama.',
    duracion: 'EDITAR',
    publico: 'EDITAR',
    desde: 0,
    alerta: null,
    imagen: galeria[8].src, // gal-09
    funciones: [{ fecha: 'EDITAR', hora: 'EDITAR', sala: 'EDITAR' }],
  },
  {
    id: 5,
    genero: 'Títeres / Infantil',
    titulo: 'Títeres El Sol y La Luna',
    director: 'Dirección: EDITAR',
    sinopsis: 'EDITAR — sinopsis de Títeres El Sol y La Luna.',
    duracion: 'EDITAR',
    publico: 'Todo público',
    desde: 0,
    alerta: null,
    imagen: galeria[1].src, // gal-02
    funciones: [{ fecha: 'EDITAR', hora: 'EDITAR', sala: 'EDITAR' }],
  },
  {
    id: 6,
    genero: 'Teatro comunitario',
    titulo: 'En la Mitad del Río',
    director: 'Dirección: EDITAR',
    sinopsis: 'EDITAR — sinopsis de En la Mitad del Río.',
    duracion: 'EDITAR',
    publico: 'EDITAR',
    desde: 0,
    alerta: null,
    imagen: galeria[5].src, // gal-06
    funciones: [{ fecha: 'EDITAR', hora: 'EDITAR', sala: 'EDITAR' }],
  },
  {
    id: 7,
    genero: 'Teatro folclórico',
    titulo: 'Negrita',
    director: 'Dirección: EDITAR',
    sinopsis: 'EDITAR — sinopsis de Negrita.',
    duracion: 'EDITAR',
    publico: 'EDITAR',
    desde: 0,
    alerta: null,
    imagen: galeria[20].src, // gal-21
    funciones: [{ fecha: 'EDITAR', hora: 'EDITAR', sala: 'EDITAR' }],
  },
]

const obrasFiltradas = computed(() =>
  generoActivo.value === 'Todas'
    ? obras
    : obras.filter((o) => o.genero === generoActivo.value)
)

function pesos(n) {
  return '$' + n.toLocaleString('es-CO')
}

function comprar(obra) {
  router.push({ name: 'boleteria', query: { obra: obra.id } })
}
</script>

<template>
  <section class="cabecera-pagina">
    <div class="contenedor">
      <p class="etiqueta">Temporada 2026</p>
      <h1 class="titulo-l">Cartelera</h1>
      <p class="parrafo">
        Montajes en temporada del elenco residente y de las compañías invitadas
        de Fundación Andamio.
      </p>
    </div>
  </section>

  <section class="seccion seccion--clara">
    <div class="contenedor">
      <!-- Filtros por género -->
      <div class="filtros">
        <button
          v-for="g in generos"
          :key="g"
          class="filtro"
          :class="{ 'filtro--activo': generoActivo === g }"
          @click="generoActivo = g"
        >
          {{ g }}
        </button>
      </div>

      <!-- Lista de obras -->
      <article v-for="obra in obrasFiltradas" :key="obra.id" class="obra">
        <div class="obra__marco">
          <img :src="obra.imagen" :alt="obra.titulo" class="obra__foto" />
          <span v-if="obra.alerta" class="badge badge--alerta obra__alerta">
            {{ obra.alerta }}
          </span>
        </div>

        <div class="obra__cuerpo">
          <div class="obra__encabezado">
            <span class="badge">{{ obra.genero }}</span>
            <h2 class="titulo-m">{{ obra.titulo }}</h2>
          </div>

          <p class="obra__autor">{{ obra.director }}</p>
          <p class="parrafo obra__sinopsis">{{ obra.sinopsis }}</p>

          <p class="obra__meta">
            <span>{{ obra.duracion }}</span>
            <span class="obra__punto">·</span>
            <span>{{ obra.publico }}</span>
          </p>

          <ul class="horarios">
            <li v-for="f in obra.funciones" :key="f.fecha + f.hora" class="horario">
              <span class="horario__fecha">{{ f.fecha }} · {{ f.hora }}</span>
              <span class="horario__sala">{{ f.sala }}</span>
            </li>
          </ul>

          <div class="obra__pie">
            <div>
              <p class="obra__desde">Desde</p>
              <p class="precio">{{ obra.desde ? pesos(obra.desde) : 'EDITAR' }}</p>
            </div>
            <button class="btn btn--morado" @click="comprar(obra)">
              Comprar boletas
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
/* ---------- FILTROS ---------- */
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 3rem;
}

.filtro {
  font-family: var(--mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--gris);
  background: transparent;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  padding: 0.5rem 1rem;
  transition: all 0.18s ease;
}
.filtro:hover { border-color: var(--lila-suave); color: var(--tinta); }
.filtro--activo {
  color: var(--blanco);
  background: var(--morado-acento);
  border-color: var(--morado-acento);
}

/* ---------- TARJETA DE OBRA ---------- */
.obra {
  display: grid;
  grid-template-columns: 300px 1fr;
  background: var(--blanco);
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

/* Alterna el lado de la foto, como en el diseño */
.obra:nth-child(even) { grid-template-columns: 1fr 300px; }
.obra:nth-child(even) .obra__marco { order: 2; }

.obra__marco {
  position: relative;
  min-height: 280px;
}

.obra__foto {
  width: 100%;
  height: 100%;
  min-height: 280px;
  object-fit: cover;
  display: block;
}

.obra__alerta { position: absolute; top: 1rem; left: 1rem; }

.obra__cuerpo { padding: 2rem; }

.obra__encabezado {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.obra__autor {
  color: var(--gris);
  font-size: 0.92rem;
  margin: 0 0 1rem;
}

.obra__sinopsis { font-size: 0.96rem; margin: 0 0 1.25rem; }

.obra__meta {
  display: flex;
  gap: 0.6rem;
  font-family: var(--mono);
  font-size: 0.75rem;
  color: var(--gris);
  margin: 0 0 1.25rem;
}
.obra__punto { color: var(--borde-claro); }

/* ---------- HORARIOS ---------- */
.horarios {
  list-style: none;
  margin: 0 0 1.5rem;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.horario {
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  padding: 0.6rem 0.9rem;
  display: grid;
  gap: 0.15rem;
}

.horario__fecha {
  font-family: var(--mono);
  font-size: 0.75rem;
  color: var(--morado-acento);
}
.horario__sala {
  font-size: 0.72rem;
  color: var(--gris);
}

/* ---------- PIE DE LA OBRA ---------- */
.obra__pie {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding-top: 1.25rem;
  border-top: 1px solid var(--borde-claro);
}

.obra__desde {
  font-size: 0.8rem;
  color: var(--gris);
  margin: 0;
}
.precio { display: block; }

/* ---------- RESPONSIVE ---------- */
@media (max-width: 860px) {
  .obra,
  .obra:nth-child(even) { grid-template-columns: 1fr; }
  .obra:nth-child(even) .obra__foto { order: 0; }
  .obra__foto { min-height: 220px; }
  .obra__cuerpo { padding: 1.5rem; }
}
</style>