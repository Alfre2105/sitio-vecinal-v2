'use client'

import { useState } from 'react'
import { CheckCircle, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Props {
  fecha: string
  onExito: () => void
}

export default function FormularioReserva({ fecha, onExito }: Props) {
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    const horaInicio = data.get('hora_inicio') as string
    const horaFin = data.get('hora_fin') as string

    if (horaInicio >= horaFin) {
      setError('La hora de fin debe ser posterior a la hora de inicio.')
      setCargando(false)
      return
    }

    const { error: err } = await supabase.from('reservas_salon').insert({
      nombre: data.get('nombre') as string,
      telefono: data.get('telefono') as string,
      email: data.get('email') as string,
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      motivo: data.get('motivo') as string,
      cantidad_personas: parseInt(data.get('cantidad_personas') as string),
      estado: 'pendiente',
    })

    setCargando(false)

    if (err) {
      setError('No se pudo enviar la solicitud. Por favor intentá de nuevo.')
      return
    }

    setEnviado(true)
    setTimeout(() => {
      setEnviado(false)
      onExito()
    }, 3000)
  }

  if (enviado) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
        <h3 className="font-bold text-green-800 text-lg mb-1">¡Solicitud enviada!</h3>
        <p className="text-green-700 text-sm">
          Recibirás una confirmación de la Vecinal a la brevedad. Estado inicial: <strong>pendiente</strong>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4 border border-[#E3F2FD]">
      <h3 className="font-bold text-[#212121] text-base">Datos de la reserva</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-1">Nombre y apellido *</label>
          <input name="nombre" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5]" placeholder="Tu nombre completo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-1">Teléfono *</label>
          <input name="telefono" type="tel" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5]" placeholder="+54 297 ..." />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#212121] mb-1">Email *</label>
        <input name="email" type="email" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5]" placeholder="tu@email.com" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-1">Hora de inicio *</label>
          <input name="hora_inicio" type="time" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-1">Hora de fin *</label>
          <input name="hora_fin" type="time" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5]" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-1">Motivo del evento *</label>
          <input name="motivo" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5]" placeholder="Ej: Cumpleaños, reunión..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-1">Cantidad de personas *</label>
          <input name="cantidad_personas" type="number" min="1" max="100" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5]" placeholder="Ej: 50" />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={cargando}
        className="w-full bg-[#1E88E5] hover:bg-[#1565C0] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Send size={18} />
        {cargando ? 'Enviando...' : 'Solicitar reserva'}
      </button>

      <p className="text-xs text-[#9E9E9E] text-center">
        La reserva queda <strong>pendiente</strong> hasta que la Vecinal la confirme. Te avisaremos por email.
      </p>
    </form>
  )
}
