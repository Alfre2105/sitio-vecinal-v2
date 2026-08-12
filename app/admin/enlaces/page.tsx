'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { subirImagen } from '@/lib/subirImagen'
import { Plus, Trash2, ImagePlus, ImageOff, Pencil, Link as LinkIcon } from 'lucide-react'
import CampoArchivo from '@/components/CampoArchivo'

type Enlace = {
  id: string
  nombre: string
  url: string
  descripcion: string | null
  icono_url: string | null
  orden: number
  activo: boolean
}

export default function AdminEnlacesPage() {
  const [enlaces, setEnlaces] = useState<Enlace[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState<Enlace | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [subiendoId, setSubiendoId] = useState<string | null>(null)
  const inputImagenRef = useRef<HTMLInputElement>(null)
  const idParaImagen = useRef<string | null>(null)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const { data } = await supabase.from('enlaces_interes').select('*').order('orden', { ascending: true })
    setEnlaces((data as Enlace[]) ?? [])
    setCargando(false)
  }

  function abrirNuevo() {
    setEditando(null)
    setMostrarForm(true)
  }

  function abrirEditar(e: Enlace) {
    setEditando(e)
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
    const url = await subirImagen(file, 'enlaces')
    if (url) {
      await supabase.from('enlaces_interes').update({ icono_url: url }).eq('id', id)
      setEnlaces(prev => prev.map(x => x.id === id ? { ...x, icono_url: url } : x))
    }
    setSubiendoId(null)
  }

  async function quitarIcono(id: string) {
    if (!confirm('¿Quitar el ícono de este enlace?')) return
    await supabase.from('enlaces_interes').update({ icono_url: null }).eq('id', id)
    setEnlaces(prev => prev.map(x => x.id === id ? { ...x, icono_url: null } : x))
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este enlace?')) return
    await supabase.from('enlaces_interes').delete().eq('id', id)
    setEnlaces(prev => prev.filter(x => x.id !== id))
  }

  async function toggleActivo(e: Enlace) {
    await supabase.from('enlaces_interes').update({ activo: !e.activo }).eq('id', e.id)
    setEnlaces(prev => prev.map(x => x.id === e.id ? { ...x, activo: !x.activo } : x))
  }

  async function handleGuardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setGuardando(true)
    const form = e.currentTarget
    const data = new FormData(form)

    const archivo = data.get('icono') as File
    let icono_url: string | undefined
    if (archivo && archivo.size > 0) {
      icono_url = (await subirImagen(archivo, 'enlaces')) ?? undefined
    }

    const datos = {
      nombre: data.get('nombre') as string,
      url: data.get('url') as string,
      descripcion: (data.get('descripcion') as string) || null,
      orden: parseInt(data.get('orden') as string, 10) || 0,
      activo: data.get('activo') === 'true',
      ...(icono_url ? { icono_url } : {}),
    }

    if (editando) {
      await supabase.from('enlaces_interes').update(datos).eq('id', editando.id)
    } else {
      await supabase.from('enlaces_interes').insert(datos)
    }

    form.reset()
    setMostrarForm(false)
    setEditando(null)
    setGuardando(false)
    cargar()
  }

  return (
    <div>
      <input ref={inputImagenRef} type="file" accept="image/*" className="hidden" onChange={handleImagenExistente} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Enlaces de interés</h1>
          <p className="text-sm text-[#9E9E9E] mt-0.5">Sitios externos útiles para los vecinos, se muestran en el pie de página</p>
        </div>
        <button onClick={() => { if (mostrarForm) { setMostrarForm(false) } else { abrirNuevo() } }} className="bg-[#1E88E5] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#1565C0] text-sm">
          <Plus size={18} /> Nuevo enlace
        </button>
      </div>

      {mostrarForm && (
        <form key={editando?.id ?? 'nuevo'} onSubmit={handleGuardar} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-[#212121]">{editando ? `Editar enlace — ${editando.nombre}` : 'Nuevo enlace'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <input name="nombre" required placeholder="Nombre *" defaultValue={editando?.nombre} className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
            <input name="url" type="url" required placeholder="https://... *" defaultValue={editando?.url} className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
          </div>
          <textarea name="descripcion" rows={2} placeholder="Descripción breve (opcional)" defaultValue={editando?.descripcion ?? ''} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm resize-none" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#616161] block mb-1">Orden (menor = primero)</label>
              <input name="orden" type="number" defaultValue={editando?.orden ?? 0} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#616161] block mb-1">Estado</label>
              <select name="activo" defaultValue={editando ? String(editando.activo) : 'true'} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm bg-white">
                <option value="true">Activo (visible en el sitio)</option>
                <option value="false">Inactivo (oculto)</option>
              </select>
            </div>
          </div>
          <CampoArchivo name="icono" etiqueta={`Ícono ${editando?.icono_url ? '(dejar vacío para mantener el actual)' : '(opcional)'}`} />
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

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-[#9E9E9E]">Cargando...</div>
        ) : enlaces.length === 0 ? (
          <div className="p-8 text-center text-[#9E9E9E]">No hay enlaces cargados.</div>
        ) : (
          <div className="divide-y divide-[#F4F6F9]">
            {enlaces.map(e => (
              <div key={e.id} className={`flex items-center gap-4 p-4 ${!e.activo ? 'opacity-50' : ''}`}>
                <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] flex items-center justify-center shrink-0 overflow-hidden">
                  {e.icono_url ? (
                    <img src={e.icono_url} alt={e.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <LinkIcon size={18} className="text-[#1E88E5]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#212121] text-sm truncate">{e.nombre}</div>
                  <div className="text-[#9E9E9E] text-xs truncate">{e.url}</div>
                </div>
                <button
                  onClick={() => toggleActivo(e)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shrink-0 ${e.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {e.activo ? 'Activo' : 'Inactivo'}
                </button>
                <button onClick={() => abrirEditar(e)} className="p-1.5 rounded-lg hover:bg-blue-50 text-[#1E88E5] shrink-0" title="Editar enlace"><Pencil size={16} /></button>
                <button
                  onClick={() => abrirSelectorImagen(e.id)}
                  disabled={subiendoId === e.id}
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-[#1E88E5] disabled:opacity-50 shrink-0"
                  title={e.icono_url ? 'Cambiar ícono' : 'Subir ícono'}
                >
                  <ImagePlus size={16} />
                </button>
                {e.icono_url && (
                  <button onClick={() => quitarIcono(e.id)} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 shrink-0" title="Quitar ícono"><ImageOff size={16} /></button>
                )}
                <button onClick={() => eliminar(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 shrink-0" title="Eliminar enlace"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
