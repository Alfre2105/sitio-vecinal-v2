export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { resend, EMAIL_REMITENTE } from '@/lib/resend'
import { calcularAviso, mensajeAviso, type CuotaAviso, type NotificacionPrevia } from '@/lib/notificaciones'
import { fetchTodasCuotas } from '@/lib/fetchCuotas'

type Socio = { id: string; nombre: string; apellido: string; email: string }

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: socios }, todasCuotas, { data: notificacionesPrevias }] = await Promise.all([
    supabase
      .from('socios')
      .select('id, nombre, apellido, email')
      .eq('activo', true)
      .eq('email_invalido', false)
      .not('email', 'is', null),
    fetchTodasCuotas(),
    supabase.from('notificaciones_enviadas').select('socio_id, tipo, mes, anio, created_at'),
  ])

  const cuotasPorSocio = new Map<string, CuotaAviso[]>()
  for (const c of todasCuotas) {
    if (!cuotasPorSocio.has(c.socio_id)) cuotasPorSocio.set(c.socio_id, [])
    cuotasPorSocio.get(c.socio_id)!.push({ mes: c.mes, anio: c.anio, monto: c.monto, pagada: c.pagada })
  }

  const previasPorSocio = new Map<string, NotificacionPrevia[]>()
  for (const n of notificacionesPrevias ?? []) {
    if (!previasPorSocio.has(n.socio_id)) previasPorSocio.set(n.socio_id, [])
    previasPorSocio.get(n.socio_id)!.push({ tipo: n.tipo, mes: n.mes, anio: n.anio, created_at: n.created_at })
  }

  let enviados = 0
  let fallidos = 0

  for (const socio of (socios as Socio[]) ?? []) {
    const cuotas = cuotasPorSocio.get(socio.id) ?? []
    const previas = previasPorSocio.get(socio.id) ?? []
    const aviso = calcularAviso(cuotas, previas)
    if (!aviso) continue

    const nombreCompleto = `${socio.nombre} ${socio.apellido}`
    const { asunto, textoPlano } = mensajeAviso(nombreCompleto, aviso)

    let resendEmailId: string | null = null
    let error: string | null = null
    try {
      const { data, error: errorEnvio } = await resend.emails.send({
        from: EMAIL_REMITENTE,
        to: socio.email,
        subject: asunto,
        text: textoPlano,
      })
      if (errorEnvio) error = errorEnvio.message
      else resendEmailId = data?.id ?? null
    } catch (e) {
      error = e instanceof Error ? e.message : 'Error desconocido al enviar el email.'
    }

    await supabase.from('notificaciones_enviadas').insert({
      socio_id: socio.id,
      tipo: aviso.tipo,
      canal: 'email',
      estado: error ? 'fallido' : 'enviado',
      mes: aviso.mes,
      anio: aviso.anio,
      detalle: error,
      resend_email_id: resendEmailId,
    })

    if (error) fallidos++
    else enviados++
  }

  return NextResponse.json({ ok: true, enviados, fallidos })
}
