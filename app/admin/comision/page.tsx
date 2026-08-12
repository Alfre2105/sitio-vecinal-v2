'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { subirImagen } from '@/lib/subirImagen'
import { User, ImagePlus, ImageOff, Pencil, Trash2, Plus } from 'lucide-react'
import CampoArchivo from '@/components/CampoArchivo'

type Miembro = {
  id: string
  nombre: string
  rol: string
  descripcion: string | null
  foto_url: string | null
  orden: number
  activo: boolean
}

export default function AdminComisionPage() {
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState<Miembro | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [subiendoId, setSubiendoId] = useState<string | null>(null)
  const inputImagenRef = useRef<HTMLInputElement>(null)
  const idParaImagen = useRef<string | null>(null)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const { data } = await supabase.from('comision_directiva').select('*').order('orden')
    setMiembros((data as Miembro[]) ?? [])
    setCargando(false)
  }

  function abrirNuevo() {
    setEditando(null)
    setMostrarForm(true)
  }

  function abrirEditar(m: Miembro) {
    setEditando(m)
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
    const url = await subirImagen(file, 'comision')
    if (url) {
      await supabase.from('comision_directiva').update({ foto_url: url }).eq('id', id)
      setMiembros(prev => prev.map(m => m.id === id ? { ...m, foto_url: url } : m))
    }
    setSubiendoId(null)
  }

  async function quitarFoto(id: string) {
    if (!confirm('¿Quitar la foto de este integrante? Va a volver a mostrar el ícono genérico.')) return
    await supabase.from('comision_directiva').update({ foto_url: null }).eq('id', id)
    setMiembros(prev => prev.map(m => m.id === id ? { ...m, foto_url: null } : m))
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este integrante?')) return
    await supabase.from('comision_directiva').delete().eq('id', id)
    setMiembros(prev => prev.filter(m => m.id !== id))
  }

  async function toggleActivo(id: string, actual: boolean) {
    await supabase.from('comision_directiva').update({ activo: !actual }).eq('id', id)
    setMiembros(prev => prev.map(m => m.id === id ? { ...m, activo: !actual } : m))
  }

  async function handleGuardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setGuardando(true)
    const form = e.currentTarget
    const data = new FormData(form)

    const archivo = data.get('foto') as File
    let foto_url: string | undefined
    if (archivo && archivo.size > 0) {
      foto_url = (await subirImagen(archivo, 'comision')) ?? undefined
    }

    const datos = {
      nombre: data.get('nombre') as string,
      rol: data.get('rol') as string,
      orden: parseInt(data.get('orden') as string, 10) || 0,
      descripcion: (data.get('descripcion') as string) || null,
      activo: data.get('activo') === 'true',
      ...(foto_url ? { foto_url } : {}),
    }

    if (editando) {
      await supabase.from('comision_directiva').update(datos).eq('id', editando.id)
    } else {
      await supabase.from('comision_directiva').insert(datos)
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
          <h1 className="text-2xl font-bold text-[#212121]">Comisión Directiva</h1>
          <p className="text-sm text-[#9E9E9E] mt-0.5">Se muestra en Quiénes somos</p>
        </div>
        <button onClick={() => { if (mostrarForm) { setMostrarForm(false) } else { abrirNuevo() } }} className="bg-[#1E88E5] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#1565C0] text-sm">
          <Plus size={18} /> Nuevo integrante
        </button>
      </div>

      {mostrarForm && (
        <form key={editando?.id ?? 'nuevo'} onSubmit={handleGuardar} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-[#212121]">{editando ? `Editar integrante — ${editando.nombre}` : 'Nuevo integrante'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <input name="nombre" required placeholder="Nombre *" defaultValue={editando?.nombre} className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
            <input name="rol" required placeholder="Cargo *" defaultValue={editando?.rol} className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
          </div>
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
          <div>
            <label className="text-xs font-medium text-[#616161] block mb-1">Historia (opcional)</label>
            <textarea name="descripcion" rows={3} placeholder="Resumen personal: ocupación, hace cuánto vive en el barrio, etc." defaultValue={editando?.descripcion ?? ''} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm resize-none" />
          </div>
          <CampoArchivo name="foto" etiqueta={`Foto ${editando?.foto_url ? '(dejar vacío para mantener la actual)' : '(opcional)'}`} />
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
        ) : (
          <div className="divide-y divide-[#F4F6F9]">
            {miembros.map(m => (
              <div key={m.id} className={`flex items-center gap-4 p-4 ${!m.activo ? 'opacity-50' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center shrink-0 overflow-hidden">
                  {m.foto_url ? (
                    <img src={m.foto_url} alt={m.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-[#1E88E5]" />
                  )}
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
                <button onClick={() => abrirEditar(m)} className="p-1.5 rounded-lg hover:bg-blue-50 text-[#1E88E5]" title="Editar integrante"><Pencil size={16} /></button>
                <button
                  onClick={() => abrirSelectorImagen(m.id)}
                  disabled={subiendoId === m.id}
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-[#1E88E5] disabled:opacity-50"
                  title={m.foto_url ? 'Cambiar foto' : 'Subir foto'}
                >
                  <ImagePlus size={16} />
                </button>
                {m.foto_url && (
                  <button onClick={() => quitarFoto(m.id)} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500" title="Quitar foto"><ImageOff size={16} /></button>
                )}
                <button onClick={() => eliminar(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Eliminar integrante"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
