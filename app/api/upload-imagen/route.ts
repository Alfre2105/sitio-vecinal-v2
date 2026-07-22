import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const password = request.headers.get('x-admin-password')
  if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Archivo inválido.' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const extension = file.name.split('.').pop() || 'jpg'
  const nombreArchivo = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`

  const { error } = await supabase.storage
    .from('noticias')
    .upload(nombreArchivo, file, { contentType: file.type })

  if (error) {
    return NextResponse.json({ error: 'Error al subir la imagen.' }, { status: 500 })
  }

  const { data } = supabase.storage.from('noticias').getPublicUrl(nombreArchivo)

  return NextResponse.json({ url: data.publicUrl })
}
