'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

type Reserva = {
  id: string
  nombre: string
  telefono: string
  email: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  motivo: string
  cantidad_personas: number
  estado: 'pendiente' | 'confirmada' | 'cancelada'
  created_at: string
}

const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente', cls: 'bg-orange-100 text-orange-700', icono: Clock },
  confirmada: { label: 'Confirmada', cls: 'bg-green-100 text-green-700', icono: CheckCircle },
  cancelada: { label: 'Cancelada', cls: 'bg-red-100 text-red-600', icono: XCircle },
}

export default function AdminReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState<'todas' | 'pendiente' | 'confirmada' | 'cancelada'>('todas')

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    const { data } = await supabase
      .from('reservas_salon')
      .select('*')
      .order('fecha', { ascending: false })
    setReservas((data as Reserva[]) ?? [])
    setCargando(false)
  }

  async function cambiarEstado(id: string, estado: Reserva['estado']) {
    await supabase.from('reservas_salon').update({ estado }).eq('id', id)
    setReservas(prev => prev.map(r => r.id === id ? { ...r, estado } : r))
  }

  const filtradas = filtro === 'todas' ? reservas : reservas.filter(r => r.estado === filtro)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#212121]">Reservas del Salón</h1>
        <div className="flex gap-2">
          {(['todas','pendiente','confirmada','cancelada'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-colors ${filtro === f ? 'bg-[#1E88E5] text-white' : 'bg-white text-[#616161] hover:bg-[#E3F2FD]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {cargando ? (
          <div className="bg-white rounded-2xl p-8 text-center text-[#9E9E9E]">Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-[#9E9E9E]">No hay reservas.</div>
        ) : (
          filtradas.map(r => {
            const cfg = ESTADO_CONFIG[r.estado]
            const Icono = cfg.icono
            return (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${cfg.cls}`}>
                        <Icono size={12} />
                        {cfg.label}
                      </span>
                      <span className="text-[#9E9E9E] text-xs">
                        Solicitado {new Date(r.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#212121]">{r.nombre}</h3>
                    <p className="text-sm text-[#616161]">
                      {new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}{r.hora_inicio?.slice(0,5)}–{r.hora_fin?.slice(0,5)}
                      {' · '}{r.motivo} ({r.cantidad_personas} personas)
                    </p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-[#9E9E9E]">
                      <a href={`tel:${r.telefono}`} className="hover:text-[#1E88E5]">{r.telefono}</a>
                      <a href={`mailto:${r.email}`} className="hover:text-[#1E88E5]">{r.email}</a>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {r.estado !== 'confirmada' && (
                      <button
                        onClick={() => cambiarEstado(r.id, 'confirmada')}
                        className="text-xs bg-green-100 text-green-700 hover:bg-green-200 font-semibold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle size={14} />
                        Confirmar
                      </button>
                    )}
                    {r.estado !== 'cancelada' && (
                      <button
                        onClick={() => cambiarEstado(r.id, 'cancelada')}
                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 font-semibold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <XCircle size={14} />
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
