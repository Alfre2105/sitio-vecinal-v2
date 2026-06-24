'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Users } from 'lucide-react'

type Socio = {
  id: string
  dni: string
  numero_socio: string
  nombre: string
  apellido: string
  email: string | null
  telefono: string | null
  categoria: string
  activo: boolean
  fecha_ingreso: string
}

export default function AdminSociosPage() {
  const [socios, setSocios] = useState<Socio[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    const { data } = await supabase
      .from('socios')
      .select('*')
      .order('apellido', { ascending: true })
    setSocios((data as Socio[]) ?? [])
    setCargando(false)
  }

  const filtrados = socios.filter(s =>
    busqueda === '' ||
    s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.dni.includes(busqueda) ||
    s.numero_socio.toLowerCase().includes(busqueda.toLowerCase())
  )

  const CAT_COLORS: Record<string, string> = {
    activo: 'bg-green-100 text-green-700',
    cadete: 'bg-blue-100 text-blue-700',
    vitalicio: 'bg-purple-100 text-purple-700',
    honorario: 'bg-yellow-100 text-yellow-700',
    adherente: 'bg-gray-100 text-gray-600',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Socios</h1>
          <p className="text-sm text-[#9E9E9E] mt-0.5">{socios.filter(s => s.activo).length} socios activos</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]" />
        <input
          type="text"
          placeholder="Buscar por nombre, DNI o número de socio..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#E0E0E0] rounded-xl text-sm focus:outline-none focus:border-[#1E88E5]"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-[#9E9E9E]">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-8 text-center text-[#9E9E9E]">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            {busqueda ? 'No se encontraron socios con esa búsqueda.' : 'No hay socios registrados.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F4F6F9]">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-[#616161]">Nombre</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#616161] hidden sm:table-cell">N° Socio</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#616161] hidden md:table-cell">DNI</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#616161] hidden lg:table-cell">Contacto</th>
                  <th className="text-center px-5 py-3 font-semibold text-[#616161]">Categoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F6F9]">
                {filtrados.map(s => (
                  <tr key={s.id} className="hover:bg-[#FAFAFA]">
                    <td className="px-5 py-4">
                      <div className="font-medium text-[#212121]">{s.apellido}, {s.nombre}</div>
                      <div className="text-xs text-[#9E9E9E]">Desde {new Date(s.fecha_ingreso + 'T00:00:00').toLocaleDateString('es-AR')}</div>
                    </td>
                    <td className="px-5 py-4 text-[#616161] hidden sm:table-cell font-mono text-xs">{s.numero_socio}</td>
                    <td className="px-5 py-4 text-[#616161] hidden md:table-cell font-mono text-xs">{s.dni}</td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {s.email && <div className="text-xs text-[#616161]">{s.email}</div>}
                      {s.telefono && <div className="text-xs text-[#9E9E9E]">{s.telefono}</div>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${CAT_COLORS[s.categoria] ?? 'bg-gray-100 text-gray-600'}`}>
                        {s.categoria}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
