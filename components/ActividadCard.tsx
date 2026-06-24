import { Clock, MapPin, User, DollarSign } from 'lucide-react'

interface Props {
  titulo: string
  descripcion: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  lugar: string
  es_gratuita: boolean
  precio: number | null
  responsable: string
  contacto_inscripcion: string
}

export default function ActividadCard({
  titulo,
  descripcion,
  fecha,
  hora_inicio,
  hora_fin,
  lugar,
  es_gratuita,
  precio,
  responsable,
  contacto_inscripcion,
}: Props) {
  const fechaFormateada = new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 border-l-4 border-[#43A047]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-[#212121] text-base">{titulo}</h3>
        <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${es_gratuita ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {es_gratuita ? 'Gratuito' : `$${precio}`}
        </span>
      </div>
      <p className="text-[#616161] text-sm mb-4">{descripcion}</p>
      <div className="space-y-1.5 text-sm text-[#616161]">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#1E88E5] shrink-0" />
          <span className="capitalize">{fechaFormateada} · {hora_inicio.slice(0,5)} – {hora_fin.slice(0,5)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[#1E88E5] shrink-0" />
          <span>{lugar}</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={14} className="text-[#1E88E5] shrink-0" />
          <span>{responsable}</span>
        </div>
        {!es_gratuita && (
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-[#1E88E5] shrink-0" />
            <span>Inscripción: {contacto_inscripcion}</span>
          </div>
        )}
      </div>
    </article>
  )
}
