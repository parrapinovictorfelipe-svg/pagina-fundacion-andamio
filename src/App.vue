<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import logoLocal from '@/assets/logo-andamio.jpg'
import { useContenido } from '@/lib/contenido'

const { t, listo } = useContenido()

// Si no hay logo en el panel, se usa el original
const logo = computed(() => t('nav.logo') || logoLocal)

const enlaces = computed(() => [
  { ruta: '/', texto: t('nav.inicio') },
  { ruta: '/funciones', texto: t('nav.funciones') },
  { ruta: '/boleteria', texto: t('nav.boleteria') },
  { ruta: '/inscripcion', texto: t('nav.inscripcion') },
  { ruta: '/donaciones', texto: t('nav.donaciones') },
])

// Las redes sin dirección no se muestran
const redes = computed(() =>
  [
    { url: t('pie.instagram'), sigla: 'IG', nombre: 'Instagram' },
    { url: t('pie.facebook'), sigla: 'FB', nombre: 'Facebook' },
    { url: t('pie.youtube'), sigla: 'YT', nombre: 'YouTube' },
    { url: t('pie.twitter'), sigla: 'TW', nombre: 'X / Twitter' },
  ].filter((r) => r.url)
)

const contacto = computed(() =>
  [t('pie.direccion'), t('pie.telefono'), t('pie.correo')].filter(Boolean)
)
</script>

<template>
  <header class="barra">
    <div class="barra__interior">
      <RouterLink to="/" class="marca">
        <img :src="logo" :alt="t('nav.nombre')" class="marca__logo" />
        <span class="marca__nombre">{{ t('nav.nombre') }}</span>
      </RouterLink>

      <nav v-if="listo" class="nav">
        <RouterLink v-for="e in enlaces" :key="e.ruta" :to="e.ruta">{{ e.texto }}</RouterLink>
      </nav>
    </div>
  </header>

  <main>
    <RouterView />
  </main>

  <footer v-if="listo" class="pie">
    <div class="contenedor pie__grid">
      <div>
        <div class="marca marca--pie">
          <img :src="logo" :alt="t('nav.nombre')" class="marca__logo" />
          <span class="marca__nombre">{{ t('nav.nombre') }}</span>
        </div>
        <p v-if="t('pie.descripcion')" class="pie__texto">{{ t('pie.descripcion') }}</p>
        <p v-if="t('pie.nit') || t('pie.entidad')" class="pie__nit">
          {{ t('pie.nit') }}<br v-if="t('pie.nit') && t('pie.entidad')" />{{ t('pie.entidad') }}
        </p>
      </div>

      <div>
        <p class="etiqueta">{{ t('pie.nav.titulo') }}</p>
        <ul class="pie__lista">
          <li v-for="e in enlaces.slice(1)" :key="e.ruta">
            <RouterLink :to="e.ruta">{{ e.texto }}</RouterLink>
          </li>
        </ul>
      </div>

      <div>
        <p class="etiqueta">{{ t('pie.contacto.titulo') }}</p>
        <ul class="pie__lista">
          <li v-for="c in contacto" :key="c">{{ c }}</li>
        </ul>
        <div v-if="redes.length" class="pie__redes">
          <a
            v-for="r in redes"
            :key="r.sigla"
            :href="r.url"
            :aria-label="r.nombre"
            target="_blank"
            rel="noopener"
          >{{ r.sigla }}</a>
        </div>
      </div>
    </div>

    <div class="contenedor pie__legal">
      <span>{{ t('pie.copyright') }}</span>
    </div>
  </footer>
</template>

<style scoped>
/* ---------- BARRA DE NAVEGACIÓN ---------- */
.barra {
  position: sticky;
  top: 0;
  z-index: 50;
  /* Fondo transparente con desenfoque */
  background: rgba(50, 6, 89, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--borde-oscuro);
}

.barra__interior {
  max-width: var(--ancho-max);
  margin-inline: auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.marca { display: flex; align-items: center; gap: 0.75rem; }

.marca__logo {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.marca__nombre {
  font-family: var(--serif);
  font-size: 1.15rem;
  color: var(--blanco);
}

.nav { display: flex; align-items: center; gap: 1.9rem; }

.nav a {
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.78);
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: color 0.18s ease;
}
.nav a:hover { color: var(--blanco); }

/* Vue Router marca la ruta activa con esta clase */
.nav a.router-link-exact-active {
  color: var(--blanco);
  font-weight: 600;
  border-bottom-color: var(--lila);
}

/* "Admin" va en una cápsula, separado del resto */
.nav__admin {
  padding: 0.45rem 1.1rem !important;
  border: 1px solid rgba(255, 255, 255, 0.35) !important;
  border-radius: var(--radio);
  font-family: var(--mono);
  font-size: 0.78rem !important;
}
.nav__admin.router-link-exact-active { border-color: var(--lila) !important; }

/* ---------- FOOTER ---------- */
.pie {
  background: var(--noche);
  color: var(--blanco);
  padding-top: 4.5rem;
  border-top: 1px solid var(--borde-oscuro);
}

.pie__grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr;
  gap: 3rem;
  padding-bottom: 3.5rem;
}

.marca--pie { margin-bottom: 1.25rem; }

.pie__texto {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.92rem;
  max-width: 38ch;
  margin: 0 0 1.5rem;
}

.pie__nit {
  font-family: var(--mono);
  font-size: 0.75rem;
  color: var(--lila-suave);
  margin: 0;
}

.pie__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.7rem;
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.72);
}
.pie__lista a:hover { color: var(--lila); }

.pie__redes { display: flex; gap: 0.6rem; margin-top: 1.5rem; }
.pie__redes a {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  font-family: var(--mono);
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--borde-oscuro);
  border-radius: var(--radio);
}
.pie__redes a:hover { border-color: var(--lila); color: var(--lila); }

.pie__legal {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 1.5rem;
  border-top: 1px solid var(--borde-oscuro);
  font-family: var(--mono);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
}
.pie__legal a:hover { color: var(--lila); }

/* ---------- RESPONSIVE ---------- */
@media (max-width: 900px) {
  .barra__interior { flex-direction: column; align-items: flex-start; }
  .nav { flex-wrap: wrap; gap: 1.1rem; }
  .pie__grid { grid-template-columns: 1fr; gap: 2.5rem; }
  .pie__legal { flex-direction: column; }
}
</style>