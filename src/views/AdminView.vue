<script setup>
import { ref } from 'vue'

const secciones = [
  { id: 'dashboard',    nombre: 'Dashboard' },
  { id: 'funciones',    nombre: 'Funciones' },
  { id: 'inscripciones', nombre: 'Inscripciones' },
  { id: 'donaciones',   nombre: 'Donaciones' },
  { id: 'boleteria',    nombre: 'Boletería' },
]

const seccion = ref('dashboard')

const metricas = [
  { titulo: 'Donaciones (mes)',    valor: '$1.925.000', cambio: '+12% vs mes anterior', tono: 'sube' },
  { titulo: 'Boletas vendidas',    valor: '247',        cambio: '+8% vs mes anterior',  tono: 'sube' },
  { titulo: 'Inscripciones activas', valor: '41',       cambio: '-3% vs mes anterior',  tono: 'baja' },
  { titulo: 'Funciones programadas', valor: '11',       cambio: '= vs mes anterior',    tono: 'igual' },
]

const inscripciones = [
  { nombre: 'Laura Jiménez', programa: 'Escuela de Teatro',   fecha: '18 sep', estado: 'pendiente' },
  { nombre: 'Carlos Medina', programa: 'Taller Adultos',      fecha: '17 sep', estado: 'aprobado' },
  { nombre: 'Sofía Roa',     programa: 'Teatro Comunitario',  fecha: '16 sep', estado: 'aprobado' },
  { nombre: 'Miguel Torres', programa: 'Teatro Infantil',     fecha: '15 sep', estado: 'pendiente' },
  { nombre: 'Daniela Cruz',  programa: 'Escuela de Teatro',   fecha: '14 sep', estado: 'aprobado' },
]

const donaciones = [
  { donante: 'Anónimo',        tipo: 'única',   medio: 'Tarjeta', monto: '$100.000', fecha: '18 sep' },
  { donante: 'Patricia Gómez', tipo: 'mensual', medio: 'PSE',     monto: '$250.000', fecha: '17 sep' },
  { donante: 'Ricardo Mora',   tipo: 'única',   medio: 'Tarjeta', monto: '$50.000',  fecha: '17 sep' },
  { donante: 'Anónimo',        tipo: 'única',   medio: 'PSE',     monto: '$25.000',  fecha: '16 sep' },
  { donante: 'Elena Parra',    tipo: 'mensual', medio: 'Tarjeta', monto: '$75.000',  fecha: '15 sep' },
]

const funciones = [
  { obra: 'Esperando a Godot',           fecha: 'Sáb 12 Oct · 7:00 PM', sala: 'Teatro Principal', vendidas: 86,  aforo: 120, estado: 'En venta' },
  { obra: 'Esperando a Godot',           fecha: 'Dom 13 Oct · 5:00 PM', sala: 'Teatro Principal', vendidas: 31,  aforo: 120, estado: 'En venta' },
  { obra: 'La Casa de Bernarda Alba',    fecha: 'Vie 18 Oct · 8:00 PM', sala: 'Sala Negra',       vendidas: 42,  aforo: 60,  estado: 'En venta' },
  { obra: 'La Casa de Bernarda Alba',    fecha: 'Sáb 19 Oct · 6:00 PM', sala: 'Sala Negra',       vendidas: 53,  aforo: 60,  estado: 'Casi lleno' },
  { obra: 'El Círculo de Tiza Caucasiano', fecha: 'Dom 3 Nov · 5:00 PM', sala: 'Teatro Principal', vendidas: 25, aforo: 120, estado: 'En venta' },
]

const boletas = [
  { codigo: 'AND-4821', comprador: 'Victor Parra',   obra: 'Esperando a Godot',        tipo: 'General × 2',    monto: '$73.500', estado: 'aprobado' },
  { codigo: 'AND-4820', comprador: 'Marta Silva',    obra: 'La Casa de Bernarda Alba', tipo: 'Estudiante × 1', monto: '$21.500', estado: 'aprobado' },
  { codigo: 'AND-4819', comprador: 'Juan Betancur',  obra: 'Esperando a Godot',        tipo: 'VIP × 2',        monto: '$133.500', estado: 'pendiente' },
  { codigo: 'AND-4818', comprador: 'Lina Cardona',   obra: 'Yerma',                    tipo: 'General × 3',    monto: '$108.500', estado: 'aprobado' },
]

