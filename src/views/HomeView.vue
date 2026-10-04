<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import galeria from '@/assets/galeria.js'
import Carousel from '@/components/Carousel.vue'

const fotoHero = galeria[15].src   
const fotoSobre = galeria[4].src   

// Estados para el consumo de la API
const proximas = ref([])
const cargando = ref(true)
const error = ref(false)

const cargarFunciones = async () => {
  try {
    const respuesta = await fetch('https://6ac199f9309c92da039c6a30.mockapi.io/funciones')
    if (!respuesta.ok) throw new Error('Error en la petición')
    
    const datos = await respuesta.json()
    proximas.value = datos
  } catch (err) {
    error.value = true
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarFunciones()
})

const cifras = [
  { valor: '16+',   etiqueta: 'Años de trayectoria' },
  { valor: '4.200', etiqueta: 'Beneficiarios directos' },
  { valor: '87',    etiqueta: 'Producciones realizadas' },
  { valor: '12',    etiqueta: 'Municipios alcanzados' },
]

const programas = [
  {
    num: '01',
    tipo: 'Formación',
    titulo: 'Escuela de Teatro',
    texto: 'Formación integral en artes escénicas para niños, jóvenes y adultos. Actuación, dirección y dramaturgia.',
  },
  {
    num: '02',
    tipo: 'Comunidad',
    titulo: 'Teatro Comunitario',
    texto: 'Proyectos teatrales en comunidades vulnerables que usan la escena como herramienta de resolución de conflictos.',
  },
  {
    num: '03',
    tipo: 'Festival',
    titulo: 'Festival Andamio',
    texto: 'Festival anual que reúne compañías nacionales e internacionales en un intercambio artístico abierto.',
  },
]

const montos = [
  { valor: '$10.000',  impacto: 'Una sesión de ensayo' },
  { valor: '$50.000',  impacto: 'Un taller comunitario' },
  { valor: '$100.000', impacto: 'Beca para un talento' },
  { valor: '$250.000', impacto: 'Una producción completa' },
]
</script>

