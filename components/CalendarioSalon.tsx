'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import FormularioReserva from './FormularioReserva'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function CalendarioSalon() {
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth())
  const [fechasOcupadas, setFechasOcupadas] = useState<Set<string>>(new Set())
  const [cargando, setCargando] = useState(true)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null)

  useEffect(() => {
    cargarReservas()
  }, [mes, anio])

  async function cargarReservas() {
    setCargando(true)
    const ultimoDia = new Date(anio, mes + 1, 0).getDate()
    const inicio = `${anio}-${String(mes + 1).padStart(2, '0')}-01`
    const fin = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`

    const { data } = await supabase
      .from('reservas_salon')
      .select('fecha')
      .gte('fecha', inicio)
      .lte('fecha', fin)
      .neq('estado', 'cancelada')

    const fechas = new Set((data ?? []).map(r => r.fecha as string))
    setFechasOcupadas(fechas)
    setCargando(false)
  }

  function mesAnterior() {
    if (mes === 0) { setMes(11); setAnio(a => a - 1) }
    else setMes(m => m - 1)
  }

  function mesSiguiente() {
    if (mes === 11) { setMes(0); setAnio(a => a + 1) }
    else setMes(m => m + 1)
  }

  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const celdas = Array.from({ length: primerDia + diasEnMes }, (_, i) => {
    if (i < primerDia) return null
    return i - primerDia + 1
  })

  function formatearFecha(dia: number) {
    return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  }

  function esPasado(dia: number) {
    const fecha = new Date(anio, mes, dia)
    const hoyNormalizado = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    return fecha < hoyNormalizado
  }

  return (
    <div>
      {/* Navegación del mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={mesAnterior}
          className="p-2 rounded-lg hover:bg-[#E3F2FD] transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={20} className="text-[#1E88E5]" />
        </button>
        <span className="font-bold text-[#212121] text-lg">
          {MESES[mes]} {anio}
        </span>
        <button
          onClick={mesSiguiente}
          className="p-2 rounded-lg hover:bg-[#E3F2FD] transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={20} className="text-[#1E88E5]" />
        </button>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 mb-4 text-xs text-[#616161]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
          Ocupado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-200 inline-block" />
          Pasado
        </span>
      </div>

      {/* Grilla */}
      {cargando ? (
        <div className="text-center py-8 text-[#9E9E9E]">Cargando disponibilidad...</div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {DIAS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-[#9E9E9E] py-2">{d}</div>
          ))}
          {celdas.map((dia, i) => {
            if (dia === null) return <div key={`empty-${i}`} />

            const fecha = formatearFecha(dia)
            const ocupado = fechasOcupadas.has(fecha)
            const pasado = esPasado(dia)
            const esHoy = fecha === hoy.toISOString().split('T')[0]
            const seleccionado = fechaSeleccionada === fecha

            let cls = 'w-full aspect-square rounded-lg text-sm font-medium flex items-center justify-center transition-all cursor-pointer '

            if (pasado) {
              cls += 'bg-gray-100 text-gray-300 cursor-not-allowed'
            } else if (ocupado) {
              cls += 'bg-red-100 text-red-500 cursor-not-allowed'
            } else if (seleccionado) {
              cls += 'bg-[#1E88E5] text-white shadow-md scale-105'
            } else if (esHoy) {
              cls += 'bg-[#E3F2FD] text-[#1E88E5] font-bold ring-2 ring-[#1E88E5]'
            } else {
              cls += 'bg-green-50 text-green-700 hover:bg-green-100 hover:scale-105'
            }

            return (
              <button
                key={fecha}
                className={cls}
                disabled={pasado || ocupado}
                onClick={() => setFechaSeleccionada(seleccionado ? null : fecha)}
                aria-label={`${dia} de ${MESES[mes]}`}
              >
                {dia}
              </button>
            )
          })}
        </div>
      )}

      {/* Formulario de reserva */}
      {fechaSeleccionada && (
        <div className="mt-6">
          <div className="bg-[#E3F2FD] rounded-xl px-4 py-3 mb-4 text-[#1565C0] font-medium text-sm">
            Reservando para el {new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <FormularioReserva
            fecha={fechaSeleccionada}
            onExito={() => {
              setFechaSeleccionada(null)
              cargarReservas()
            }}
          />
        </div>
      )}
    </div>
  )
}
