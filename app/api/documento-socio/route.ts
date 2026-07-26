import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const password = request.headers.get('x-admin-password')
  if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  if (!path) {
    return NextResponse.json({ error: 'Falta la ruta del documento.' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.storage
    .from('socios-documentos')
    .createSignedUrl(path, 300)

  if (error || !data) {
    return NextResponse.json({ error: 'No se pudo generar el link.' }, { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}