<template>
  <!-- ============ HERO PARTIDO 50/50 ============ -->
  <section class="hero">
    <div class="hero__texto">
      <p class="etiqueta">Bogotá · Desde 2008</p>

      <h1 class="titulo-xl hero__titulo">
        El arte<br />
        <span class="hero__acento">trans</span>forma
      </h1>

      <p class="parrafo parrafo--oscuro hero__bajada">
        Fundación cultural dedicada al teatro, las artes escénicas y la
        transformación de comunidades en Colombia.
      </p>

      <div class="hero__acciones">
        <RouterLink to="/funciones" class="btn btn--solido">Ver funciones</RouterLink>
        <RouterLink to="/donaciones" class="btn btn--contorno">Apoyar</RouterLink>
      </div>

      <!-- Renderizado condicional de la API -->
      <div v-if="cargando" class="estado-api">
        <p>⏳ Cargando próximas funciones...</p>
      </div>
      
      <div v-else-if="error" class="estado-api estado-api--error">
        <p>❌ Error al cargar las funciones. Intenta de nuevo más tarde.</p>
      </div>

      <ul v-else-if="proximas.length > 0" class="proximas">
        <li v-for="f in proximas" :key="f.id" class="proximas__item">
          <span class="proximas__fecha">{{ f.fecha }}</span>
          <span class="proximas__obra">{{ f.obra }}</span>
          <span class="proximas__sala">{{ f.sala }}</span>
        </li>
      </ul>

      <div v-else class="estado-api">
        <p>No hay funciones programadas en este momento.</p>
      </div>
    </div>

    <div class="hero__marco">
      <img :src="fotoHero" alt="Elenco de Fundación Andamio en escena" class="hero__foto" />
      <span class="hero__credito">Fundación Andamio</span>
    </div>
  </section>

  <!-- ============ CIFRAS ============ -->
  <section class="seccion--clara cifras">
    <div class="contenedor cifras__grid">
      <div v-for="c in cifras" :key="c.etiqueta" class="cifras__item">
        <p class="cifras__valor">{{ c.valor }}</p>
        <p class="cifras__etiqueta">{{ c.etiqueta }}</p>
      </div>
    </div>
  </section>

  <!-- ============ SOBRE LA FUNDACIÓN ============ -->
  <section class="seccion seccion--clara">
    <div class="contenedor sobre">
      <img :src="fotoSobre" alt="Taller comunitario de Fundación Andamio" class="sobre__foto" />

      <div>
        <h2 class="titulo-l sobre__titulo">
          Un andamio<br />para la <span class="sobre__acento">cultura</span>
        </h2>
        <p class="parrafo">
          Nacemos de la convicción de que el teatro es un andamio: una estructura
          temporal y firme sobre la que se construye algo permanente. Trabajamos
          con jóvenes, comunidades vulnerables y artistas emergentes para que el
          arte escénico sea una herramienta de transformación real.
        </p>
        <RouterLink to="/inscripcion" class="enlace-acento">
          Únete a un programa →
        </RouterLink>
      </div>
    </div>
  </section>

  <!-- ============ PROGRAMAS ============ -->
  <section class="seccion seccion--noche">
    <div class="contenedor">
      <div class="programas__cabecera">
        <div>
          <p class="etiqueta">Lo que hacemos</p>
          <h2 class="titulo-l">Programas</h2>
        </div>
        <RouterLink to="/inscripcion" class="enlace-acento">
          Ver inscripciones →
        </RouterLink>
      </div>

      <div class="programas__grid">
        <article v-for="p in programas" :key="p.num" class="programa">
          <p class="programa__num">{{ p.num }}</p>
          <span class="programa__tipo">{{ p.tipo }}</span>
          <h3 class="titulo-m programa__titulo">{{ p.titulo }}</h3>
          <p class="parrafo parrafo--oscuro programa__texto">{{ p.texto }}</p>
        </article>
      </div>
    </div>
  </section>

  <!-- ============ GALERÍA ============ -->
  <section class="seccion seccion--clara">
    <div class="contenedor">
      <p class="etiqueta">Momentos en escena</p>
      <h2 class="titulo-l galeria__titulo">Galería</h2>
      <Carousel :fotos="galeria" />
    </div>
  </section>

  <!-- ============ DONACIÓN ============ -->
  <section class="seccion donacion">
    <div class="contenedor donacion__grid">
      <div>
        <p class="etiqueta">Apoya el arte</p>
        <h2 class="titulo-l">Tu donación<br />mueve el telón</h2>
        <p class="parrafo parrafo--oscuro donacion__texto">
          Cada peso llega directamente a los programas y artistas de
          Fundación Andamio.
        </p>
        <RouterLink to="/donaciones" class="btn btn--solido">Donar ahora</RouterLink>
      </div>

      <div class="montos">
        <div v-for="m in montos" :key="m.valor" class="monto">
          <p class="monto__valor">{{ m.valor }}</p>
          <p class="monto__impacto">{{ m.impacto }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Estados de carga API */
.estado-api {
  margin-top: 3.5rem;
  padding: 1rem;
  border-left: 3px solid var(--lila);
  background: rgba(255,255,255,0.05);
  font-family: var(--mono);
  font-size: 0.9rem;
  color: var(--lila-suave);
}

.estado-api--error {
  border-left-color: #ff6b6b;
  color: #ffb3b3;
}

/* ============ HERO ============ */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--morado-hero);
  color: var(--blanco);
  min-height: 82vh;
}

