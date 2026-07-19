export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import NoticiaCard from '@/components/NoticiaCard'
import ActividadCard from '@/components/ActividadCard'
import FormularioContacto from '@/components/FormularioContacto'
import { Calendar, Users, MessageSquare, Wrench, ArrowRight, MapPin, Phone } from 'lucide-react'

async function getNoticias() {
  const { data } = await supabase
    .from('noticias')
    .select('id, titulo, resumen, imagen_url, categoria, fecha')
    .eq('publicada', true)
    .order('fecha', { ascending: false })
    .limit(4)
  return data ?? []
}

async function getActividades() {
  const hoy = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('actividades')
    .select('*')
    .gte('fecha', hoy)
    .order('fecha', { ascending: true })
    .limit(4)
  return data ?? []
}

const accesosRapidos = [
  {
    href: '/socios',
    icono: Users,
    titulo: 'Mi cuenta de socio',
    desc: 'Consultá tus cuotas y datos personales',
    color: 'bg-blue-50 text-[#1E88E5] border-blue-100',
  },
  {
    href: '/salon',
    icono: Calendar,
    titulo: 'Reservar el salón',
    desc: 'Verificá disponibilidad y hacé tu reserva',
    color: 'bg-green-50 text-[#43A047] border-green-100',
  },
  {
    href: '/#contacto',
    icono: MessageSquare,
    titulo: 'Quejas y consultas',
    desc: 'Envianos tu mensaje o reclamo',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
  },
  {
    href: '/servicios',
    icono: Wrench,
    titulo: 'Mosconi Servicios',
    desc: 'Trabajadores y servicios del barrio',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
  },
]

export default async function Home() {
  const [noticias, actividades] = await Promise.all([getNoticias(), getActividades()])

  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#1E88E5] to-[#1565C0] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <MapPin size={14} />
            Barrio General Mosconi · Comodoro Rivadavia, Chubut
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            Asociación Vecinal<br />General Mosconi
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Representando a los vecinos del barrio desde 1970. Comunidad, participación y bienestar para todos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/salon"
              className="bg-white text-[#1E88E5] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-base flex items-center justify-center gap-2"
            >
              <Calendar size={20} />
              Reservar el salón
            </Link>
            <Link
              href="/socios"
              className="bg-[#43A047] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#388E3C] transition-colors text-base flex items-center justify-center gap-2"
            >
              <Users size={20} />
              Asociarme
            </Link>
            <a
              href="https://wa.me/5492975402989?text=Hola%2C%20soy%20vecino%20del%20Barrio%20General%20Mosconi%20y%20quisiera%20consultar..."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1da851] transition-colors text-base flex items-center justify-center gap-2"
            >
              <Phone size={20} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ACCESOS RÁPIDOS */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-[#212121] mb-6 text-center">¿Qué necesitás?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accesosRapidos.map((item) => {
            const Icono = item.icono
            return (
              <Link key={item.href} href={item.href}>
                <div className={`rounded-2xl border-2 p-6 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow cursor-pointer h-full ${item.color}`}>
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Icono size={28} />
                  </div>
                  <div>
                    <div className="font-bold text-[#212121] text-base">{item.titulo}</div>
                    <div className="text-[#616161] text-sm mt-1">{item.desc}</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ÚLTIMAS NOTICIAS */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#212121]">Últimas noticias</h2>
            <Link href="/noticias" className="text-[#1E88E5] text-sm font-medium flex items-center gap-1 hover:underline">
              Ver todas <ArrowRight size={16} />
            </Link>
          </div>
          {noticias.length === 0 ? (
            <div className="text-center py-12 text-[#9E9E9E]">
              <p className="text-lg">Próximamente publicaremos las últimas novedades del barrio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {noticias.map((n) => (
                <NoticiaCard key={n.id} {...n} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PRÓXIMAS ACTIVIDADES */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#212121]">Próximas actividades</h2>
          <Link href="/actividades" className="text-[#1E88E5] text-sm font-medium flex items-center gap-1 hover:underline">
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>
        {actividades.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-[#9E9E9E] shadow-sm">
            <Calendar size={40} className="mx-auto mb-3 opacity-40" />
            <p>No hay actividades programadas próximamente.</p>
            <Link href="/actividades" className="mt-3 inline-block text-[#1E88E5] text-sm underline">
              Proponé una actividad
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actividades.map((a) => (
              <ActividadCard key={a.id} {...a} />
            ))}
          </div>
        )}
      </section>

      {/* FORMULARIO DE CONTACTO */}
      <section id="contacto" className="bg-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#212121] mb-2">Contacto y quejas</h2>
            <p className="text-[#616161]">
              ¿Tenés una consulta, reclamo o sugerencia? Escribinos y te respondemos a la brevedad.
            </p>
          </div>
          <FormularioContacto />
          <div className="mt-6 text-center text-sm text-[#9E9E9E]">
            También podés escribirnos por{' '}
            <a
              href="https://wa.me/5492975402989"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] font-medium hover:underline"
            >
              WhatsApp
            </a>{' '}
            o al email{' '}
            <a href="mailto:vecinal.mosconi@gmail.com" className="text-[#1E88E5] font-medium hover:underline">
              vecinal.mosconi@gmail.com
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
