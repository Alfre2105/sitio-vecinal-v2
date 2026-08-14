'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const fotos = [
  { src: '/salon-1.jpg', alt: 'Salón comunitario' },
  { src: '/salon-2.jpg', alt: 'Salón comunitario' },
]

export default function FotosSalon() {
  const [abierta, setAbierta] = useState<string | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {fotos.map(f => (
          <button key={f.src} onClick={() => setAbierta(f.src)} className="block cursor-pointer">
            <img src={f.src} alt={f.alt} className="rounded-xl aspect-video object-cover w-full hover:opacity-90 transition-opacity" />
          </button>
        ))}
      </div>

      {abierta && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setAbierta(null)}
        >
          <button
            onClick={() => setAbierta(null)}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
          <img
            src={abierta}
            alt="Salón comunitario"
            className="max-w-full max-h-[85vh] rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
