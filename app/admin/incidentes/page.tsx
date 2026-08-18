'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, ShieldAlert, MapPin, Trash2 } from 'lucide-react'

type Incidente = {
  id: string
  tipo: string
  ubicacion: string
  fecha: string
  descripcion: string
  nombre: string | null
  contacto: string | null
  revisado: boolean
  created_at: string
}

const TIPO_LABELS: Record<string, string> = {
  robo: 'Robo',
  intento_robo: 'Intento de robo',
  sospechoso: 'Persona/vehículo sospechoso',
  vandalismo: 'Vandalismo',
  disturbios: 'Disturbios / ruidos',
  otro: 'Otro',
}

const TIPO_COLORS: Record<string, string> = {
  robo: 'bg-red-100 text-red-700',
  intento_robo: 'bg-red-100 text-red-700',
  sospechoso: 'bg-orange-100 text-orange-700',
  vandalismo: 'bg-orange-100 text-orange-700',
  disturbios: 'bg-amber-100 text-amber-700',
  otro: 'bg-gray-100 text-gray-700',
}

export default function AdminIncidentesPage() {
  const [incidentes, setIncidentes] = useState<Incidente[]>([])
  const [cargando, setCargando] = useState(true)
  const [soloPendientes, setSoloPendientes] = useState(false)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    const { data } = await supabase
      .from('incidentes')
      .select('*')
      .order('created_at', { ascending: false })
    setIncidentes((data as Incidente[]) ?? [])
    setCargando(false)
  }

  async function marcarRevisado(id: string) {
    await supabase.from('incidentes').update({ revisado: true }).eq('id', id)
    setIncidentes(prev => prev.map(i => i.id === id ? { ...i, revisado: true } : i))
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este reporte? No se puede deshacer.')) return
    await supabase.from('incidentes').delete().eq('id', id)
    setIncidentes(prev => prev.filter(i => i.id !== id))
  }

  const filtrados = soloPendientes ? incidentes.filter(i => !i.revisado) : incidentes

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">
            Reportes de incidentes
            {incidentes.filter(i => !i.revisado).length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {incidentes.filter(i => !i.revisado).length} sin revisar
              </span>
            )}
          </h1>
          <p className="text-sm text-[#9E9E9E] mt-0.5">Reportes enviados desde la página de Seguridad</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#616161] cursor-pointer">
          <input
            type="checkbox"
            checked={soloPendientes}
            onChange={e => setSoloPendientes(e.target.checked)}
            className="rounded"
          />
          Solo sin revisar
        </label>
      </div>

      <div className="space-y-3">
        {cargando ? (
          <div className="bg-white rounded-2xl p-8 text-center text-[#9E9E9E]">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-[#9E9E9E]">
            <ShieldAlert size={40} className="mx-auto mb-3 opacity-30" />
            No hay reportes de incidentes.
          </div>
        ) : (
          filtrados.map(i => (
            <div key={i.id} className={`bg-white rounded-2xl shadow-sm p-5 ${!i.revisado ? 'border-l-4 border-red-400' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {!i.revisado && (
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    )}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIPO_COLORS[i.tipo] ?? 'bg-gray-100 text-gray-700'}`}>
                      {TIPO_LABELS[i.tipo] ?? i.tipo}
                    </span>
                    <span className="text-[#9E9E9E] text-xs flex items-center gap-1">
                      <MapPin size={12} />
                      {i.ubicacion}
                    </span>
                    <span className="text-[#9E9E9E] text-xs">
                      {new Date(i.fecha + 'T00:00:00').toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  <p className="text-[#616161] text-sm leading-relaxed">{i.descripcion}</p>
                  {(i.nombre || i.contacto) && (
                    <div className="text-xs text-[#9E9E9E] mt-2">
                      {i.nombre && <span className="font-medium text-[#616161]">{i.nombre}</span>}
                      {i.nombre && i.contacto && ' · '}
                      {i.contacto}
                    </div>
                  )}
                  {!i.nombre && !i.contacto && (
                    <div className="text-xs text-[#9E9E9E] mt-2 italic">Reporte anónimo</div>
                  )}
                  <div className="text-[10px] text-[#BDBDBD] mt-1">
                    Reportado el {new Date(i.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-stretch gap-2">
                  {!i.revisado && (
                    <button
                      onClick={() => marcarRevisado(i.id)}
                      className="text-xs text-[#43A047] hover:bg-green-50 font-semibold px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors border border-green-200"
                    >
                      <CheckCircle size={14} />
                      Marcar revisado
                    </button>
                  )}
                  <button
                    onClick={() => eliminar(i.id)}
                    className="text-xs text-red-500 hover:bg-red-50 font-semibold px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors border border-red-200"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
