import Link from 'next/link'
import { Wrench, Search, UserPlus, Star, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Mosconi Servicios | Asociación Vecinal General Mosconi',
  description: 'Conectamos vecinos con trabajadores confiables del barrio General Mosconi.',
}

const beneficios = [
  {
    icono: Search,
    titulo: 'Buscá un trabajador',
    desc: 'Encontrá electricistas, plomeros, pintores y más vecinos del barrio.',
  },
  {
    icono: Star,
    titulo: 'Calificaciones reales',
    desc: 'Cada trabajador tiene calificaciones de otros vecinos que ya usaron el servicio.',
  },
  {
    icono: UserPlus,
    titulo: 'Registrate como trabajador',
    desc: 'Si ofrecés un servicio, sumá tu perfil y llegá a más vecinos.',
  },
]

export default function ServiciosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Encabezado */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
          <Wrench className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#212121] mb-3">Mosconi Servicios</h1>
        <p className="text-[#616161] text-lg max-w-xl mx-auto">
          La app comunitaria que conecta vecinos con trabajadores <strong>confiables</strong> del barrio General Mosconi.
        </p>
      </div>

      {/* Beneficios */}
      <div className="grid gap-4 mb-10">
        {beneficios.map(({ icono: Icono, titulo, desc }) => (
          <div key={titulo} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Icono className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-[#212121] mb-1">{titulo}</h2>
              <p className="text-[#616161] text-sm">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Botón principal */}
      <div className="text-center">
        <a
          href="https://mosconi-servicios-fwxc.vercel.app"
          className="inline-flex items-center gap-2 bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors shadow-md"
        >
          Ir a Mosconi Servicios
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>

      {/* Nota */}
      <div className="mt-10 bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-[#1565C0]">
        <strong>¿Sos trabajador del barrio?</strong> Registrá tu perfil en la app y la Asociación Vecinal lo validará antes de publicarlo.
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-[#9E9E9E] hover:text-[#1E88E5] transition-colors">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}