.hero__texto {
  padding: clamp(3rem, 6vw, 6rem) clamp(2rem, 5vw, 5rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero__titulo { margin-bottom: 1.75rem; }
.hero__acento { color: var(--lila); }

.hero__bajada { max-width: 34ch; margin: 0 0 2.5rem; }

.hero__acciones { display: flex; gap: 1rem; flex-wrap: wrap; }

.proximas {
  list-style: none;
  margin: 3.5rem 0 0;
  padding-top: 1.75rem;
  border-top: 1px solid var(--borde-oscuro);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.proximas__item { display: grid; gap: 0.3rem; }

.proximas__fecha {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: var(--lila-suave);
}

.proximas__obra {
  font-family: var(--serif);
  font-size: 1.05rem;
  color: var(--blanco);
}

.proximas__sala {
  font-family: var(--mono);
  font-size: 0.7rem;
  color: var(--morado-acento);
  filter: brightness(1.7);
}

.hero__marco { position: relative; }

.hero__foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero__credito {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--blanco);
  background: rgba(15, 8, 26, 0.75);
  border: 1px solid var(--borde-oscuro);
  padding: 0.5rem 1rem;
}

/* ============ CIFRAS ============ */
.cifras { padding-block: clamp(2.5rem, 5vw, 4rem); }

.cifras__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.cifras__item {
  text-align: center;
  padding-inline: 1rem;
  border-left: 1px solid var(--borde-claro);
}
.cifras__item:first-child { border-left: none; }

.cifras__valor {
  font-family: var(--serif);
  font-size: clamp(2.4rem, 4vw, 3.2rem);
  font-weight: 700;
  color: var(--morado-acento);
  margin: 0 0 0.3rem;
}

.cifras__etiqueta {
  font-size: 0.85rem;
  color: var(--gris);
  margin: 0;
}

/* ============ SOBRE ============ */
.sobre {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: clamp(2rem, 5vw, 4.5rem);
  align-items: center;
}

.sobre__foto {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: var(--radio);
  display: block;
}

.sobre__titulo { margin-bottom: 1.5rem; }
.sobre__acento { color: var(--morado-acento); }

.sobre .parrafo { margin-bottom: 1.75rem; }

/* ============ GALERÍA ============ */
.galeria__titulo { margin-bottom: 2rem; }

/* ============ PROGRAMAS ============ */
.programas__cabecera {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
  margin-bottom: 4rem;
}

.programas__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.programa {
  padding-inline: clamp(1rem, 3vw, 2.5rem);
  border-left: 1px solid var(--borde-oscuro);
}
.programa:first-child { border-left: none; padding-left: 0; }

.programa__num {
  font-family: var(--mono);
  font-size: 1.9rem;
  color: var(--lila);
  opacity: 0.55;
  margin: 0 0 1.5rem;
}

.programa__tipo {
  display: inline-block;
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  color: var(--lila);
  border: 1px solid var(--borde-oscuro);
  border-radius: var(--radio);
  padding: 0.25rem 0.7rem;
  margin-bottom: 1rem;
}

.programa__titulo { margin-bottom: 0.9rem; }
.programa__texto { font-size: 0.93rem; }

/* ============ DONACIÓN ============ */
.donacion {
  background:
    linear-gradient(105deg, rgba(50, 6, 89, 0.95) 0%, rgba(50, 6, 89, 0.55) 100%),
    linear-gradient(160deg, #6b21a8 0%, #2a0a4d 100%);
  color: var(--blanco);
}

.donacion__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
}

.donacion__texto { max-width: 36ch; margin: 1.5rem 0 2.25rem; }

.montos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.monto {
  background: rgba(15, 8, 26, 0.45);
  border: 1px solid var(--borde-oscuro);
  border-radius: var(--radio);
  padding: 1.5rem;
}

.monto__valor {
  font-family: var(--mono);
  font-size: 1.15rem;
  color: var(--lila);
  margin: 0 0 0.35rem;
}

.monto__impacto {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.72);
  margin: 0;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; }
  .hero__marco { min-height: 45vh; }
  .cifras__grid { grid-template-columns: repeat(2, 1fr); gap: 2rem 0; }
  .cifras__item:nth-child(3) { border-left: none; }
  .sobre,
  .donacion__grid { grid-template-columns: 1fr; }
  .programas__grid { grid-template-columns: 1fr; gap: 2.5rem; }
  .programa { border-left: none; padding-left: 0; padding-bottom: 2.5rem; border-bottom: 1px solid var(--borde-oscuro); }
  .programa:last-child { border-bottom: none; }
  .programas__cabecera { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 560px) {
  .proximas { grid-template-columns: 1fr; }
  .montos { grid-template-columns: 1fr; }
}
</style>