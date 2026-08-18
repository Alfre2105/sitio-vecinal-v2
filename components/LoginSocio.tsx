'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { cuotaVencida } from '@/lib/cuotas'
import CarnetSocio from '@/components/CarnetSocio'
import { LogIn, CheckCircle, XCircle, Clock, Landmark, User, Phone, MapPin, IdCard, ArrowLeft } from 'lucide-react'

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
  const [deudaTotal, setDeudaTotal] = useState(0)
  const [anio, setAnio] = useState(new Date().getFullYear())
  const [mostrarCarnet, setMostrarCarnet] = useState(false)

  async function cargarCuotas(socioId: string, anioConsulta: number) {
    const { data: cuotasData } = await supabase
      .from('cuotas')
      .select('*')
      .eq('socio_id', socioId)
      .eq('anio', anioConsulta)
      .order('mes', { ascending: true })

    setCuotas((cuotasData as CuotaData[]) ?? [])
  }

  useEffect(() => {
    if (socio) cargarCuotas(socio.id, anio)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anio])

  async function handleBuscar(e: React.FormEvent) {
    e.preventDefault()
    setBuscando(true)
    setError('')
    setSocio(null)
    setMostrarCarnet(false)

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
    setAnio(anioActual)

    // Deuda total: suma todos los años, no solo el actual, porque hay
    // socios que arrastran meses o años anteriores sin pagar. Solo cuenta
    // cuotas ya vencidas -- una cuota de un mes futuro (cargada por
    // adelantado) todavia no es deuda.
    const { data: todasCuotas } = await supabase
      .from('cuotas')
      .select('pagada, monto, mes, anio')
      .eq('socio_id', socioData.id)
    const total = ((todasCuotas as { pagada: boolean; monto: number; mes: number; anio: number }[]) ?? [])
      .filter(c => !c.pagada && cuotaVencida(c.mes, c.anio))
      .reduce((acc, c) => acc + Number(c.monto), 0)
    setDeudaTotal(total)

    await cargarCuotas(socioData.id, anioActual)
    setBuscando(false)
  }

  if (socio && mostrarCarnet) {
    const origen = typeof window !== 'undefined' ? window.location.origin : ''
    return (
      <div className="space-y-5">
        <CarnetSocio
          nombre={socio.nombre}
          apellido={socio.apellido}
          numeroSocio={socio.numero_socio}
          dni={socio.dni}
          activo={socio.activo}
          alDia={deudaTotal === 0}
          qrUrl={`${origen}/carnet/${encodeURIComponent(socio.numero_socio)}`}
        />
        <p className="text-xs text-[#9E9E9E] text-center">
          Mostrale este carnet al comercio para validar tus beneficios de socio.
        </p>
        <button
          onClick={() => setMostrarCarnet(false)}
          className="w-full flex items-center justify-center gap-2 text-sm text-[#1E88E5] font-semibold py-2"
        >
          <ArrowLeft size={16} />
          Volver a mis datos
        </button>
      </div>
    )
  }

  if (socio) {
    const pagadas = cuotas.filter(c => c.pagada).length
    const pendientes = cuotas.filter(c => !c.pagada && cuotaVencida(c.mes, c.anio)).length
    const deuda = cuotas.filter(c => !c.pagada && cuotaVencida(c.mes, c.anio)).reduce((acc, c) => acc + Number(c.monto), 0)

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
          <button
            onClick={() => setMostrarCarnet(true)}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 transition-colors text-white font-semibold text-sm py-2.5 rounded-xl"
          >
            <IdCard size={18} />
            Ver carnet digital
          </button>
        </div>

        {deudaTotal > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
            <p className="text-red-700 font-bold">Deuda total acumulada: ${deudaTotal.toLocaleString('es-AR')}</p>
            <p className="text-red-600 text-xs mt-1">Suma de todas las cuotas pendientes, de todos los años.</p>
          </div>
        )}

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
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => setAnio(a => a - 1)} className="px-2.5 py-1 border border-[#E0E0E0] rounded-lg text-sm hover:bg-gray-50">←</button>
              <h3 className="font-bold text-[#212121]">Cuotas {anio}</h3>
              <button onClick={() => setAnio(a => a + 1)} className="px-2.5 py-1 border border-[#E0E0E0] rounded-lg text-sm hover:bg-gray-50">→</button>
            </div>
            <div className="flex gap-3 text-xs items-center">
              <span className="text-green-600 font-medium">{pagadas} pagadas</span>
              <span className="text-red-500 font-medium">{pendientes} pendientes</span>
            </div>
          </div>

          {deuda > 0 && (
            <p className="text-red-600 font-bold text-sm mb-3">Deuda de {anio}: ${deuda.toLocaleString('es-AR')}</p>
          )}

          {cuotas.length === 0 ? (
            <p className="text-[#9E9E9E] text-sm text-center py-4">No hay cuotas registradas para este año.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {cuotas.map((c) => {
                const vencida = cuotaVencida(c.mes, c.anio)
                const estilo = c.pagada
                  ? 'bg-green-50 border border-green-200'
                  : vencida
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50 border border-gray-200'
                return (
                  <div key={c.id} className={`rounded-xl p-3 text-center ${estilo}`}>
                    <div className="text-xs font-semibold text-[#212121]">{MESES[c.mes - 1]}</div>
                    <div className="mt-1">
                      {c.pagada
                        ? <CheckCircle size={16} className="text-green-500 mx-auto" />
                        : vencida
                          ? <XCircle size={16} className="text-red-400 mx-auto" />
                          : <Clock size={16} className="text-gray-400 mx-auto" />
                      }
                    </div>
                    {c.monto && <div className="text-xs text-[#9E9E9E] mt-1">${c.monto}</div>}
                    {!c.pagada && !vencida && <div className="text-[10px] text-gray-400 mt-0.5">Aún no vence</div>}
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-5 bg-[#F4F6F9] rounded-xl p-4 text-center">
            <Landmark size={24} className="text-[#9E9E9E] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#616161] mb-2">Pago de cuotas</p>
            <p className="text-sm text-[#616161]">Podés transferir desde tu banco a</p>
            <p className="text-sm font-medium text-[#424242] bg-[#E8EAED] inline-block px-2.5 py-1 rounded-md my-2">VECINAL.MOSCONI</p>
            <p className="text-xs text-[#9E9E9E] mb-2">(nuestro alias)</p>
            <p className="text-sm text-[#616161]">
              y compartir el comprobante por WhatsApp al{' '}
              <span className="font-medium text-[#424242]">297 502-9223</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => { setSocio(null); setLogin(''); setMostrarCarnet(false) }}
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
