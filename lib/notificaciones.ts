import { cuotaVencida, nombreMes } from './cuotas'

export const DIAS_ANTICIPACION = 5
export const DIAS_ENTRE_RECORDATORIOS = 30

export type TipoAviso = 'proximo_vencimiento' | 'vencida' | 'recordatorio_deuda'

export type CuotaAviso = { mes: number; anio: number; monto: number; pagada: boolean }

export type NotificacionPrevia = { tipo: TipoAviso; mes: number | null; anio: number | null; created_at: string }

export type Aviso = {
  tipo: TipoAviso
  mes: number | null
  anio: number | null
  monto: number
  cantidadPendientes: number
}

// Calcula, para un socio puntual, cual es el proximo aviso que le corresponde
// (o null si no le toca ninguno hoy). `previas` son las notificaciones que ya
// se le mandaron a ESE socio (filtradas antes de llamar esta funcion).
export function calcularAviso(cuotas: CuotaAviso[], previas: NotificacionPrevia[], hoy = new Date()): Aviso | null {
  const anioActual = hoy.getFullYear()
  const mesActual = hoy.getMonth() + 1

  const yaEnviado = (tipo: TipoAviso, mes: number | null, anio: number | null) =>
    previas.some(p => p.tipo === tipo && p.mes === mes && p.anio === anio)

  const vencidas = cuotas.filter(c => !c.pagada && cuotaVencida(c.mes, c.anio))

  // 1. Vencida: solo para la cuota del mes calendario ANTERIOR, no para toda
  // la deuda historica. Si un socio arrastra deuda de varios anios, notificar
  // "vencida" por cada mes viejo sin avisar mandaria un mail por dia al activar
  // esto por primera vez -- la deuda vieja ya la cubre el recordatorio_deuda
  // periodico del punto 3.
  const mesAnterior = mesActual === 1 ? 12 : mesActual - 1
  const anioMesAnterior = mesActual === 1 ? anioActual - 1 : anioActual
  const cuotaMesAnterior = cuotas.find(c => c.mes === mesAnterior && c.anio === anioMesAnterior)
  if (cuotaMesAnterior && !cuotaMesAnterior.pagada && !yaEnviado('vencida', mesAnterior, anioMesAnterior)) {
    return { tipo: 'vencida', mes: mesAnterior, anio: anioMesAnterior, monto: Number(cuotaMesAnterior.monto), cantidadPendientes: vencidas.length }
  }

  // 2. Proxima a vencer: la cuota del mes actual, sin pagar, a pocos dias del
  // cierre de ese mes (que es cuando la tratamos como "fecha limite").
  const cuotaMesActual = cuotas.find(c => c.mes === mesActual && c.anio === anioActual)
  if (cuotaMesActual && !cuotaMesActual.pagada) {
    const diasEnMes = new Date(anioActual, mesActual, 0).getDate()
    const diasRestantes = diasEnMes - hoy.getDate()
    if (diasRestantes >= 0 && diasRestantes <= DIAS_ANTICIPACION && !yaEnviado('proximo_vencimiento', mesActual, anioActual)) {
      return { tipo: 'proximo_vencimiento', mes: mesActual, anio: anioActual, monto: Number(cuotaMesActual.monto), cantidadPendientes: vencidas.length }
    }
  }

  // 3. Recordatorio de deuda acumulada, espaciado en el tiempo mientras la
  // deuda siga sin saldarse.
  if (vencidas.length > 0) {
    const ultimoRecordatorio = previas
      .filter(p => p.tipo === 'recordatorio_deuda')
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
    const diasDesdeUltimo = ultimoRecordatorio
      ? (hoy.getTime() - new Date(ultimoRecordatorio.created_at).getTime()) / 86_400_000
      : Infinity
    if (diasDesdeUltimo >= DIAS_ENTRE_RECORDATORIOS) {
      const deudaTotal = vencidas.reduce((acc, c) => acc + Number(c.monto), 0)
      return { tipo: 'recordatorio_deuda', mes: null, anio: null, monto: deudaTotal, cantidadPendientes: vencidas.length }
    }
  }

  return null
}

const DATOS_PAGO = 'Podés abonarla por transferencia al alias VECINAL.MOSCONI y enviar el comprobante por WhatsApp al 297 502-9223.'

export function mensajeAviso(nombreSocio: string, aviso: Aviso): { asunto: string; textoPlano: string } {
  if (aviso.tipo === 'proximo_vencimiento') {
    const periodo = `${nombreMes(aviso.mes!)} ${aviso.anio}`
    return {
      asunto: `Tu cuota de ${periodo} está por vencer`,
      textoPlano: `Hola ${nombreSocio}, te recordamos que tu cuota de ${periodo} vence a fin de mes. Monto: $${aviso.monto.toLocaleString('es-AR')}. ${DATOS_PAGO}`,
    }
  }
  if (aviso.tipo === 'vencida') {
    const periodo = `${nombreMes(aviso.mes!)} ${aviso.anio}`
    return {
      asunto: `Tu cuota de ${periodo} venció`,
      textoPlano: `Hola ${nombreSocio}, tu cuota de ${periodo} venció y sigue figurando como pendiente. Monto: $${aviso.monto.toLocaleString('es-AR')}. ${DATOS_PAGO}`,
    }
  }
  return {
    asunto: 'Tenés cuotas pendientes con la Vecinal',
    textoPlano: `Hola ${nombreSocio}, te recordamos que tenés ${aviso.cantidadPendientes} cuota(s) pendiente(s) por un total de $${aviso.monto.toLocaleString('es-AR')}. ${DATOS_PAGO}`,
  }
}
