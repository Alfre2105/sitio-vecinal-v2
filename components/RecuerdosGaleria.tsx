'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

type Recuerdo = {
  id: string
  foto_url: string
  descripcion: string | null
}

export default function RecuerdosGaleria({ recuerdos }: { recuerdos: Recuerdo[] }) {
  const [abierto, setAbierto] = useState<Recuerdo | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {recuerdos.map(r => (
          <div key={r.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button onClick={() => setAbierto(r)} className="block w-full h-36 bg-gray-100 cursor-pointer">
              <img src={r.foto_url} alt={r.descripcion ?? 'Recuerdo del barrio'} className="w-full h-full object-cover" />
            </button>
            {r.descripcion && (
              <p className="text-xs text-[#616161] p-3 leading-relaxed">{r.descripcion}</p>
            )}
          </div>
        ))}
      </div>

      {abierto && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setAbierto(null)}
        >
          <button
            onClick={() => setAbierto(null)}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
          <div className="max-w-3xl max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={abierto.foto_url} alt={abierto.descripcion ?? 'Recuerdo del barrio'} className="max-w-full max-h-[80vh] rounded-xl object-contain" />
            {abierto.descripcion && (
              <p className="text-white text-sm text-center mt-4 max-w-xl">{abierto.descripcion}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
