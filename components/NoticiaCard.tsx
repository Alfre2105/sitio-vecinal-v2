import Link from 'next/link'
import { Calendar, Tag } from 'lucide-react'

const coloresCategorias: Record<string, string> = {
  Seguridad: 'bg-red-100 text-red-700',
  Comunidad: 'bg-blue-100 text-blue-700',
  Obras: 'bg-yellow-100 text-yellow-700',
  Servicios: 'bg-purple-100 text-purple-700',
  Institucional: 'bg-green-100 text-green-700',
}

interface Props {
  id: string
  titulo: string
  resumen: string
  imagen_url: string | null
  categoria: string
  fecha: string
}

export default function NoticiaCard({ id, titulo, resumen, imagen_url, categoria, fecha }: Props) {
  const fechaFormateada = new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Link href={`/noticias/${id}`} className="block">
      <article className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
        {imagen_url && (
          <div className="h-48 bg-gray-200 overflow-hidden">
            <img src={imagen_url} alt={titulo} className="w-full h-full object-cover" />
          </div>
        )}
        {!imagen_url && (
          <div className="h-48 bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center">
            <span className="text-white text-4xl font-bold opacity-30">GM</span>
          </div>
        )}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${coloresCategorias[categoria] ?? 'bg-gray-100 text-gray-700'}`}>
              <Tag size={11} />
              {categoria}
            </span>
          </div>
          <h3 className="font-bold text-[#212121] text-base leading-snug mb-2 flex-1">{titulo}</h3>
          <p className="text-[#616161] text-sm leading-relaxed line-clamp-3 mb-3">{resumen}</p>
          <div className="flex items-center gap-1 text-xs text-[#9E9E9E]">
            <Calendar size={12} />
            <span>{fechaFormateada}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
