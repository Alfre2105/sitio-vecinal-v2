'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { subirImagen } from '@/lib/subirImagen'
import { Plus, Trash2, ImagePlus, ImageOff, Pencil } from 'lucide-react'
import CampoArchivo from '@/components/CampoArchivo'

type Taller = {
  id: string
  nombre: string
  profesor: string | null
  telefono: string | null
  descripcion: string | null
  foto_url: string | null
  es_gratuito: boolean
  activo: boolean
}

export default function AdminTalleresPage() {
  const [talleres, setTalleres] = useState<Taller[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState<Taller | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [subiendoId, setSubiendoId] = useState<string | null>(null)
  const inputImagenRef = useRef<HTMLInputElement>(null)
  const idParaImagen = useRef<string | null>(null)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const { data } = await supabase.from('talleres').select('*').order('nombre', { ascending: true })
    setTalleres((data as Taller[]) ?? [])
    setCargando(false)
  }

  function abrirNuevo() {
    setEditando(null)
    setMostrarForm(true)
  }

  function abrirEditar(t: Taller) {
    setEditando(t)
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
    const url = await subirImagen(file, 'talleres')
    if (url) {
      await supabase.from('talleres').update({ foto_url: url }).eq('id', id)
      setTalleres(prev => prev.map(t => t.id === id ? { ...t, foto_url: url } : t))
    }
    setSubiendoId(null)
  }

  async function quitarFoto(id: string) {
    if (!confirm('¿Quitar la foto de este taller?')) return
    await supabase.from('talleres').update({ foto_url: null }).eq('id', id)
    setTalleres(prev => prev.map(t => t.id === id ? { ...t, foto_url: null } : t))
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este taller?')) return
    await supabase.from('talleres').delete().eq('id', id)
    setTalleres(prev => prev.filter(t => t.id !== id))
  }

  async function toggleActivo(t: Taller) {
    await supabase.from('talleres').update({ activo: !t.activo }).eq('id', t.id)
    setTalleres(prev => prev.map(x => x.id === t.id ? { ...x, activo: !x.activo } : x))
  }

  async function handleGuardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setGuardando(true)
    const form = e.currentTarget
    const data = new FormData(form)

    const archivo = data.get('foto') as File
    let foto_url: string | undefined
    if (archivo && archivo.size > 0) {
      foto_url = (await subirImagen(archivo, 'talleres')) ?? undefined
    }

    const datos = {
      nombre: data.get('nombre') as string,
      profesor: (data.get('profesor') as string) || null,
      telefono: (data.get('telefono') as string) || null,
      descripcion: (data.get('descripcion') as string) || null,
      es_gratuito: data.get('es_gratuito') === 'true',
      activo: data.get('activo') === 'true',
      ...(foto_url ? { foto_url } : {}),
    }

    if (editando) {
      await supabase.from('talleres').update(datos).eq('id', editando.id)
    } else {
      await supabase.from('talleres').insert(datos)
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
          <h1 className="text-2xl font-bold text-[#212121]">Talleres</h1>
          <p className="text-sm text-[#9E9E9E] mt-0.5">Talleres y profesores que se muestran en Actividades → Talleres</p>
        </div>
        <button onClick={() => { if (mostrarForm) { setMostrarForm(false) } else { abrirNuevo() } }} className="bg-[#1E88E5] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#1565C0] text-sm">
          <Plus size={18} /> Nuevo taller
        </button>
      </div>

      {mostrarForm && (
        <form key={editando?.id ?? 'nuevo'} onSubmit={handleGuardar} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-[#212121]">{editando ? `Editar taller — ${editando.nombre}` : 'Nuevo taller'}</h2>
          <input name="nombre" required placeholder="Nombre del taller *" defaultValue={editando?.nombre} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
          <div className="grid grid-cols-2 gap-4">
            <input name="profesor" placeholder="Profesor/a" defaultValue={editando?.profesor ?? ''} className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
            <input name="telefono" placeholder="Teléfono del profesor/a" defaultValue={editando?.telefono ?? ''} className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
          </div>
          <textarea name="descripcion" rows={3} placeholder="Descripción" defaultValue={editando?.descripcion ?? ''} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm resize-none" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#616161] block mb-1">¿Es gratuito?</label>
              <select name="es_gratuito" defaultValue={editando ? String(editando.es_gratuito) : 'true'} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm bg-white">
                <option value="true">Gratuito</option>
                <option value="false">Rentado</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#616161] block mb-1">Estado</label>
              <select name="activo" defaultValue={editando ? String(editando.activo) : 'true'} className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm bg-white">
                <option value="true">Activo (visible en el sitio)</option>
                <option value="false">Inactivo (oculto)</option>
              </select>
            </div>
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
        ) : talleres.length === 0 ? (
          <div className="p-8 text-center text-[#9E9E9E]">No hay talleres cargados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F4F6F9]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-[#616161]">Taller</th>
                <th className="text-left px-5 py-3 font-semibold text-[#616161] hidden md:table-cell">Profesor</th>
                <th className="text-left px-5 py-3 font-semibold text-[#616161] hidden lg:table-cell">Teléfono</th>
                <th className="text-center px-5 py-3 font-semibold text-[#616161]">Costo</th>
                <th className="text-center px-5 py-3 font-semibold text-[#616161]">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F9]">
              {talleres.map(t => (
                <tr key={t.id} className={`hover:bg-[#FAFAFA] ${!t.activo ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-4 font-medium text-[#212121]">{t.nombre}</td>
                  <td className="px-5 py-4 text-[#616161] hidden md:table-cell">{t.profesor ?? '—'}</td>
                  <td className="px-5 py-4 text-[#616161] hidden lg:table-cell">{t.telefono ?? '—'}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${t.es_gratuito ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {t.es_gratuito ? 'Gratuito' : 'Rentado'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => toggleActivo(t)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${t.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {t.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => abrirEditar(t)} className="p-1.5 rounded-lg hover:bg-blue-50 text-[#1E88E5]" title="Editar taller"><Pencil size={16} /></button>
                      <button
                        onClick={() => abrirSelectorImagen(t.id)}
                        disabled={subiendoId === t.id}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-[#1E88E5] disabled:opacity-50"
                        title={t.foto_url ? 'Cambiar foto' : 'Subir foto'}
                      >
                        <ImagePlus size={16} />
                      </button>
                      {t.foto_url && (
                        <button onClick={() => quitarFoto(t.id)} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500" title="Quitar foto"><ImageOff size={16} /></button>
                      )}
                      <button onClick={() => eliminar(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Eliminar taller"><Trash2 size={16} /></button>
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
