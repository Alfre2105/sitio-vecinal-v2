'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function FormularioContacto() {
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    const { error: err } = await supabase.from('contacto_mensajes').insert({
      nombre: data.get('nombre') as string,
      email: data.get('email') as string,
      categoria: data.get('categoria') as string,
      mensaje: data.get('mensaje') as string,
    })

    setCargando(false)

    if (err) {
      setError('Hubo un error al enviar el mensaje. Por favor intentá de nuevo.')
      return
    }

    setEnviado(true)
    form.reset()
  }

  if (enviado) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
        <h3 className="font-bold text-green-800 text-lg mb-1">¡Mensaje recibido!</h3>
        <p className="text-green-700 text-sm">Nos comunicaremos con vos a la brevedad.</p>
        <button
          onClick={() => setEnviado(false)}
          className="mt-4 text-sm text-[#1E88E5] underline"
        >
          Enviar otro mensaje
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-[#212121] mb-1">
            Nombre y apellido *
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5]"
            placeholder="Tu nombre completo"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#212121] mb-1">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5]"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="categoria" className="block text-sm font-medium text-[#212121] mb-1">
          Tipo de mensaje *
        </label>
        <select
          id="categoria"
          name="categoria"
          required
          className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5] bg-white"
        >
          <option value="">Seleccioná una opción</option>
          <option value="consulta">Consulta</option>
          <option value="reclamo">Reclamo</option>
          <option value="sugerencia">Sugerencia</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium text-[#212121] mb-1">
          Mensaje *
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={5}
          className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5] resize-none"
          placeholder="Escribí tu mensaje aquí..."
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={cargando}
        className="w-full bg-[#1E88E5] hover:bg-[#1565C0] disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Send size={18} />
        {cargando ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  )
}
