'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { subirImagen } from '@/lib/subirImagen'
import { Plus, Trash2, Check, X, ImagePlus } from 'lucide-react'

type Actividad = {
  id: string
  titulo: string
  descripcion: string
  fecha: string | null
  hora_inicio: string | null
  hora_fin: string | null
  lugar: string | null
  es_gratuita: boolean
  precio: number | null
  responsable: string | null
  contacto_inscripcion: string | null
  imagen_url: string | null
  origen: 'vecinal' | 'vecino'
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  nombre_propone: string | null
  contacto_propone: string | null
}

export default function AdminActividadesPage() {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aprobandoId, setAprobandoId] = useState<string | null>(null)
  const [subiendoId, setSubiendoId] = useState<string | null>(null)
  const inputImagenRef = useRef<HTMLInputElement>(null)
  const idParaImagen = useRef<string | null>(null)

  useEffect(() => { cargar() }, [])

  function abrirSelectorImagen(id: string) {
    idParaImagen.current = id
    inputImagenRef.current?.click()
  }

  async function handleImagenExistente(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const id = idParaImagen.current
    e.target.value = ''
    if (!file || !id) return

    setSubiendoId(id)
    const url = await subirImagen(file, 'actividades')
    if (url) {
      await supabase.from('actividades').update({ imagen_url: url }).eq('id', id)
      setActividades(prev => prev.map(a => a.id === id ? { ...a, imagen_url: url } : a))
    }
    setSubiendoId(null)
  }

  async function cargar() {
    setCargando(true)
    const { data } = await supabase.from('actividades').select('*').order('fecha', { ascending: false, nullsFirst: false })
    setActividades((data as Actividad[]) ?? [])
    setCargando(false)
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar esta actividad?')) return
    await supabase.from('actividades').delete().eq('id', id)
    setActividades(prev => prev.filter(a => a.id !== id))
  }

  async function rechazar(id: string) {
    if (!confirm('¿Rechazar esta propuesta? No se va a mostrar en el sitio.')) return
    await supabase.from('actividades').update({ estado: 'rechazada' }).eq('id', id)
    cargar()
  }

  async function handleCrear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setGuardando(true)
    const form = e.currentTarget
    const data = new FormData(form)

    const archivo = data.get('imagen') as File
    let imagen_url: string | null = null
    if (archivo && archivo.size > 0) {
      imagen_url = await subirImagen(archivo, 'actividades')
    }

    await supabase.from('actividades').insert({
      titulo: data.get('titulo') as string,
      descripcion: data.get('descripcion') as string,
      fecha: data.get('fecha') as string,
      hora_inicio: data.get('hora_inicio') as string,
      hora_fin: data.get('hora_fin') as string,
      lugar: data.get('lugar') as string,
      es_gratuita: data.get('es_gratuita') === 'true',
      precio: data.get('es_gratuita') === 'false' ? parseFloat(data.get('precio') as string) : null,
      responsable: data.get('responsable') as string,
      contacto_inscripcion: data.get('contacto_inscripcion') as string,
      imagen_url,
      origen: 'vecinal',
      estado: 'aprobada',
    })
    form.reset()
    setMostrarForm(false)
    setGuardando(false)
    cargar()
  }

  async function handleAprobar(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault()
    setGuardando(true)
    const form = e.currentTarget
    const data = new FormData(form)

    const archivo = data.get('imagen') as File
    let imagen_url: string | undefined
    if (archivo && archivo.size > 0) {
      imagen_url = (await subirImagen(archivo, 'actividades')) ?? undefined
    }

    await supabase.from('actividades').update({
      fecha: data.get('fecha') as string,
      hora_inicio: data.get('hora_inicio') as string,
      hora_fin: data.get('hora_fin') as string,
      lugar: data.get('lugar') as string,
      es_gratuita: data.get('es_gratuita') === 'true',
      precio: data.get('es_gratuita') === 'false' ? parseFloat(data.get('precio') as string) : null,
      responsable: data.get('responsable') as string,
      contacto_inscripcion: data.get('contacto_inscripcion') as string,
      ...(imagen_url ? { imagen_url } : {}),
      estado: 'aprobada',
    }).eq('id', id)
    setGuardando(false)
    setAprobandoId(null)
    cargar()
  }

  const pendientes = actividades.filter(a => a.estado === 'pendiente')
  const resto = actividades.filter(a => a.estado !== 'pendiente')

  return (
    <div>
      <input ref={inputImagenRef} type="file" accept="image/*" className="hidden" onChange={handleImagenExistente} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#212121]">Actividades</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="bg-[#43A047] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#388E3C] text-sm">
          <Plus size={18} /> Nueva actividad
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleCrear} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-[#212121]">Nueva actividad</h2>
          <input name="titulo" required placeholder="Título *" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047]" />
          <textarea name="descripcion" required rows={3} placeholder="Descripción *" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047] resize-none" />
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-[#616161] block mb-1">Fecha *</label><input name="fecha" type="date" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047]" /></div>
            <div><label className="text-xs font-medium text-[#616161] block mb-1">Lugar *</label><input name="lugar" required placeholder="Ej: Salón comunitario" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047]" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-[#616161] block mb-1">Hora inicio</label><input name="hora_inicio" type="time" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" /></div>
            <div><label className="text-xs font-medium text-[#616161] block mb-1">Hora fin</label><input name="hora_fin" type="time" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-[#616161] block mb-1">¿Es gratuita?</label>
              <select name="es_gratuita" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm bg-white">
                <option value="true">Sí, gratuita</option>
                <option value="false">No, tiene costo</option>
              </select>
            </div>
            <div><label className="text-xs font-medium text-[#616161] block mb-1">Precio (si tiene)</label><input name="precio" type="number" step="0.01" placeholder="0.00" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="responsable" required placeholder="Responsable *" className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
            <input name="contacto_inscripcion" required placeholder="Contacto inscripción *" className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#616161] block mb-1">Foto (opcional)</label>
            <input name="imagen" type="file" accept="image/*" className="w-full text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={guardando} className="bg-[#43A047] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#388E3C] disabled:opacity-60">
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} className="border border-[#E0E0E0] text-[#616161] px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Propuestas pendientes de vecinos */}
      {pendientes.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-[#212121] mb-3 flex items-center gap-2">
            Propuestas pendientes
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendientes.length}</span>
          </h2>
          <div className="space-y-3">
            {pendientes.map(a => (
              <div key={a.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-bold text-[#212121]">{a.titulo}</h3>
                    <p className="text-sm text-[#616161] mt-1">{a.descripcion}</p>
                    {a.fecha && <p className="text-xs text-[#9E9E9E] mt-1">Fecha tentativa: {new Date(a.fecha + 'T00:00:00').toLocaleDateString('es-AR')}</p>}
                    <p className="text-xs text-[#9E9E9E] mt-1">Propone: {a.nombre_propone} · {a.contacto_propone}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setAprobandoId(aprobandoId === a.id ? null : a.id)}
                      className="flex items-center gap-1.5 bg-green-50 text-green-700 font-semibold px-3 py-2 rounded-lg text-xs hover:bg-green-100"
                    >
                      <Check size={14} /> Aprobar
                    </button>
                    <button
                      onClick={() => rechazar(a.id)}
                      className="flex items-center gap-1.5 bg-red-50 text-red-600 font-semibold px-3 py-2 rounded-lg text-xs hover:bg-red-100"
                    >
                      <X size={14} /> Rechazar
                    </button>
                  </div>
                </div>

                {aprobandoId === a.id && (
                  <form onSubmit={(e) => handleAprobar(e, a.id)} className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                    <p className="text-xs text-[#616161]">Completá los datos que falten para publicarla:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-medium text-[#616161] block mb-1">Fecha *</label><input name="fecha" type="date" required defaultValue={a.fecha ?? ''} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" /></div>
                      <div><label className="text-xs font-medium text-[#616161] block mb-1">Lugar *</label><input name="lugar" required placeholder="Ej: Salón comunitario" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-medium text-[#616161] block mb-1">Hora inicio *</label><input name="hora_inicio" type="time" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" /></div>
                      <div><label className="text-xs font-medium text-[#616161] block mb-1">Hora fin *</label><input name="hora_fin" type="time" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-medium text-[#616161] block mb-1">¿Es gratuita?</label>
                        <select name="es_gratuita" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm bg-white">
                          <option value="true">Sí, gratuita</option>
                          <option value="false">No, tiene costo</option>
                        </select>
                      </div>
                      <div><label className="text-xs font-medium text-[#616161] block mb-1">Precio (si tiene)</label><input name="precio" type="number" step="0.01" placeholder="0.00" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input name="responsable" required placeholder="Responsable *" defaultValue={a.nombre_propone ?? ''} className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
                      <input name="contacto_inscripcion" required placeholder="Contacto inscripción *" defaultValue={a.contacto_propone ?? ''} className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#616161] block mb-1">Foto (opcional)</label>
                      <input name="imagen" type="file" accept="image/*" className="w-full text-sm" />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={guardando} className="bg-[#43A047] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#388E3C] disabled:opacity-60">
                        {guardando ? 'Publicando...' : 'Publicar actividad'}
                      </button>
                      <button type="button" onClick={() => setAprobandoId(null)} className="border border-[#E0E0E0] text-[#616161] px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50">
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-[#9E9E9E]">Cargando...</div>
        ) : resto.length === 0 ? (
          <div className="p-8 text-center text-[#9E9E9E]">No hay actividades cargadas.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F4F6F9]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-[#616161]">Actividad</th>
                <th className="text-left px-5 py-3 font-semibold text-[#616161] hidden md:table-cell">Fecha</th>
                <th className="text-left px-5 py-3 font-semibold text-[#616161] hidden lg:table-cell">Lugar</th>
                <th className="text-center px-5 py-3 font-semibold text-[#616161]">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F9]">
              {resto.map(a => (
                <tr key={a.id} className="hover:bg-[#FAFAFA]">
                  <td className="px-5 py-4 font-medium text-[#212121]">
                    {a.titulo}
                    {a.origen === 'vecino' && <span className="ml-2 text-[10px] font-semibold text-[#1E88E5] bg-[#E3F2FD] px-1.5 py-0.5 rounded">vecino</span>}
                  </td>
                  <td className="px-5 py-4 text-[#9E9E9E] hidden md:table-cell">{a.fecha ? new Date(a.fecha + 'T00:00:00').toLocaleDateString('es-AR') : '—'}</td>
                  <td className="px-5 py-4 text-[#616161] hidden lg:table-cell">{a.lugar ?? '—'}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${a.estado === 'rechazada' ? 'bg-gray-100 text-gray-500' : a.es_gratuita ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {a.estado === 'rechazada' ? 'Rechazada' : a.es_gratuita ? 'Gratuita' : 'Con costo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => abrirSelectorImagen(a.id)}
                        disabled={subiendoId === a.id}
                        className="p-1.5 rounded-lg hover:bg-[#E3F2FD] text-[#1E88E5] disabled:opacity-50"
                        title={a.imagen_url ? 'Cambiar foto' : 'Subir foto'}
                      >
                        <ImagePlus size={16} />
                      </button>
                      <button onClick={() => eliminar(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
