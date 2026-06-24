'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Mail } from 'lucide-react'

type Mensaje = {
  id: string
  nombre: string
  email: string
  categoria: string
  mensaje: string
  leido: boolean
  created_at: string
}

const CAT_COLORS: Record<string, string> = {
  consulta: 'bg-blue-100 text-blue-700',
  reclamo: 'bg-red-100 text-red-700',
  sugerencia: 'bg-green-100 text-green-700',
  otro: 'bg-gray-100 text-gray-700',
}

export default function AdminMensajesPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [cargando, setCargando] = useState(true)
  const [soloNoLeidos, setSoloNoLeidos] = useState(false)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    const { data } = await supabase
      .from('contacto_mensajes')
      .select('*')
      .order('created_at', { ascending: false })
    setMensajes((data as Mensaje[]) ?? [])
    setCargando(false)
  }

  async function marcarLeido(id: string) {
    await supabase.from('contacto_mensajes').update({ leido: true }).eq('id', id)
    setMensajes(prev => prev.map(m => m.id === id ? { ...m, leido: true } : m))
  }

  const filtrados = soloNoLeidos ? mensajes.filter(m => !m.leido) : mensajes

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#212121]">
          Mensajes y consultas
          {mensajes.filter(m => !m.leido).length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {mensajes.filter(m => !m.leido).length} nuevos
            </span>
          )}
        </h1>
        <label className="flex items-center gap-2 text-sm text-[#616161] cursor-pointer">
          <input
            type="checkbox"
            checked={soloNoLeidos}
            onChange={e => setSoloNoLeidos(e.target.checked)}
            className="rounded"
          />
          Solo no leídos
        </label>
      </div>

      <div className="space-y-3">
        {cargando ? (
          <div className="bg-white rounded-2xl p-8 text-center text-[#9E9E9E]">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-[#9E9E9E]">
            <Mail size={40} className="mx-auto mb-3 opacity-30" />
            No hay mensajes.
          </div>
        ) : (
          filtrados.map(m => (
            <div key={m.id} className={`bg-white rounded-2xl shadow-sm p-5 ${!m.leido ? 'border-l-4 border-[#1E88E5]' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {!m.leido && (
                      <span className="w-2 h-2 rounded-full bg-[#1E88E5] inline-block" />
                    )}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${CAT_COLORS[m.categoria]}`}>
                      {m.categoria}
                    </span>
                    <span className="text-[#9E9E9E] text-xs">
                      {new Date(m.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="font-bold text-[#212121]">{m.nombre}</div>
                  <a href={`mailto:${m.email}`} className="text-xs text-[#1E88E5] hover:underline">{m.email}</a>
                  <p className="text-[#616161] text-sm mt-2 leading-relaxed">{m.mensaje}</p>
                </div>
                {!m.leido && (
                  <button
                    onClick={() => marcarLeido(m.id)}
                    className="shrink-0 text-xs text-[#43A047] hover:bg-green-50 font-semibold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors border border-green-200"
                  >
                    <CheckCircle size={14} />
                    Marcar leído
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
