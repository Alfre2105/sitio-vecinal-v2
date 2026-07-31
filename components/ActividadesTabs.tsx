'use client'

import { useState, ReactNode } from 'react'

export default function ActividadesTabs({ actividades, talleres }: { actividades: ReactNode; talleres: ReactNode }) {
  const [tab, setTab] = useState<'actividades' | 'talleres'>('actividades')

  return (
    <div>
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setTab('actividades')}
          className={`px-1 py-3 mr-6 text-sm font-bold border-b-2 transition-colors ${tab === 'actividades' ? 'border-[#1E88E5] text-[#1E88E5]' : 'border-transparent text-[#9E9E9E] hover:text-[#616161]'}`}
        >
          Actividades
        </button>
        <button
          onClick={() => setTab('talleres')}
          className={`px-1 py-3 text-sm font-bold border-b-2 transition-colors ${tab === 'talleres' ? 'border-[#1E88E5] text-[#1E88E5]' : 'border-transparent text-[#9E9E9E] hover:text-[#616161]'}`}
        >
          Talleres
        </button>
      </div>

      {tab === 'actividades' ? actividades : talleres}
    </div>
  )
}
