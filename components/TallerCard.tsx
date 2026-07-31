'use client'

import { useState } from 'react'
import { User, Clock } from 'lucide-react'

interface Props {
  nombre: string
  profesor: string | null
  dia: string | null
  horario: string | null
  descripcion: string | null
  foto_url: string | null
}

export default function TallerCard({ nombre, profesor, dia, horario, descripcion, foto_url }: Props) {
  const [volteada, setVolteada] = useState(false)

  return (
    <div
      onClick={() => setVolteada(v => !v)}
      className="h-56 cursor-pointer select-none"
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{ transformStyle: 'preserve-3d', transform: volteada ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Frente */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-sm bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-end"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {foto_url && (
            <img src={foto_url} alt={nombre} className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="relative w-full bg-black/50 text-white text-center py-2.5 font-bold text-sm px-2">
            {nombre}
          </div>
        </div>

        {/* Dorso */}
        <div
          className="absolute inset-0 rounded-2xl shadow-sm bg-white border border-[#E0E0E0] p-4 flex flex-col justify-center text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <h3 className="font-bold text-[#212121] text-sm mb-2">{nombre}</h3>
          {profesor && (
            <p className="text-xs text-[#616161] mb-1.5 flex items-center justify-center gap-1.5">
              <User size={12} className="text-[#1E88E5] shrink-0" />
              {profesor}
            </p>
          )}
          {(dia || horario) && (
            <p className="text-xs text-[#9E9E9E] mb-3 flex items-center justify-center gap-1.5">
              <Clock size={12} className="text-[#1E88E5] shrink-0" />
              {[dia, horario].filter(Boolean).join(' · ')}
            </p>
          )}
          {descripcion && (
            <p className="text-xs text-[#9E9E9E] leading-relaxed line-clamp-4">{descripcion}</p>
          )}
        </div>
      </div>
    </div>
  )
}
