import { cuotaVencida, nombreMes } from './cuotas'

// Vencimiento fijo el dia 10 de cada mes. Estos dias son solo para decidir
// CUANDO mandar los mails -- el resto del sitio (badges "al dia"/"con deuda"
// en /admin, /socios, /reportes) sigue usando cuotaVencida tal cual, sin
// esperar al dia 10.
const DIA_AVISO_PROXIMO = 5
const DIA_AVISO_VENCIDA = 11
const DIA_AVISO_RECORDATORIO = 15

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
// se le mandaron a ESE socio (filtradas antes de llamar esta funcion). Los
// tres tipos de aviso estan atados a un dia fijo del mes, asi el socio (y
// Alfredo) pueden anticipar exactamente cuando van a salir los mails.
export function calcularAviso(cuotas: CuotaAviso[], previas: NotificacionPrevia[], hoy = new Date()): Aviso | null {
  const anioActual = hoy.getFullYear()
  const mesActual = hoy.getMonth() + 1
  const diaActual = hoy.getDate()

  const yaEnviado = (tipo: TipoAviso, mes: number | null, anio: number | null) =>
    previas.some(p => p.tipo === tipo && p.mes === mes && p.anio === anio)

  const vencidas = cuotas.filter(c => !c.pagada && cuotaVencida(c.mes, c.anio))
  const cuotaMesActual = cuotas.find(c => c.mes === mesActual && c.anio === anioActual)

  // Dia 11: la cuota del mes en curso paso su vencimiento (dia 10) sin pagarse.
  // Se manda una sola vez por mes, le toque a quien le toque (este al dia con
  // el resto o arrastre deuda vieja).
  if (
    diaActual === DIA_AVISO_VENCIDA &&
    cuotaMesActual && !cuotaMesActual.pagada &&
    !yaEnviado('vencida', mesActual, anioActual)
  ) {
    return { tipo: 'vencida', mes: mesActual, anio: anioActual, monto: Number(cuotaMesActual.monto), cantidadPendientes: vencidas.length }
  }

  // Dia 5: aviso preventivo, solo para quien esta al dia salvo por la cuota
  // del mes en curso (vencidas.length === 1 porque cuotaVencida ya cuenta la
  // cuota del mes en curso como vencida desde el dia 1). Si ademas arrastra
  // deuda vieja, no le corresponde este aviso "suave" sino el de deuda.
  if (
    diaActual === DIA_AVISO_PROXIMO &&
    cuotaMesActual && !cuotaMesActual.pagada &&
    vencidas.length === 1 &&
    !yaEnviado('proximo_vencimiento', mesActual, anioActual)
  ) {
    return { tipo: 'proximo_vencimiento', mes: mesActual, anio: anioActual, monto: Number(cuotaMesActual.monto), cantidadPendientes: vencidas.length }
  }

  // Dia 15: recordatorio de deuda acumulada (1 o mas periodos), se repite
  // todos los meses en esa fecha mientras la deuda siga sin saldarse.
  if (
    diaActual === DIA_AVISO_RECORDATORIO &&
    vencidas.length > 0 &&
    !yaEnviado('recordatorio_deuda', mesActual, anioActual)
  ) {
    const deudaTotal = vencidas.reduce((acc, c) => acc + Number(c.monto), 0)
    return { tipo: 'recordatorio_deuda', mes: mesActual, anio: anioActual, monto: deudaTotal, cantidadPendientes: vencidas.length }
  }

  return null
}

const WHATSAPP_VECINAL = '297 502-9223'
const LINK_SOCIOS = 'https://vecinalmosconi.org.ar/socios'
const FIRMA = 'Asociación Vecinal General Mosconi'

export function mensajeAviso(nombreSocio: string, aviso: Aviso): { asunto: string; textoPlano: string } {
  if (aviso.tipo === 'proximo_vencimiento') {
    const periodo = `${nombreMes(aviso.mes!)} ${aviso.anio}`
    return {
      asunto: 'Recordatorio: tu cuota de este mes vence pronto',
      textoPlano: `¡Hola ${nombreSocio}!

Te escribimos desde la ${FIRMA}, esperamos te encuentres muy bien. Te recordamos que tu cuota de ${periodo} vence el día 10, así que todavía estás a tiempo de ponerte al día sin inconvenientes.

Podés abonarla fácil y rápido con una transferencia al alias VECINAL.MOSCONI y enviarnos el comprobante por WhatsApp al ${WHATSAPP_VECINAL}.

Si ya la abonaste, ¡muchas gracias! Te pedimos por favor que nos envíes el comprobante al mismo número para actualizar tu estado de cuenta.

Además, desde acá: ${LINK_SOCIOS} podés consultar tu estado de cuenta, ver tus pagos en cualquier momento y descargar el carnet digital de socio.

¡Gracias por ser parte de nuestra comunidad!

Que tengas un lindo día.

${FIRMA}`,
    }
  }

  const periodoTexto = aviso.cantidadPendientes === 1 ? 'un período adeudado' : `${aviso.cantidadPendientes} períodos adeudados`

  // 'recordatorio_deuda' (dia 15): mismo destinatario que 'vencida' (dia 11)
  // 4 dias antes, asi que el enfoque cambia -- reconoce que es un segundo
  // contacto y ofrece coordinar en vez de repetir la misma instruccion.
  if (aviso.tipo === 'recordatorio_deuda') {
    return {
      asunto: 'Recordatorio: tenés cuotas pendientes con la Vecinal',
      textoPlano: `¡Hola ${nombreSocio}!

Te escribimos nuevamente desde la ${FIRMA}. Vimos que todavía no pudiste regularizar tu situación: al día de hoy contás con ${periodoTexto}.

Sabemos que a veces se acumula sin querer, así que si necesitás coordinar una forma de ponerte al día, escribinos por WhatsApp al ${WHATSAPP_VECINAL} — con gusto te ayudamos a resolverlo.

Si ya hiciste la transferencia y todavía no se refleja, enviános el comprobante al mismo número y lo actualizamos enseguida.

Recordá que desde acá: ${LINK_SOCIOS} podés consultar tu estado de cuenta y ver tus pagos en cualquier momento.

¡Gracias por tu buena disposición!

Que tengas un lindo día.

${FIRMA}`,
    }
  }

  return {
    asunto: 'Cuota Social',
    textoPlano: `¡Hola ${nombreSocio}!

Te escribimos desde la ${FIRMA}, esperamos te encuentres muy bien. Queremos contarte que, según nuestros registros, detectamos un saldo pendiente correspondiente a ${periodoTexto}.

Para ponerte al día, podés hacerlo fácil y rápido haciendo una transferencia al alias VECINAL.MOSCONI y enviarnos el comprobante por WhatsApp al ${WHATSAPP_VECINAL}.

Si ya abonaste, ¡muchas gracias! Te pedimos por favor que nos envíes el comprobante al mismo número para actualizar tu estado de cuenta.

Además, desde acá: ${LINK_SOCIOS} podés consultar tu estado de cuenta, ver tus pagos en cualquier momento y descargar el carnet digital de socio.

¡Gracias por ser parte de nuestra comunidad!

Que tengas un lindo día.

${FIRMA}`,
  }
}
