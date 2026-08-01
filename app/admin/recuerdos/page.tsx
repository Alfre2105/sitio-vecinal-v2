'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { subirImagen } from '@/lib/subirImagen'
import { Plus, Trash2 } from 'lucide-react'
import CampoArchivo from '@/components/CampoArchivo'

type Recuerdo = {
  id: string
  foto_url: string
  descripcion: string | null
  activo: boolean
  created_at: string
}

export default function AdminRecuerdosPage() {
  const [recuerdos, setRecuerdos] = useState<Recuerdo[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const { data } = await supabase.from('recuerdos').select('*').order('created_at', { ascending: false })
    setRecuerdos((data as Recuerdo[]) ?? [])
    setCargando(false)
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este recuerdo?')) return
    await supabase.from('recuerdos').delete().eq('id', id)
    setRecuerdos(prev => prev.filter(r => r.id !== id))
  }

  async function toggleActivo(r: Recuerdo) {
    await supabase.from('recuerdos').update({ activo: !r.activo }).eq('id', r.id)
    setRecuerdos(prev => prev.map(x => x.id === r.id ? { ...x, activo: !x.activo } : x))
  }

  async function handleGuardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    const form = e.currentTarget
    const data = new FormData(form)

    const archivo = data.get('foto') as File
    if (!archivo || archivo.size === 0) {
      setErrorForm('Elegí una foto.')
      setGuardando(false)
      return
    }

    const foto_url = await subirImagen(archivo, 'recuerdos')
    if (!foto_url) {
      setErrorForm('Hubo un problema al subir la foto. Probá de nuevo.')
      setGuardando(false)
      return
    }

    await supabase.from('recuerdos').insert({
      foto_url,
      descripcion: (data.get('descripcion') as string) || null,
    })

    form.reset()
    setMostrarForm(false)
    setGuardando(false)
    cargar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Recuerdos del barrio</h1>
          <p className="text-sm text-[#9E9E9E] mt-0.5">Fotos que mandan los vecinos, visibles en Historia</p>
        </div>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="bg-[#1E88E5] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#1565C0] text-sm">
          <Plus size={18} /> Nuevo recuerdo
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleGuardar} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-[#212121]">Nuevo recuerdo</h2>
          <CampoArchivo name="foto" etiqueta="Foto" requerido />
          <textarea name="descripcion" rows={2} placeholder="Descripción breve (opcional)" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm resize-none" />
          {errorForm && <p className="text-red-600 text-sm">{errorForm}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={guardando} className="bg-[#1E88E5] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#1565C0] disabled:opacity-60">
              {guardando ? 'Subiendo...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} className="border border-[#E0E0E0] text-[#616161] px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {cargando ? (
        <div className="p-8 text-center text-[#9E9E9E]">Cargando...</div>
      ) : recuerdos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-[#9E9E9E]">No hay recuerdos cargados.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recuerdos.map(r => (
            <div key={r.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden ${!r.activo ? 'opacity-50' : ''}`}>
              <div className="h-40 bg-gray-100">
                <img src={r.foto_url} alt={r.descripcion ?? 'Recuerdo del barrio'} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <p className="text-sm text-[#616161] mb-3 line-clamp-2">{r.descripcion || 'Sin descripción'}</p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleActivo(r)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${r.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {r.activo ? 'Activo' : 'Inactivo'}
                  </button>
                  <button onClick={() => eliminar(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Eliminar recuerdo"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
