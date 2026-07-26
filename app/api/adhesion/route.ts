import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const numero_socio = `S-${String(Date.now()).slice(-6)}`

  const { error } = await supabase.from('socios').insert({
    nombre: body.nombre,
    apellido: body.apellido,
    dni: body.dni,
    numero_socio,
    email: body.email || null,
    telefono: body.telefono,
    direccion: body.domicilio,
    fecha_nacimiento: body.fecha_nacimiento || null,
    dni_foto_url: body.dni_foto_url,
    comprobante_domicilio_url: body.comprobante_domicilio_url || null,
    fecha_ingreso: new Date().toISOString().split('T')[0],
    categoria: 'adherente',
    activo: false,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya existe un socio con ese DNI.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al procesar la solicitud.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
