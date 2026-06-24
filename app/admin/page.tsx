export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Newspaper, Calendar, Users, MessageSquare, Clock, CheckCircle } from 'lucide-react'

async function getResumen() {
  const [noticias, reservasPendientes, socios, mensajesNoLeidos] = await Promise.all([
    supabase.from('noticias').select('id', { count: 'exact', head: true }),
    supabase.from('reservas_salon').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
    supabase.from('socios').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('contacto_mensajes').select('id', { count: 'exact', head: true }).eq('leido', false),
  ])

  return {
    noticias: noticias.count ?? 0,
    reservasPendientes: reservasPendientes.count ?? 0,
    socios: socios.count ?? 0,
    mensajesNoLeidos: mensajesNoLeidos.count ?? 0,
  }
}

async function getUltimasReservas() {
  const { data } = await supabase
    .from('reservas_salon')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  return data ?? []
}

export default async function AdminPage() {
  const [resumen, ultimasReservas] = await Promise.all([getResumen(), getUltimasReservas()])

  const tarjetas = [
    { label: 'Noticias publicadas', valor: resumen.noticias, icono: Newspaper, href: '/admin/noticias', color: 'bg-blue-50 text-[#1E88E5]' },
    { label: 'Reservas pendientes', valor: resumen.reservasPendientes, icono: Clock, href: '/admin/reservas', color: 'bg-orange-50 text-orange-600', alerta: resumen.reservasPendientes > 0 },
    { label: 'Socios activos', valor: resumen.socios, icono: Users, href: '/admin/socios', color: 'bg-green-50 text-[#43A047]' },
    { label: 'Mensajes no leídos', valor: resumen.mensajesNoLeidos, icono: MessageSquare, href: '/admin/mensajes', color: 'bg-purple-50 text-purple-600', alerta: resumen.mensajesNoLeidos > 0 },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#212121]">Dashboard</h1>
        <p className="text-[#616161] text-sm mt-1">Resumen del estado del sitio</p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tarjetas.map(({ label, valor, icono: Icono, href, color, alerta }) => (
          <Link key={href} href={href}>
            <div className={`bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow relative ${alerta ? 'ring-2 ring-orange-300' : ''}`}>
              {alerta && (
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              )}
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icono size={20} />
              </div>
              <div className="text-3xl font-extrabold text-[#212121]">{valor}</div>
              <div className="text-[#9E9E9E] text-sm mt-1">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Últimas reservas */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#212121]">Últimas solicitudes de reserva</h2>
          <Link href="/admin/reservas" className="text-[#1E88E5] text-sm hover:underline">Ver todas</Link>
        </div>

        {ultimasReservas.length === 0 ? (
          <p className="text-[#9E9E9E] text-sm text-center py-4">No hay reservas aún.</p>
        ) : (
          <div className="space-y-3">
            {ultimasReservas.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-[#F4F6F9] rounded-xl">
                <div>
                  <div className="font-semibold text-[#212121] text-sm">{r.nombre}</div>
                  <div className="text-xs text-[#9E9E9E]">
                    {new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-AR')} · {r.hora_inicio?.slice(0,5)}–{r.hora_fin?.slice(0,5)} · {r.motivo}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  r.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                  r.estado === 'cancelada' ? 'bg-red-100 text-red-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {r.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
