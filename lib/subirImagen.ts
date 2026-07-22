export async function subirImagen(file: File, bucket: 'noticias' | 'actividades'): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', bucket)
  const res = await fetch('/api/upload-imagen', {
    method: 'POST',
    headers: { 'x-admin-password': process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? '' },
    body: formData,
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.url as string
}
