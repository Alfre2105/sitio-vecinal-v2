import { MapPin, Phone, Gift } from 'lucide-react'

interface Props {
  nombre: string
  rubro: string
  descripcion: string | null
  beneficio_socios: string | null
  telefono: string | null
  direccion: string | null
  imagen_url: string | null
}

export default function ComercioCard({ nombre, rubro, descripcion, beneficio_socios, telefono, direccion, imagen_url }: Props) {
  return (
    <article className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border-l-4 ${beneficio_socios ? 'border-[#43A047]' : 'border-[#1E88E5]'}`}>
      {imagen_url && (
        <div className="w-full h-36 bg-gray-100">
          <img src={imagen_url} alt={nombre} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-[#212121] text-base">{nombre}</h3>
          <span className="shrink-0 text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            {rubro}
          </span>
        </div>
        {descripcion && <p className="text-[#616161] text-sm mb-3">{descripcion}</p>}
        <div className="space-y-1.5 text-sm text-[#616161]">
          {direccion && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#1E88E5] shrink-0" />
              <span>{direccion}</span>
            </div>
          )}
          {telefono && (
            <a href={`tel:${telefono}`} className="flex items-center gap-2 hover:underline">
              <Phone size={14} className="text-[#1E88E5] shrink-0" />
              <span>{telefono}</span>
            </a>
          )}
        </div>
        {beneficio_socios && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-start gap-2">
            <Gift size={16} className="text-[#43A047] shrink-0 mt-0.5" />
            <p className="text-sm text-green-800"><span className="font-semibold">Beneficio para socios:</span> {beneficio_socios}</p>
          </div>
        )}
      </div>
    </article>
  )
}
