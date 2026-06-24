'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LogIn, CheckCircle, XCircle, CreditCard, User, Phone, MapPin } from 'lucide-react'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

type SocioData = {
  id: string
  dni: string
  numero_socio: string
  nombre: string
  apellido: string
  email: string | null
  telefono: string | null
  direccion: string | null
  fecha_ingreso: string
  categoria: string
  activo: boolean
}

type CuotaData = {
  id: string
  mes: number
  anio: number
  monto: number
  pagada: boolean
  fecha_pago: string | null
}

export default function LoginSocio() {
  const [login, setLogin] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState('')
  const [socio, setSocio] = useState<SocioData | null>(null)
  const [cuotas, setCuotas] = useState<CuotaData[]>([])

  async function handleBuscar(e: React.FormEvent) {
    e.preventDefault()
    setBuscando(true)
    setError('')
    setSocio(null)

    const { data, error: err } = await supabase
      .from('socios')
      .select('*')
      .or(`dni.eq.${login},numero_socio.eq.${login}`)
      .eq('activo', true)
      .single()

    if (err || !data) {
      setError('No se encontró ningún socio activo con ese DNI o número de socio.')
      setBuscando(false)
      return
    }

    const socioData = data as SocioData
    setSocio(socioData)

    const anioActual = new Date().getFullYear()
    const { data: cuotasData } = await supabase
      .from('cuotas')
      .select('*')
      .eq('socio_id', socioData.id)
      .eq('anio', anioActual)
      .order('mes', { ascending: true })

    setCuotas((cuotasData as CuotaData[]) ?? [])
    setBuscando(false)
  }

  if (socio) {
    const pagadas = cuotas.filter(c => c.pagada).length
    const pendientes = cuotas.filter(c => !c.pagada).length

    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-[#1E88E5] to-[#1565C0] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl">{socio.nombre} {socio.apellido}</h2>
              <p className="opacity-80 text-sm">Socio N° {socio.numero_socio} · {socio.categoria}</p>
              <p className="opacity-70 text-xs">
                Ingresó: {new Date(socio.fecha_ingreso + 'T00:00:00').toLocaleDateString('es-AR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-[#212121] mb-4">Datos personales</h3>
          <div className="space-y-2 text-sm text-[#616161]">
            {socio.email && (
              <div className="flex items-center gap-2">
                <User size={14} className="text-[#1E88E5]" />
                <span>{socio.email}</span>
              </div>
            )}
            {socio.telefono && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#1E88E5]" />
                <span>{socio.telefono}</span>
              </div>
            )}
            {socio.direccion && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#1E88E5]" />
                <span>{socio.direccion}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#212121]">Cuotas {new Date().getFullYear()}</h3>
            <div className="flex gap-3 text-xs">
              <span className="text-green-600 font-medium">{pagadas} pagadas</span>
              <span className="text-red-500 font-medium">{pendientes} pendientes</span>
            </div>
          </div>

          {cuotas.length === 0 ? (
            <p className="text-[#9E9E9E] text-sm text-center py-4">No hay cuotas registradas para este año.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {cuotas.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-xl p-3 text-center ${c.pagada ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                >
                  <div className="text-xs font-semibold text-[#212121]">{MESES[c.mes - 1]}</div>
                  <div className="mt-1">
                    {c.pagada
                      ? <CheckCircle size={16} className="text-green-500 mx-auto" />
                      : <XCircle size={16} className="text-red-400 mx-auto" />
                    }
                  </div>
                  {c.monto && <div className="text-xs text-[#9E9E9E] mt-1">${c.monto}</div>}
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 bg-[#F4F6F9] rounded-xl p-4 text-center">
            <CreditCard size={24} className="text-[#9E9E9E] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#616161]">Pago online de cuotas</p>
            <p className="text-xs text-[#9E9E9E] mt-1">Próximamente — integración con MercadoPago</p>
          </div>
        </div>

        <button
          onClick={() => { setSocio(null); setLogin('') }}
          className="w-full text-sm text-[#616161] underline"
        >
          Cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleBuscar} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#212121] mb-2">
          DNI o número de socio
        </label>
        <input
          type="text"
          value={login}
          onChange={e => setLogin(e.target.value)}
          required
          className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5]"
          placeholder="Ej: 28345678 o S-0042"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={buscando}
        className="w-full bg-[#1E88E5] hover:bg-[#1565C0] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <LogIn size={18} />
        {buscando ? 'Buscando...' : 'Ver mis datos'}
      </button>

      <p className="text-xs text-[#9E9E9E] text-center">
        Ingresá tu DNI o número de socio. En el futuro se implementará autenticación completa.
      </p>
    </form>
  )
}
