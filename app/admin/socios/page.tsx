'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Users, Check, X, FileText, Plus, Trash2 } from 'lucide-react'

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
  dni_foto_frente_url: string | null
  dni_foto_dorso_url: string | null
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
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')

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

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este socio?')) return
    await supabase.from('socios').delete().eq('id', id)
    cargar()
  }

  async function handleCrear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    const form = e.currentTarget
    const data = new FormData(form)

    const { error } = await supabase.from('socios').insert({
      nombre: data.get('nombre') as string,
      apellido: data.get('apellido') as string,
      dni: data.get('dni') as string,
      numero_socio: data.get('numero_socio') as string,
      email: (data.get('email') as string) || null,
      telefono: (data.get('telefono') as string) || null,
      direccion: (data.get('direccion') as string) || null,
      fecha_nacimiento: (data.get('fecha_nacimiento') as string) || null,
      fecha_ingreso: data.get('fecha_ingreso') as string,
      categoria: data.get('categoria') as string,
      activo: data.get('activo') === 'true',
    })

    if (error) {
      setErrorForm(error.code === '23505' ? 'Ya existe un socio con ese DNI, número de socio o email.' : 'Error al guardar.')
      setGuardando(false)
      return
    }

    form.reset()
    setMostrarForm(false)
    setGuardando(false)
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
        <button onClick={() => setMostrarForm(!mostrarForm)} className="bg-[#1E88E5] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#1565C0] text-sm">
          <Plus size={18} /> Nuevo socio
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleCrear} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-[#212121]">Nuevo socio</h2>
          <p className="text-xs text-[#9E9E9E]">Para cargar socios ya existentes en el padrón de la Vecinal. No pide fotos de documentos — eso es solo para adhesiones nuevas por la web.</p>
          <div className="grid grid-cols-2 gap-4">
            <input name="nombre" required placeholder="Nombre *" className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
            <input name="apellido" required placeholder="Apellido *" className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="dni" required placeholder="DNI *" className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
            <input name="numero_socio" required placeholder="Número de socio *" className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="email" type="email" placeholder="Email" className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
            <input name="telefono" placeholder="Teléfono" className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
          </div>
          <input name="direccion" placeholder="Domicilio" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#616161] block mb-1">Fecha de nacimiento</label>
              <input name="fecha_nacimiento" type="date" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#616161] block mb-1">Fecha de ingreso *</label>
              <input name="fecha_ingreso" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#616161] block mb-1">Categoría *</label>
              <select name="categoria" required defaultValue="activo" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm bg-white">
                <option value="activo">Activo</option>
                <option value="cadete">Cadete</option>
                <option value="vitalicio">Vitalicio</option>
                <option value="honorario">Honorario</option>
                <option value="adherente">Adherente</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#616161] block mb-1">Estado *</label>
              <select name="activo" required defaultValue="true" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm bg-white">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          {errorForm && <p className="text-red-600 text-sm">{errorForm}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={guardando} className="bg-[#1E88E5] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#1565C0] disabled:opacity-60">
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} className="border border-[#E0E0E0] text-[#616161] px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      )}

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
                  {s.dni_foto_frente_url && (
                    <button onClick={() => verDocumento(s.dni_foto_frente_url!)} className="flex items-center gap-1.5 text-xs font-semibold text-[#1E88E5] border border-[#1E88E5] px-3 py-1.5 rounded-lg hover:bg-[#E3F2FD]">
                      <FileText size={14} /> Ver DNI (frente)
                    </button>
                  )}
                  {s.dni_foto_dorso_url && (
                    <button onClick={() => verDocumento(s.dni_foto_dorso_url!)} className="flex items-center gap-1.5 text-xs font-semibold text-[#1E88E5] border border-[#1E88E5] px-3 py-1.5 rounded-lg hover:bg-[#E3F2FD]">
                      <FileText size={14} /> Ver DNI (dorso)
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
                  <th className="px-5 py-3" />
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
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => eliminar(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
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
