'use client'

import { useState } from 'react'
import { Upload, FileCheck } from 'lucide-react'

const ACENTOS = {
  blue: {
    borde: 'border border-[#E0E0E0]',
    hover: 'hover:bg-[#F4F6F9]',
    icono: 'text-[#1E88E5]',
  },
  green: {
    borde: 'border-2 border-dashed border-[#43A047]/50',
    hover: 'hover:bg-[#E8F5E9]',
    icono: 'text-[#43A047]',
  },
}

export default function CampoArchivo({
  name,
  etiqueta,
  requerido,
  acento = 'blue',
}: {
  name: string
  etiqueta?: string
  requerido?: boolean
  acento?: 'blue' | 'green'
}) {
  const [nombreArchivo, setNombreArchivo] = useState('')
  const id = `campo-${name}`
  const estilo = ACENTOS[acento]

  return (
    <div>
      {etiqueta && (
        <label htmlFor={id} className="block text-sm font-medium text-[#212121] mb-1">
          {etiqueta} {requerido && '*'}
        </label>
      )}
      <label
        htmlFor={id}
        className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm cursor-pointer transition-colors ${estilo.borde} ${estilo.hover}`}
      >
        {nombreArchivo ? <FileCheck size={18} className={`${estilo.icono} shrink-0`} /> : <Upload size={18} className={`${estilo.icono} shrink-0`} />}
        <span className={nombreArchivo ? 'text-[#212121] truncate' : 'text-[#616161]'}>
          {nombreArchivo || 'Elegir archivo...'}
        </span>
      </label>
      <input
        id={id}
        name={name}
        type="file"
        accept="image/*"
        required={requerido}
        className="sr-only"
        onChange={e => setNombreArchivo(e.target.files?.[0]?.name ?? '')}
      />
    </div>
  )
}