function porcentaje(vendidas, aforo) {
  return Math.round((vendidas / aforo) * 100)
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

      <button class="salir">Cerrar sesión →</button>
    </aside>

    <!-- ============ CONTENIDO ============ -->
    <main class="contenido">
      <!-- ---------- DASHBOARD ---------- -->
      <section v-if="seccion === 'dashboard'">
        <h1 class="titulo-l">Dashboard</h1>
        <p class="subtitulo">Resumen de actividad — septiembre 2026</p>

        <div class="metricas">
          <div v-for="m in metricas" :key="m.titulo" class="tarjeta metrica">
            <p class="metrica__titulo">{{ m.titulo }}</p>
            <p class="metrica__valor">{{ m.valor }}</p>
            <p class="metrica__cambio" :class="'metrica__cambio--' + m.tono">
              {{ m.cambio }}
            </p>
          </div>
        </div>

        <div class="dos-columnas">
          <div class="tarjeta">
            <p class="etiqueta">Últimas inscripciones</p>
            <ul class="lista">
              <li v-for="i in inscripciones.slice(0, 4)" :key="i.nombre" class="lista__fila">
                <div>
                  <p class="lista__principal">{{ i.nombre }}</p>
                  <p class="lista__secundario">{{ i.programa }}</p>
                </div>
                <span class="badge" :class="'badge--' + i.estado">{{ i.estado }}</span>
              </li>
            </ul>
          </div>

          <div class="tarjeta">
            <p class="etiqueta">Últimas donaciones</p>
            <ul class="lista">
              <li v-for="d in donaciones.slice(0, 4)" :key="d.donante + d.fecha" class="lista__fila">
                <div>
                  <p class="lista__principal">{{ d.donante }}</p>
                  <p class="lista__secundario">{{ d.tipo }} · {{ d.medio }}</p>
                </div>
                <span class="lista__monto">{{ d.monto }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ---------- FUNCIONES ---------- -->
      <section v-else-if="seccion === 'funciones'">
        <h1 class="titulo-l">Funciones</h1>
        <p class="subtitulo">Programación y aforo de la temporada</p>

        <div class="tarjeta tabla-caja">
          <table class="tabla">
            <thead>
              <tr>
                <th>Obra</th>
                <th>Fecha</th>
                <th>Sala</th>
                <th>Aforo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in funciones" :key="f.obra + f.fecha">
                <td class="tabla__fuerte">{{ f.obra }}</td>
                <td class="tabla__mono">{{ f.fecha }}</td>
                <td>{{ f.sala }}</td>
                <td>
                  <div class="aforo">
                    <span class="tabla__mono">{{ f.vendidas }}/{{ f.aforo }}</span>
                    <div class="progreso aforo__barra">
                      <div class="progreso__relleno" :style="{ width: porcentaje(f.vendidas, f.aforo) + '%' }"></div>
                    </div>
                  </div>
                </td>
                <td><span class="badge">{{ f.estado }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ---------- INSCRIPCIONES ---------- -->
      <section v-else-if="seccion === 'inscripciones'">
        <h1 class="titulo-l">Inscripciones</h1>
        <p class="subtitulo">Solicitudes recibidas por programa</p>

        <div class="tarjeta tabla-caja">
          <table class="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Programa</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in inscripciones" :key="i.nombre">
                <td class="tabla__fuerte">{{ i.nombre }}</td>
                <td>{{ i.programa }}</td>
                <td class="tabla__mono">{{ i.fecha }}</td>
                <td><span class="badge" :class="'badge--' + i.estado">{{ i.estado }}</span></td>
                <td class="tabla__acciones">
                  <button class="accion">Ver</button>
                  <button class="accion accion--principal">Aprobar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ---------- DONACIONES ---------- -->
      <section v-else-if="seccion === 'donaciones'">
        <h1 class="titulo-l">Donaciones</h1>
        <p class="subtitulo">Aportes recibidos este mes</p>

        <div class="tarjeta tabla-caja">
          <table class="tabla">
            <thead>
              <tr>
                <th>Donante</th>
                <th>Tipo</th>
                <th>Medio</th>
                <th>Fecha</th>
                <th class="tabla__derecha">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in donaciones" :key="d.donante + d.fecha">
                <td class="tabla__fuerte">{{ d.donante }}</td>
                <td>{{ d.tipo }}</td>
                <td>{{ d.medio }}</td>
                <td class="tabla__mono">{{ d.fecha }}</td>
                <td class="tabla__derecha tabla__monto">{{ d.monto }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ---------- BOLETERÍA ---------- -->
      <section v-else>
        <h1 class="titulo-l">Boletería</h1>
        <p class="subtitulo">Compras registradas en línea</p>

        <div class="tarjeta tabla-caja">
          <table class="tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Comprador</th>
                <th>Obra</th>
                <th>Boletas</th>
                <th>Estado</th>
                <th class="tabla__derecha">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in boletas" :key="b.codigo">
                <td class="tabla__mono tabla__fuerte">{{ b.codigo }}</td>
                <td>{{ b.comprador }}</td>
                <td>{{ b.obra }}</td>
                <td>{{ b.tipo }}</td>
                <td><span class="badge" :class="'badge--' + b.estado">{{ b.estado }}</span></td>
                <td class="tabla__derecha tabla__monto">{{ b.monto }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
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