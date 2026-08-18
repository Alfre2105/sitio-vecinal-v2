'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { cuotaVencida } from '@/lib/cuotas'
import { X, CheckCircle, XCircle, Clock, Wallet } from 'lucide-react'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

type Cuota = {
  id: string
  mes: number
  anio: number
  monto: number
  pagada: boolean
  fecha_pago: string | null
}

type Props = {
  socioId: string
  socioNombre: string
  onClose: () => void
  onCambio?: () => void
}

export default function GestionCuotasModal({ socioId, socioNombre, onClose, onCambio }: Props) {
  const [anio, setAnio] = useState(new Date().getFullYear())
  const [cuotas, setCuotas] = useState<Cuota[]>([])
  const [deudaTotal, setDeudaTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [montoDefault, setMontoDefault] = useState('5000')

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anio])

  async function cargar() {
    setCargando(true)
    const [{ data }, { data: todasData }] = await Promise.all([
      supabase.from('cuotas').select('*').eq('socio_id', socioId).eq('anio', anio).order('mes', { ascending: true }),
      supabase.from('cuotas').select('pagada, monto, mes, anio').eq('socio_id', socioId),
    ])
    setCuotas((data as Cuota[]) ?? [])
    // Solo cuenta cuotas ya vencidas -- un mes futuro cargado por
    // adelantado (ej. generar los 12 meses del año) todavia no es deuda.
    const total = ((todasData as { pagada: boolean; monto: number; mes: number; anio: number }[]) ?? [])
      .filter(c => !c.pagada && cuotaVencida(c.mes, c.anio))
      .reduce((acc, c) => acc + Number(c.monto), 0)
    setDeudaTotal(total)
    setCargando(false)
    onCambio?.()
  }

  async function generarAnio() {
    const monto = parseFloat(montoDefault) || 0
    const existentes = new Set(cuotas.map(c => c.mes))
    const faltantes = []
    for (let mes = 1; mes <= 12; mes++) {
      if (!existentes.has(mes)) faltantes.push({ socio_id: socioId, mes, anio, monto, pagada: false })
    }
    if (faltantes.length === 0) return
    await supabase.from('cuotas').insert(faltantes)
    cargar()
  }

  async function crearMes(mes: number) {
    await supabase.from('cuotas').insert({
      socio_id: socioId, mes, anio, monto: parseFloat(montoDefault) || 0, pagada: false,
    })
    cargar()
  }

  async function toggleaPagada(cuota: Cuota) {
    const nuevaPagada = !cuota.pagada
    await supabase.from('cuotas').update({
      pagada: nuevaPagada,
      fecha_pago: nuevaPagada ? new Date().toISOString().split('T')[0] : null,
    }).eq('id', cuota.id)
    cargar()
  }

  async function actualizarMonto(cuota: Cuota, monto: number) {
    if (isNaN(monto) || monto === Number(cuota.monto)) return
    await supabase.from('cuotas').update({ monto }).eq('id', cuota.id)
    cargar()
  }

  const porMes = new Map(cuotas.map(c => [c.mes, c]))
  const pagadas = cuotas.filter(c => c.pagada).length
  const deuda = cuotas.filter(c => !c.pagada && cuotaVencida(c.mes, c.anio)).reduce((acc, c) => acc + Number(c.monto), 0)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-[#212121] flex items-center gap-2">
            <Wallet size={20} className="text-[#1E88E5]" /> Cuotas de {socioNombre}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>

        {deudaTotal > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-red-700 font-semibold">
            Deuda total acumulada (todos los años): ${deudaTotal.toLocaleString('es-AR')}
          </div>
        )}

        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => setAnio(a => a - 1)} className="px-3 py-1.5 border border-[#E0E0E0] rounded-lg text-sm hover:bg-gray-50">←</button>
            <span className="font-semibold text-[#212121] w-14 text-center">{anio}</span>
            <button onClick={() => setAnio(a => a + 1)} className="px-3 py-1.5 border border-[#E0E0E0] rounded-lg text-sm hover:bg-gray-50">→</button>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-600 font-medium">{pagadas} pagadas</span>
            <span className="text-red-500 font-medium">{cuotas.length - pagadas} pendientes</span>
            {deuda > 0 && <span className="text-red-600 font-bold">Debe ${deuda.toLocaleString('es-AR')} en {anio} (vencidas)</span>}
          </div>
        </div>

        {cargando ? (
          <div className="text-center py-8 text-[#9E9E9E]">Cargando...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MESES.map((nombreMes, i) => {
              const mes = i + 1
              const cuota = porMes.get(mes)
              const vencida = cuota ? cuotaVencida(cuota.mes, cuota.anio) : false
              const estilo = cuota?.pagada
                ? 'bg-green-50 border-green-200'
                : !cuota
                  ? 'bg-gray-50 border-gray-200'
                  : vencida
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
              return (
                <div key={mes} className={`rounded-xl p-3 border ${estilo}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#212121]">{nombreMes}</span>
                    {cuota ? (
                      <button onClick={() => toggleaPagada(cuota)} title={cuota.pagada ? 'Marcar como no pagada' : vencida ? 'Vencida, marcar como pagada' : 'Aún no vence, marcar como pagada'}>
                        {cuota.pagada
                          ? <CheckCircle size={18} className="text-green-500" />
                          : vencida
                            ? <XCircle size={18} className="text-red-400" />
                            : <Clock size={18} className="text-amber-400" />
                        }
                      </button>
                    ) : (
                      <button onClick={() => crearMes(mes)} className="text-xs text-[#1E88E5] font-semibold hover:underline">
                        + Cargar
                      </button>
                    )}
                  </div>
                  {cuota && (
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={cuota.monto}
                      onBlur={e => actualizarMonto(cuota, parseFloat(e.target.value))}
                      className="w-full text-xs border border-[#E0E0E0] rounded px-2 py-1 bg-white"
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3 flex-wrap">
          <label className="text-xs text-[#616161]">Monto para meses nuevos:</label>
          <input
            type="number"
            step="0.01"
            value={montoDefault}
            onChange={e => setMontoDefault(e.target.value)}
            className="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-sm w-28"
          />
          <button
            onClick={generarAnio}
            className="ml-auto bg-[#1E88E5] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1565C0]"
          >
            Generar 12 meses de {anio}
          </button>
        </div>
      </div>
    </div>
  )
}
