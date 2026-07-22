'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Lightbulb, CheckCircle2 } from 'lucide-react'

export default function FormularioPropuestaActividad() {
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEnviando(true)
    setError(false)
    const form = e.currentTarget
    const data = new FormData(form)

    const { error } = await supabase.from('actividades').insert({
      titulo: data.get('titulo') as string,
      descripcion: data.get('descripcion') as string,
      fecha: (data.get('fecha') as string) || null,
      nombre_propone: data.get('nombre_propone') as string,
      contacto_propone: data.get('contacto_propone') as string,
      origen: 'vecino',
      estado: 'pendiente',
      es_gratuita: true,
    })

    if (error) {
      setError(true)
      setEnviando(false)
      return
    }

    form.reset()
    setEnviando(false)
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="bg-gradient-to-br from-[#E8F5E9] to-[#E3F2FD] rounded-2xl p-8 text-center">
        <CheckCircle2 size={40} className="text-[#43A047] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#212121] mb-2">¡Recibimos tu propuesta!</h2>
        <p className="text-[#616161] max-w-md mx-auto">
          El equipo de la Vecinal la va a evaluar y te va a contactar si es viable.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#E8F5E9] to-[#E3F2FD] rounded-2xl p-8">
      <div className="text-center mb-6">
        <Lightbulb size={40} className="text-[#43A047] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#212121] mb-2">¿Tenés una idea para el barrio?</h2>
        <p className="text-[#616161] max-w-md mx-auto">
          Proponé una nueva actividad, taller o evento. El equipo de la Vecinal la evalúa y te contacta si es realizable.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
        <input name="titulo" required placeholder="¿Qué actividad proponés? *" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#43A047]" />
        <textarea name="descripcion" required rows={3} placeholder="Contanos un poco más de la idea *" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#43A047] resize-none" />
        <div>
          <label className="text-xs font-medium text-[#616161] block mb-1">Fecha tentativa (opcional)</label>
          <input name="fecha" type="date" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#43A047]" />
        </div>
        <input name="nombre_propone" required placeholder="Tu nombre *" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#43A047]" />
        <input name="contacto_propone" required placeholder="Tu teléfono o email *" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#43A047]" />
        {error && <p className="text-red-600 text-sm text-center">Hubo un problema al enviar tu propuesta. Probá de nuevo.</p>}
        <button type="submit" disabled={enviando} className="w-full bg-[#43A047] text-white font-bold py-3 rounded-xl hover:bg-[#388E3C] transition-colors disabled:opacity-60">
          {enviando ? 'Enviando...' : 'Enviar propuesta'}
        </button>
      </form>
    </div>
  )
}
