'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User, GripVertical } from 'lucide-react'

type Miembro = {
  id: string
  nombre: string
  rol: string
  orden: number
  activo: boolean
}

export default function AdminComisionPage() {
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const { data } = await supabase.from('comision_directiva').select('*').order('orden')
    setMiembros((data as Miembro[]) ?? [])
    setCargando(false)
  }

  async function toggleActivo(id: string, actual: boolean) {
    await supabase.from('comision_directiva').update({ activo: !actual }).eq('id', id)
    setMiembros(prev => prev.map(m => m.id === id ? { ...m, activo: !actual } : m))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#212121]">Comisión Directiva</h1>
        <p className="text-sm text-[#9E9E9E] mt-1">Administrá los integrantes de la comisión directiva.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-[#9E9E9E]">Cargando...</div>
        ) : (
          <div className="divide-y divide-[#F4F6F9]">
            {miembros.map(m => (
              <div key={m.id} className={`flex items-center gap-4 p-4 ${!m.activo ? 'opacity-50' : ''}`}>
                <GripVertical size={16} className="text-[#E0E0E0] shrink-0" />
                <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center shrink-0">
                  <User size={18} className="text-[#1E88E5]" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[#212121] text-sm">{m.nombre}</div>
                  <div className="text-[#9E9E9E] text-xs">{m.rol}</div>
                </div>
                <button
                  onClick={() => toggleActivo(m.id, m.activo)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${m.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {m.activo ? 'Activo' : 'Inactivo'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
