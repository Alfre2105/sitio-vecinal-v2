'use client'

import { useState } from 'react'
import { CheckCircle, UserPlus } from 'lucide-react'

export default function FormularioAdhesion() {
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)

    const form = e.currentTarget
    const data = new FormData(form)

    const body = {
      nombre: data.get('nombre'),
      apellido: data.get('apellido'),
      dni: data.get('dni'),
      fecha_nacimiento: data.get('fecha_nacimiento'),
      domicilio: data.get('domicilio'),
      telefono: data.get('telefono'),
      email: data.get('email'),
    }

    await fetch('/api/adhesion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setCargando(false)
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
        <h3 className="font-bold text-green-800 text-lg mb-2">¡Solicitud recibida!</h3>
        <p className="text-green-700 text-sm leading-relaxed">
          Tu solicitud de adhesión fue enviada. La comisión la revisará y te contactará a la brevedad para completar el proceso.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4 border-2 border-[#E8F5E9]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-1">Nombre *</label>
          <input name="nombre" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047]" placeholder="Tu nombre" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-1">Apellido *</label>
          <input name="apellido" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047]" placeholder="Tu apellido" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-1">DNI *</label>
          <input name="dni" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047]" placeholder="Ej: 28345678" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-1">Fecha de nacimiento *</label>
          <input name="fecha_nacimiento" type="date" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047]" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#212121] mb-1">Domicilio en el barrio *</label>
        <input name="domicilio" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047]" placeholder="Calle y número" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-1">Teléfono *</label>
          <input name="telefono" type="tel" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047]" placeholder="+54 297 ..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212121] mb-1">Email</label>
          <input name="email" type="email" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047]" placeholder="tu@email.com" />
        </div>
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="w-full bg-[#43A047] hover:bg-[#388E3C] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <UserPlus size={18} />
        {cargando ? 'Enviando...' : 'Enviar solicitud de adhesión'}
      </button>

      <p className="text-xs text-[#9E9E9E] text-center">
        Tu solicitud quedará pendiente hasta que la Comisión Directiva la apruebe.
      </p>
    </form>
  )
}
