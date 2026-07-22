'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { subirImagen } from '@/lib/subirImagen'
import { Plus, Eye, EyeOff, Trash2, Edit, ImagePlus } from 'lucide-react'

type Noticia = {
  id: string
  titulo: string
  categoria: string
  fecha: string
  publicada: boolean
  imagen_url: string | null
}

export default function AdminNoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [subiendoId, setSubiendoId] = useState<string | null>(null)
  const inputImagenRef = useRef<HTMLInputElement>(null)
  const idParaImagen = useRef<string | null>(null)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    const { data } = await supabase
      .from('noticias')
      .select('id, titulo, categoria, fecha, publicada, imagen_url')
      .order('fecha', { ascending: false })
    setNoticias(data ?? [])
    setCargando(false)
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
    const url = await subirImagen(file, 'noticias')
    if (url) {
      await supabase.from('noticias').update({ imagen_url: url }).eq('id', id)
      setNoticias(prev => prev.map(n => n.id === id ? { ...n, imagen_url: url } : n))
    }
    setSubiendoId(null)
  }

  async function togglePublicada(id: string, actual: boolean) {
    await supabase.from('noticias').update({ publicada: !actual }).eq('id', id)
    setNoticias(prev => prev.map(n => n.id === id ? { ...n, publicada: !actual } : n))
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar esta noticia?')) return
    await supabase.from('noticias').delete().eq('id', id)
    setNoticias(prev => prev.filter(n => n.id !== id))
  }

  async function handleCrear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setGuardando(true)
    const form = e.currentTarget
    const data = new FormData(form)

    const archivo = data.get('imagen') as File
    let imagen_url: string | null = null
    if (archivo && archivo.size > 0) {
      imagen_url = await subirImagen(archivo, 'noticias')
    }

    await supabase.from('noticias').insert({
      titulo: data.get('titulo') as string,
      resumen: data.get('resumen') as string,
      contenido: data.get('contenido') as string,
      categoria: data.get('categoria') as string,
      fecha: data.get('fecha') as string,
      imagen_url,
      publicada: false,
    })

    form.reset()
    setMostrarForm(false)
    setGuardando(false)
    cargar()
  }

  return (
    <div>
      <input ref={inputImagenRef} type="file" accept="image/*" className="hidden" onChange={handleImagenExistente} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#212121]">Noticias</h1>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-[#1E88E5] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#1565C0] transition-colors text-sm"
        >
          <Plus size={18} />
          Nueva noticia
        </button>
      </div>

      {/* Formulario de nueva noticia */}
      {mostrarForm && (
        <form onSubmit={handleCrear} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-[#212121]">Nueva noticia</h2>
          <input name="titulo" required placeholder="Título *" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5]" />
          <textarea name="resumen" required rows={2} placeholder="Resumen *" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5] resize-none" />
          <textarea name="contenido" required rows={5} placeholder="Contenido completo *" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5] resize-none" />
          <div className="grid grid-cols-2 gap-4">
            <select name="categoria" required className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5] bg-white">
              <option value="">Categoría *</option>
              {['Seguridad','Comunidad','Obras','Servicios','Institucional'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input name="fecha" type="date" required className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5]" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#616161] block mb-1">Foto (opcional)</label>
            <input name="imagen" type="file" accept="image/*" className="w-full text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={guardando} className="bg-[#1E88E5] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#1565C0] disabled:opacity-60">
              {guardando ? 'Guardando...' : 'Guardar (como borrador)'}
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} className="border border-[#E0E0E0] text-[#616161] px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Listado */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-[#9E9E9E]">Cargando...</div>
        ) : noticias.length === 0 ? (
          <div className="p-8 text-center text-[#9E9E9E]">No hay noticias cargadas.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F4F6F9]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-[#616161]">Título</th>
                <th className="text-left px-5 py-3 font-semibold text-[#616161] hidden sm:table-cell">Categoría</th>
                <th className="text-left px-5 py-3 font-semibold text-[#616161] hidden md:table-cell">Fecha</th>
                <th className="text-center px-5 py-3 font-semibold text-[#616161]">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F9]">
              {noticias.map(n => (
                <tr key={n.id} className="hover:bg-[#FAFAFA]">
                  <td className="px-5 py-4 font-medium text-[#212121] max-w-xs truncate">{n.titulo}</td>
                  <td className="px-5 py-4 text-[#616161] hidden sm:table-cell">{n.categoria}</td>
                  <td className="px-5 py-4 text-[#9E9E9E] hidden md:table-cell">
                    {new Date(n.fecha + 'T00:00:00').toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => togglePublicada(n.id, n.publicada)} className={`text-xs font-semibold px-3 py-1 rounded-full ${n.publicada ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {n.publicada ? 'Publicada' : 'Borrador'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => abrirSelectorImagen(n.id)}
                        disabled={subiendoId === n.id}
                        className="p-1.5 rounded-lg hover:bg-[#E3F2FD] text-[#1E88E5] disabled:opacity-50"
                        title={n.imagen_url ? 'Cambiar foto' : 'Subir foto'}
                      >
                        <ImagePlus size={16} />
                      </button>
                      <button onClick={() => togglePublicada(n.id, n.publicada)} className="p-1.5 rounded-lg hover:bg-[#E3F2FD] text-[#1E88E5]" title={n.publicada ? 'Despublicar' : 'Publicar'}>
                        {n.publicada ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => eliminar(n.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
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
