'use client'

import { useEffect, useState } from 'react'
import TallerCard from './TallerCard'

type Taller = {
  id: string
  nombre: string
  profesor: string | null
  telefono: string | null
  descripcion: string | null
  foto_url: string | null
  es_gratuito: boolean
}

export default function TalleresGrid({ talleres }: { talleres: Taller[] }) {
  const [volteadoId, setVolteadoId] = useState<string | null>(null)

  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-taller-card]')) {
        setVolteadoId(null)
      }
    }
    document.addEventListener('click', handleClickFuera)
    return () => document.removeEventListener('click', handleClickFuera)
  }, [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {talleres.map(t => (
        <div key={t.id} data-taller-card>
          <TallerCard
            {...t}
            volteada={volteadoId === t.id}
            onToggle={() => setVolteadoId(prev => prev === t.id ? null : t.id)}
          />
        </div>
      ))}
    </div>
  )
}
