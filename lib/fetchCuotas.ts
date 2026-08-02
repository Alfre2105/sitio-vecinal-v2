import { supabase } from './supabase'

type Cuota = {
  socio_id: string
  mes: number
  anio: number
  monto: number
  pagada: boolean
}

// Supabase/PostgREST corta las consultas en 1000 filas por defecto. La tabla
// cuotas ya supera eso, asi que cualquier fetch "de todos los socios" (sin
// filtrar por socio_id) tiene que paginar o se pierden filas en silencio.
export async function fetchTodasCuotas(filtros?: { anio?: number }): Promise<Cuota[]> {
  const PAGE_SIZE = 1000
  let desde = 0
  let resultado: Cuota[] = []

  while (true) {
    let query = supabase
      .from('cuotas')
      .select('socio_id, mes, anio, monto, pagada')
      .range(desde, desde + PAGE_SIZE - 1)
    if (filtros?.anio !== undefined) query = query.eq('anio', filtros.anio)

    const { data } = await query
    if (!data || data.length === 0) break
    resultado = resultado.concat(data as Cuota[])
    if (data.length < PAGE_SIZE) break
    desde += PAGE_SIZE
  }

  return resultado
}
