'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Store, CheckCircle2 } from 'lucide-react'

export default function FormularioComercio() {
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEnviando(true)
    setError(false)
    const form = e.currentTarget
    const data = new FormData(form)

    const { error } = await supabase.from('comercios').insert({
      nombre: data.get('nombre') as string,
      rubro: data.get('rubro') as string,
      contacto_nombre: data.get('contacto_nombre') as string,
      telefono: data.get('telefono') as string,
      descripcion: (data.get('comentario') as string) || null,
      origen: 'comercio',
      estado: 'pendiente',
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
        <h2 className="text-xl font-bold text-[#212121] mb-2">¡Recibimos tu solicitud!</h2>
        <p className="text-[#616161] max-w-md mx-auto">
          La Comisión Directiva se va a contactar para coordinar la publicación y los beneficios para los socios.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#E8F5E9] to-[#E3F2FD] rounded-2xl p-8">
      <div className="text-center mb-6">
        <Store size={40} className="text-[#43A047] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#212121] mb-2">¿Tenés un comercio en el barrio?</h2>
        <p className="text-[#616161] max-w-md mx-auto">
          Anotate para aparecer en esta sección. Te contactamos para coordinar la publicación y, si querés, un beneficio para los socios de la Vecinal.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
        <input name="nombre" required placeholder="Nombre del comercio *" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#43A047]" />
        <input name="rubro" required placeholder="Rubro (ej: Almacén, Peluquería) *" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#43A047]" />
        <input name="contacto_nombre" required placeholder="Tu nombre *" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#43A047]" />
        <input name="telefono" required placeholder="Teléfono de contacto *" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#43A047]" />
        <textarea name="comentario" rows={3} placeholder="Contanos algo más (opcional)" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#43A047] resize-none" />
        {error && <p className="text-red-600 text-sm text-center">Hubo un problema al enviar tu solicitud. Probá de nuevo.</p>}
        <button type="submit" disabled={enviando} className="w-full bg-[#43A047] text-white font-bold py-3 rounded-xl hover:bg-[#388E3C] transition-colors disabled:opacity-60">
          {enviando ? 'Enviando...' : 'Anotar mi comercio'}
        </button>
      </form>
    </div>
  )
}
