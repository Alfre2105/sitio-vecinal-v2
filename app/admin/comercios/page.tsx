'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { subirImagen } from '@/lib/subirImagen'
import { Plus, Trash2, Check, X, ImagePlus, ImageOff, Pencil } from 'lucide-react'
import CampoArchivo from '@/components/CampoArchivo'

type Comercio = {
  id: string
  nombre: string
  rubro: string
  descripcion: string | null
  beneficio_socios: string | null
  telefono: string | null
  direccion: string | null
  imagen_url: string | null
  origen: 'vecinal' | 'comercio'
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  contacto_nombre: string | null
  activo: boolean
}

export default function AdminComerciosPage() {
  const [comercios, setComercios] = useState<Comercio[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState<Comercio | null>(null)
  const [aprobandoId, setAprobandoId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [subiendoId, setSubiendoId] = useState<string | null>(null)
  const inputImagenRef = useRef<HTMLInputElement>(null)
  const idParaImagen = useRef<string | null>(null)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const { data } = await supabase.from('comercios').select('*').order('nombre', { ascending: true })
    setComercios((data as Comercio[]) ?? [])
    setCargando(false)
  }

  function abrirNuevo() {
    setEditando(null)
    setMostrarForm(true)
  }

  function abrirEditar(c: Comercio) {
    setEditando(c)
    setMostrarForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
    const url = await subirImagen(file, 'comercios')
    if (url) {
      await supabase.from('comercios').update({ imagen_url: url }).eq('id', id)
      setComercios(prev => prev.map(c => c.id === id ? { ...c, imagen_url: url } : c))
    }
    setSubiendoId(null)
  }

  async function quitarFoto(id: string) {
    if (!confirm('¿Quitar la foto de este comercio?')) return
    await supabase.from('comercios').update({ imagen_url: null }).eq('id', id)
    setComercios(prev => prev.map(c => c.id === id ? { ...c, imagen_url: null } : c))
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este comercio?')) return
    await supabase.from('comercios').delete().eq('id', id)
    setComercios(prev => prev.filter(c => c.id !== id))
  }

  async function rechazar(id: string) {
    if (!confirm('¿Rechazar esta solicitud? No se va a publicar.')) return
    await supabase.from('comercios').update({ estado: 'rechazado' }).eq('id', id)
    cargar()
  }

  async function toggleActivo(c: Comercio) {
    await supabase.from('comercios').update({ activo: !c.activo }).eq('id', c.id)
    setComercios(prev => prev.map(x => x.id === c.id ? { ...x, activo: !x.activo } : x))
  }

  async function handleGuardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setGuardando(true)
    const form = e.currentTarget
    const data = new FormData(form)

    const archivo = data.get('foto') as File
    let imagen_url: string | undefined
    if (archivo && archivo.size > 0) {
      imagen_url = (await subirImagen(archivo, 'comercios')) ?? undefined
    }

    const datos = {
      nombre: data.get('nombre') as string,
      rubro: data.get('rubro') as string,
      descripcion: (data.get('descripcion') as string) || null,
      beneficio_socios: (data.get('beneficio_socios') as string) || null,
      telefono: (data.get('telefono') as string) || null,
      direccion: (data.get('direccion') as string) || null,
      activo: data.get('activo') === 'true',
      ...(imagen_url ? { imagen_url } : {}),
    }

    if (editando) {
      await supabase.from('comercios').update(datos).eq('id', editando.id)
    } else {
      await supabase.from('comercios').insert({ ...datos, origen: 'vecinal', estado: 'aprobado' })
    }

    form.reset()
    setMostrarForm(false)
    setEditando(null)
    setGuardando(false)
    cargar()
  }

  async function handleAprobar(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault()
    setGuardando(true)
    const form = e.currentTarget
    const data = new FormData(form)

    const archivo = data.get('foto') as File
    let imagen_url: string | undefined
    if (archivo && archivo.size > 0) {
      imagen_url = (await subirImagen(archivo, 'comercios')) ?? undefined
    }

    await supabase.from('comercios').update({
      rubro: data.get('rubro') as string,
      descripcion: (data.get('descripcion') as string) || null,
      beneficio_socios: (data.get('beneficio_socios') as string) || null,
      telefono: data.get('telefono') as string,
      direccion: (data.get('direccion') as string) || null,
      ...(imagen_url ? { imagen_url } : {}),
      estado: 'aprobado',
    }).eq('id', id)

    setGuardando(false)
    setAprobandoId(null)
    cargar()
  }

  const pendientes = comercios.filter(c => c.estado === 'pendiente')
  const resto = comercios.filter(c => c.estado !== 'pendiente')

  return (
    <div>
      <input ref={inputImagenRef} type="file" accept="image/*" className="hidden" onChange={handleImagenExistente} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Comercios</h1>
          <p className="text-sm text-[#9E9E9E] mt-0.5">Comercios recomendados que se muestran en /comercios</p>
        </div>
        <button onClick={() => { if (mostrarForm) { setMostrarForm(false) } else { abrirNuevo() } }} className="bg-[#1E88E5] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#1565C0] text-sm">
          <Plus size={18} /> Nuevo comercio
        </button>
      </div>

      {mostrarForm && (
        <form key={editando?.id ?? 'nuevo'} onSubmit={handleGuardar} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-[#212121]">{editando ? `Editar comercio — ${editando.nombre}` : 'Nuevo comercio'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <input name="nombre" required placeholder="Nombre del comercio *" defaultValue={editando?.nombre} className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
            <input name="rubro" required placeholder="Rubro *" defaultValue={editando?.rubro} className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
          </div>
          <textarea name="descripcion" rows={2} placeholder="Descripción" defaultValue={editando?.descripcion ?? ''} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm resize-none" />
          <div>
            <label className="text-xs font-medium text-[#616161] block mb-1">Beneficio para socios (dejar vacío si no tiene)</label>
            <input name="beneficio_socios" placeholder="Ej: 10% de descuento presentando el carnet" defaultValue={editando?.beneficio_socios ?? ''} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="telefono" placeholder="Teléfono" defaultValue={editando?.telefono ?? ''} className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
            <input name="direccion" placeholder="Dirección" defaultValue={editando?.direccion ?? ''} className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#616161] block mb-1">Estado</label>
            <select name="activo" defaultValue={editando ? String(editando.activo) : 'true'} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm bg-white">
              <option value="true">Activo (visible en el sitio)</option>
              <option value="false">Inactivo (oculto)</option>
            </select>
          </div>
          <CampoArchivo name="foto" etiqueta={`Foto ${editando?.imagen_url ? '(dejar vacío para mantener la actual)' : '(opcional)'}`} />
          <div className="flex gap-3">
            <button type="submit" disabled={guardando} className="bg-[#1E88E5] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#1565C0] disabled:opacity-60">
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => { setMostrarForm(false); setEditando(null) }} className="border border-[#E0E0E0] text-[#616161] px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Solicitudes pendientes */}
      {pendientes.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-[#212121] mb-3 flex items-center gap-2">
            Solicitudes pendientes
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendientes.length}</span>
          </h2>
          <div className="space-y-3">
            {pendientes.map(c => (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-bold text-[#212121]">{c.nombre}</h3>
                    <p className="text-sm text-[#616161] mt-1">{c.rubro}</p>
                    <p className="text-xs text-[#9E9E9E] mt-1">Contacto: {c.contacto_nombre} · {c.telefono}</p>
                    {c.descripcion && <p className="text-xs text-[#9E9E9E] mt-1">"{c.descripcion}"</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setAprobandoId(aprobandoId === c.id ? null : c.id)}
                      className="flex items-center gap-1.5 bg-green-50 text-green-700 font-semibold px-3 py-2 rounded-lg text-xs hover:bg-green-100"
                    >
                      <Check size={14} /> Aprobar
                    </button>
                    <button
                      onClick={() => rechazar(c.id)}
                      className="flex items-center gap-1.5 bg-red-50 text-red-600 font-semibold px-3 py-2 rounded-lg text-xs hover:bg-red-100"
                    >
                      <X size={14} /> Rechazar
                    </button>
                  </div>
                </div>

                {aprobandoId === c.id && (
                  <form onSubmit={(e) => handleAprobar(e, c.id)} className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                    <p className="text-xs text-[#616161]">Completá los datos para publicarlo (contactaste al comercio antes, ¿no?):</p>
                    <input name="rubro" required placeholder="Rubro *" defaultValue={c.rubro} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
                    <textarea name="descripcion" rows={2} placeholder="Descripción" defaultValue={c.descripcion ?? ''} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm resize-none" />
                    <input name="beneficio_socios" placeholder="Beneficio para socios (dejar vacío si no tiene)" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
                    <div className="grid grid-cols-2 gap-4">
                      <input name="telefono" required placeholder="Teléfono *" defaultValue={c.telefono ?? ''} className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
                      <input name="direccion" placeholder="Dirección" className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
                    </div>
                    <CampoArchivo name="foto" etiqueta="Foto (opcional)" />
                    <div className="flex gap-3">
                      <button type="submit" disabled={guardando} className="bg-[#43A047] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#388E3C] disabled:opacity-60">
                        {guardando ? 'Publicando...' : 'Publicar comercio'}
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
          <div className="p-8 text-center text-[#9E9E9E]">No hay comercios cargados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F4F6F9]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-[#616161]">Comercio</th>
                <th className="text-left px-5 py-3 font-semibold text-[#616161] hidden md:table-cell">Rubro</th>
                <th className="text-center px-5 py-3 font-semibold text-[#616161] hidden lg:table-cell">Beneficio</th>
                <th className="text-center px-5 py-3 font-semibold text-[#616161]">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F9]">
              {resto.map(c => (
                <tr key={c.id} className={`hover:bg-[#FAFAFA] ${!c.activo || c.estado === 'rechazado' ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-4 font-medium text-[#212121]">{c.nombre}</td>
                  <td className="px-5 py-4 text-[#616161] hidden md:table-cell">{c.rubro}</td>
                  <td className="px-5 py-4 text-center hidden lg:table-cell">
                    {c.beneficio_socios
                      ? <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">Sí</span>
                      : <span className="text-xs text-[#9E9E9E]">—</span>}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.estado === 'rechazado' ? 'bg-gray-100 text-gray-500' : c.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.estado === 'rechazado' ? 'Rechazado' : c.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => abrirEditar(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-[#1E88E5]" title="Editar comercio"><Pencil size={16} /></button>
                      <button
                        onClick={() => abrirSelectorImagen(c.id)}
                        disabled={subiendoId === c.id}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-[#1E88E5] disabled:opacity-50"
                        title={c.imagen_url ? 'Cambiar foto' : 'Subir foto'}
                      >
                        <ImagePlus size={16} />
                      </button>
                      {c.imagen_url && (
                        <button onClick={() => quitarFoto(c.id)} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500" title="Quitar foto"><ImageOff size={16} /></button>
                      )}
                      {c.estado === 'aprobado' && (
                        <button
                          onClick={() => toggleActivo(c)}
                          className="text-xs font-semibold px-2 py-1 rounded-lg hover:bg-gray-100 text-[#616161]"
                          title={c.activo ? 'Desactivar' : 'Activar'}
                        >
                          {c.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                      <button onClick={() => eliminar(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Eliminar comercio"><Trash2 size={16} /></button>
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
