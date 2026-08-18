'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const TIPOS = [
  { value: 'robo', label: 'Robo' },
  { value: 'intento_robo', label: 'Intento de robo' },
  { value: 'sospechoso', label: 'Persona o vehículo sospechoso' },
  { value: 'vandalismo', label: 'Vandalismo' },
  { value: 'disturbios', label: 'Disturbios / ruidos molestos' },
  { value: 'otro', label: 'Otro' },
]

export default function FormularioIncidente() {
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    const { error: err } = await supabase.from('incidentes').insert({
      tipo: data.get('tipo') as string,
      ubicacion: data.get('ubicacion') as string,
      fecha: data.get('fecha') as string,
      descripcion: data.get('descripcion') as string,
      nombre: (data.get('nombre') as string) || null,
      contacto: (data.get('contacto') as string) || null,
    })

    setCargando(false)

    if (err) {
      setError('Hubo un error al enviar el reporte. Por favor intentá de nuevo.')
      return
    }

    setEnviado(true)
    form.reset()
  }

  if (enviado) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
        <h3 className="font-bold text-green-800 text-lg mb-1">¡Reporte recibido!</h3>
        <p className="text-green-700 text-sm">La Vecinal lo va a revisar. Gracias por ayudar a cuidar el barrio.</p>
        <button
          onClick={() => setEnviado(false)}
          className="mt-4 text-sm text-[#1E88E5] underline"
        >
          Reportar otro incidente
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-[#212121] mb-1">
            Tipo de incidente *
          </label>
          <select
            id="tipo"
            name="tipo"
            required
            className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5] bg-white"
          >
            <option value="">Seleccioná una opción</option>
            {TIPOS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="fecha" className="block text-sm font-medium text-[#212121] mb-1">
            Fecha (aproximada) *
          </label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="ubicacion" className="block text-sm font-medium text-[#212121] mb-1">
          Ubicación *
        </label>
        <input
          id="ubicacion"
          name="ubicacion"
          type="text"
          required
          className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5]"
          placeholder="Calle y altura aproximada"
        />
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-[#212121] mb-1">
          Descripción *
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          required
          rows={4}
          className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5] resize-none"
          placeholder="Contanos qué pasó, con el mayor detalle posible"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-[#212121] mb-1">
            Tu nombre (opcional)
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5]"
            placeholder="Podés reportar de forma anónima"
          />
        </div>
        <div>
          <label htmlFor="contacto" className="block text-sm font-medium text-[#212121] mb-1">
            Teléfono o email (opcional)
          </label>
          <input
            id="contacto"
            name="contacto"
            type="text"
            className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5]"
            placeholder="Por si necesitamos más información"
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={cargando}
        className="w-full bg-[#1E88E5] hover:bg-[#1565C0] disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Send size={18} />
        {cargando ? 'Enviando...' : 'Enviar reporte'}
      </button>
    </form>
  )
}
