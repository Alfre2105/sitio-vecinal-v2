'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Users, Check, X, FileText } from 'lucide-react'

type Socio = {
  id: string
  dni: string
  numero_socio: string
  nombre: string
  apellido: string
  email: string | null
  telefono: string | null
  direccion: string | null
  categoria: string
  activo: boolean
  fecha_ingreso: string
  dni_foto_url: string | null
  comprobante_domicilio_url: string | null
}

async function verDocumento(path: string) {
  const ventana = window.open('', '_blank')
  const res = await fetch(`/api/documento-socio?path=${encodeURIComponent(path)}`, {
    headers: { 'x-admin-password': process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? '' },
  })
  if (!res.ok) { ventana?.close(); return }
  const data = await res.json()
  if (ventana) ventana.location.href = data.url
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

  async function aprobar(id: string) {
    await supabase.from('socios').update({ activo: true, categoria: 'activo' }).eq('id', id)
    cargar()
  }

  async function rechazar(id: string) {
    if (!confirm('¿Rechazar esta solicitud de adhesión?')) return
    await supabase.from('socios').delete().eq('id', id)
    cargar()
  }

  const pendientes = socios.filter(s => s.categoria === 'adherente' && !s.activo)
  const resto = socios.filter(s => !(s.categoria === 'adherente' && !s.activo))

  const filtrados = resto.filter(s =>
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

      {/* Solicitudes pendientes */}
      {pendientes.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-[#212121] mb-3 flex items-center gap-2">
            Solicitudes de adhesión pendientes
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendientes.length}</span>
          </h2>
          <div className="space-y-3">
            {pendientes.map(s => (
              <div key={s.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-bold text-[#212121]">{s.nombre} {s.apellido}</p>
                    <p className="text-sm text-[#616161]">DNI {s.dni}{s.direccion ? ` · ${s.direccion}` : ''}</p>
                    {(s.email || s.telefono) && (
                      <p className="text-sm text-[#9E9E9E]">{[s.email, s.telefono].filter(Boolean).join(' · ')}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => aprobar(s.id)} className="flex items-center gap-1.5 bg-green-50 text-green-700 font-semibold px-3 py-2 rounded-lg text-xs hover:bg-green-100">
                      <Check size={14} /> Aprobar
                    </button>
                    <button onClick={() => rechazar(s.id)} className="flex items-center gap-1.5 bg-red-50 text-red-600 font-semibold px-3 py-2 rounded-lg text-xs hover:bg-red-100">
                      <X size={14} /> Rechazar
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  {s.dni_foto_url && (
                    <button onClick={() => verDocumento(s.dni_foto_url!)} className="flex items-center gap-1.5 text-xs font-semibold text-[#1E88E5] border border-[#1E88E5] px-3 py-1.5 rounded-lg hover:bg-[#E3F2FD]">
                      <FileText size={14} /> Ver DNI
                    </button>
                  )}
                  {s.comprobante_domicilio_url && (
                    <button onClick={() => verDocumento(s.comprobante_domicilio_url!)} className="flex items-center gap-1.5 text-xs font-semibold text-[#1E88E5] border border-[#1E88E5] px-3 py-1.5 rounded-lg hover:bg-[#E3F2FD]">
                      <FileText size={14} /> Ver comprobante
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
