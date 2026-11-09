<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import AdminDashboard from '@/components/AdminDashboard.vue'
import AdminObras from '@/components/AdminObras.vue'
import AdminBoleteria from '@/components/AdminBoleteria.vue'
import AdminSitio from '@/components/AdminSitio.vue'
import AdminInscripciones from '@/components/AdminInscripciones.vue'

const secciones = [
  { id: 'dashboard',     nombre: 'Dashboard' },
  { id: 'obras',         nombre: 'Obras' },
  { id: 'boleteria',     nombre: 'Boletería' },
  { id: 'inscripciones', nombre: 'Inscripciones' },
  { id: 'donaciones',    nombre: 'Donaciones' },
  { id: 'sitio',         nombre: 'Sitio web' },
]

const seccion = ref('dashboard')
const router = useRouter()

async function cerrarSesion() {
  await supabase.auth.signOut()
  router.push('/admin/login')
}
</script>

<template>
  <div class="panel">
    <!-- ============ BARRA LATERAL ============ -->
    <aside class="lateral">
      <div class="lateral__marca">
        <p class="etiqueta lateral__etiqueta">Panel admin</p>
        <p class="lateral__nombre">Andamio CMS</p>
      </div>

      <nav class="menu">
        <button
          v-for="s in secciones"
          :key="s.id"
          class="menu__item"
          :class="{ 'menu__item--activo': seccion === s.id }"
          @click="seccion = s.id"
        >
          {{ s.nombre }}
        </button>
      </nav>

      <button class="salir" @click="cerrarSesion">Cerrar sesión →</button>
    </aside>

    <!-- ============ CONTENIDO ============ -->
    <main class="contenido">
      <AdminDashboard v-if="seccion === 'dashboard'" @ir="seccion = $event" />
      <AdminObras v-else-if="seccion === 'obras'" />
      <AdminBoleteria v-else-if="seccion === 'boleteria'" />

      <AdminInscripciones v-else-if="seccion === 'inscripciones'" />

      <section v-else-if="seccion === 'donaciones'">
        <h1 class="titulo-l">Donaciones</h1>
        <p class="subtitulo">Aportes recibidos</p>
        <p style="color: var(--gris)">
          Esta sección se conecta en el siguiente paso, junto con la página Donaciones.
        </p>
      </section>

      <AdminSitio v-else />
    </main>
  </div>
</template>

<style scoped>
.panel {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 80vh;
  background: var(--claro);
}

/* ---------- BARRA LATERAL ---------- */
.lateral {
  background: var(--blanco);
  border-right: 1px solid var(--borde-claro);
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
}

.lateral__marca { padding-inline: 1.5rem; margin-bottom: 2rem; }
.lateral__etiqueta { margin-bottom: 0.25rem; }
.lateral__nombre {
  font-family: var(--serif);
  font-size: 1.1rem;
  margin: 0;
}

.menu { display: grid; }

.menu__item {
  text-align: left;
  background: none;
  border: none;
  border-left: 3px solid transparent;
  padding: 0.75rem 1.5rem;
  font-size: 0.92rem;
  color: var(--gris);
  transition: all 0.18s ease;
}
.menu__item:hover { color: var(--tinta); }

.menu__item--activo {
  background: var(--lila-fondo);
  border-left-color: var(--morado-acento);
  color: var(--morado-acento);
  font-weight: 600;
}

.salir {
  margin-top: auto;
  text-align: left;
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.85rem;
  color: var(--gris);
}
.salir:hover { color: var(--morado-acento); }

/* ---------- CONTENIDO ---------- */
.contenido { padding: 2.5rem; }

.subtitulo {
  color: var(--gris);
  font-size: 0.95rem;
  margin: 0.5rem 0 2.5rem;
}

/* ---------- MÉTRICAS ---------- */
.metricas {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.metrica { padding: 1.5rem; }

.metrica__titulo {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: var(--gris);
  margin: 0 0 0.75rem;
}

.metrica__valor {
  font-family: var(--serif);
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--morado-acento);
  margin: 0 0 0.5rem;
}

.metrica__cambio {
  font-family: var(--mono);
  font-size: 0.72rem;
  margin: 0;
}
.metrica__cambio--sube  { color: var(--verde); }
.metrica__cambio--baja  { color: #b34242; }
.metrica__cambio--igual { color: var(--gris); }

/* ---------- LISTAS ---------- */
.dos-columnas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.lista { list-style: none; margin: 0; padding: 0; }

.lista__fila {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.85rem;
  border-bottom: 1px solid var(--borde-claro);
}
.lista__fila:last-child { border-bottom: none; }

.lista__principal  { font-weight: 600; font-size: 0.92rem; margin: 0; }
.lista__secundario { font-size: 0.8rem; color: var(--gris); margin: 0; }
.lista__monto {
  font-family: var(--mono);
  font-size: 0.88rem;
  color: var(--morado-acento);
}

/* ---------- TABLAS ---------- */
.tabla-caja { padding: 0; overflow-x: auto; }

.tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

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
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--borde-claro);
  vertical-align: middle;
}
.tabla tbody tr:last-child td { border-bottom: none; }
.tabla tbody tr:hover { background: var(--claro); }

.tabla__fuerte  { font-weight: 600; }
.tabla__mono    { font-family: var(--mono); font-size: 0.82rem; }
.tabla__derecha { text-align: right; }
.tabla__monto   { font-family: var(--mono); color: var(--morado-acento); }

.aforo { display: grid; gap: 0.35rem; min-width: 110px; }
.aforo__barra { width: 100%; }

.tabla__acciones { display: flex; gap: 0.5rem; justify-content: flex-end; }

.accion {
  background: transparent;
  border: 1px solid var(--borde-claro);
  border-radius: var(--radio);
  padding: 0.35rem 0.85rem;
  font-size: 0.8rem;
  color: var(--gris);
  transition: all 0.18s ease;
}
.accion:hover { border-color: var(--morado-acento); color: var(--morado-acento); }

.accion--principal {
  background: var(--morado-acento);
  border-color: var(--morado-acento);
  color: var(--blanco);
}
.accion--principal:hover { background: var(--morado-vivo); color: var(--blanco); }

/* ---------- RESPONSIVE ---------- */
@media (max-width: 1000px) {
  .metricas { grid-template-columns: repeat(2, 1fr); }
  .dos-columnas { grid-template-columns: 1fr; }
}

@media (max-width: 760px) {
  .panel { grid-template-columns: 1fr; }
  .lateral {
    border-right: none;
    border-bottom: 1px solid var(--borde-claro);
    padding-bottom: 1rem;
  }
  .menu { display: flex; overflow-x: auto; }
  .menu__item {
    border-left: none;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
  }
  .menu__item--activo { border-left: none; border-bottom-color: var(--morado-acento); }
  .salir { margin-top: 1rem; }
  .contenido { padding: 1.5rem; }
  .metricas { grid-template-columns: 1fr; }
}
</style>