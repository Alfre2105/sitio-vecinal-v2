// Una cuota "vence" durante su propio mes (la de agosto vence en agosto). Si
// el mes/anio de la cuota ya llegó o pasó y sigue sin pagar, es deuda real.
// Si es un mes futuro (ej. diciembre cargado por adelantado en agosto), todavia
// no vencio y no debe contarse como deuda ni mostrarse como "debe".
export function cuotaVencida(mes: number, anio: number): boolean {
  const hoy = new Date()
  const anioActual = hoy.getFullYear()
  const mesActual = hoy.getMonth() + 1
  return anio < anioActual || (anio === anioActual && mes <= mesActual)
}

const NOMBRES_MES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export function nombreMes(mes: number): string {
  return NOMBRES_MES[mes - 1] ?? String(mes)
}
