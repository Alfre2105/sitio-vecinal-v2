export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Tag, ArrowLeft } from 'lucide-react'

const coloresCategorias: Record<string, string> = {
  Seguridad: 'bg-red-100 text-red-700',
  Comunidad: 'bg-blue-100 text-blue-700',
  Obras: 'bg-yellow-100 text-yellow-700',
  Servicios: 'bg-purple-100 text-purple-700',
  Institucional: 'bg-green-100 text-green-700',
}

export default async function NoticiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: noticia } = await supabase
    .from('noticias')
    .select('*')
    .eq('id', slug)
    .eq('publicada', true)
    .single()

  if (!noticia) notFound()

  const fechaFormateada = new Date(noticia.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <article className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-[#1E88E5] text-sm hover:underline mb-6">
        <ArrowLeft size={16} />
        Volver al inicio
      </Link>

      {noticia.imagen_url && (
        <div className="h-64 md:h-80 rounded-2xl overflow-hidden mb-6">
          <img src={noticia.imagen_url} alt={noticia.titulo} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${coloresCategorias[noticia.categoria] ?? 'bg-gray-100 text-gray-700'}`}>
          <Tag size={11} />
          {noticia.categoria}
        </span>
        <span className="flex items-center gap-1 text-[#9E9E9E] text-xs">
          <Calendar size={12} />
          <span className="capitalize">{fechaFormateada}</span>
        </span>
      </div>

      <h1 className="text-2xl md:text-3xl font-extrabold text-[#212121] mb-4 leading-snug">
        {noticia.titulo}
      </h1>

      <p className="text-[#616161] text-base leading-relaxed mb-6 font-medium">
        {noticia.resumen}
      </p>

      <div className="prose prose-lg max-w-none text-[#212121] leading-relaxed whitespace-pre-wrap">
        {noticia.contenido}
      </div>

      <div className="mt-10 pt-6 border-t border-[#E0E0E0]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#1E88E5] text-white font-semibold px-5 py-3 rounded-xl hover:bg-[#1565C0] transition-colors"
        >
          <ArrowLeft size={18} />
          Ver más noticias
        </Link>
      </div>
    </article>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await supabase
    .from('noticias')
    .select('titulo, resumen')
    .eq('id', slug)
    .single()

  return {
    title: data ? `${data.titulo} | Vecinal Mosconi` : 'Noticia | Vecinal Mosconi',
    description: data?.resumen ?? '',
  }
}
