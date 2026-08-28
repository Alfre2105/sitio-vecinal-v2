export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { resend, EMAIL_REMITENTE } from '@/lib/resend'

type EventoResend = { type: string; data: { email_id: string } }

export async function POST(request: Request) {
  const payload = await request.text()
  const headers = {
    'svix-id': request.headers.get('svix-id') ?? '',
    'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
    'svix-signature': request.headers.get('svix-signature') ?? '',
  }

  let evento: EventoResend
  try {
    const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET!)
    evento = wh.verify(payload, headers) as EventoResend
  } catch {
    return NextResponse.json({ error: 'Firma inválida.' }, { status: 401 })
  }

  if (evento.type !== 'email.bounced' && evento.type !== 'email.complained') {
    return NextResponse.json({ ok: true })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: notificacion } = await supabase
    .from('notificaciones_enviadas')
    .select('id, socio_id')
    .eq('resend_email_id', evento.data.email_id)
    .maybeSingle()

  if (!notificacion) return NextResponse.json({ ok: true })

  await supabase.from('notificaciones_enviadas').update({ estado: 'rebotado' }).eq('id', notificacion.id)

  const { data: socio } = await supabase
    .from('socios')
    .update({ email_invalido: true })
    .eq('id', notificacion.socio_id)
    .select('nombre, apellido, email')
    .single()

  if (socio) {
    await resend.emails.send({
      from: EMAIL_REMITENTE,
      to: process.env.ADMIN_ALERT_EMAIL ?? 'alfregomezcr@gmail.com',
      subject: 'Email de un socio rebotó — revisar dirección',
      text: `El email de ${socio.nombre} ${socio.apellido} (${socio.email}) rebotó al mandarle un aviso de cuotas. Conviene pedirle un email actualizado desde /admin/socios.`,
    })
  }

  return NextResponse.json({ ok: true })
}
