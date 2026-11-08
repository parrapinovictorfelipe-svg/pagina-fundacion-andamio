import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const datos = ref({})
const listo = ref(false)
let promesa = null

export function cargarContenido() {
  if (!promesa) {
    promesa = supabase
      .from('contenido')
      .select('clave, valor')
      .then(({ data }) => {
        const mapa = {}
        for (const fila of data || []) mapa[fila.clave] = fila.valor
        datos.value = mapa
        listo.value = true
      })
      .catch(() => {
        listo.value = true
      })
  }
  return promesa
}

// Se llama después de guardar en el panel, para que el sitio lea lo nuevo
export function recargarContenido() {
  promesa = null
  return cargarContenido()
}

export function useContenido() {
  cargarContenido()
  const t = (clave) => datos.value[clave] || ''
  return { t, listo }
}
