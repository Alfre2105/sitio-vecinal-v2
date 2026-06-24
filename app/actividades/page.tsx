export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import ActividadCard from '@/components/ActividadCard'
import { Lightbulb } from 'lucide-react'

async function getActividades() {
  const hoy = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('actividades')
    .select('*')
    .gte('fecha', hoy)
    .order('fecha', { ascending: true })
  return data ?? []
}

export const metadata = {
  title: 'Actividades | Asociación Vecinal General Mosconi',
  description: 'Actividades, talleres y eventos del Barrio General Mosconi.',
}

export default async function ActividadesPage() {
  const actividades = await getActividades()
  const gratuitas = actividades.filter(a => a.es_gratuita)
  const pagas = actividades.filter(a => !a.es_gratuita)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#212121] mb-3">Actividades</h1>
        <p className="text-[#616161] text-lg max-w-2xl mx-auto">
          Talleres, cursos y eventos para toda la comunidad del barrio.
        </p>
      </div>

      {actividades.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center text-[#9E9E9E] shadow-sm">
          <p className="text-lg mb-2">No hay actividades programadas por el momento.</p>
          <p className="text-sm">¿Querés proponer algo? ¡Escribinos!</p>
        </div>
      )}

      {gratuitas.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#212121] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#43A047] inline-block" />
            Actividades gratuitas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gratuitas.map(a => <ActividadCard key={a.id} {...a} />)}
          </div>
        </section>
      )}

      {pagas.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#212121] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1E88E5] inline-block" />
            Actividades con arancel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pagas.map(a => <ActividadCard key={a.id} {...a} />)}
          </div>
        </section>
      )}

      {/* Formulario de propuesta */}
      <div className="bg-gradient-to-br from-[#E8F5E9] to-[#E3F2FD] rounded-2xl p-8 text-center">
        <Lightbulb size={40} className="text-[#43A047] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#212121] mb-2">¿Tenés una idea para el barrio?</h2>
        <p className="text-[#616161] mb-5 max-w-md mx-auto">
          Proponé una nueva actividad, taller o evento para la comunidad. Todas las ideas son bienvenidas.
        </p>
        <a
          href="mailto:vecinal.mosconi@gmail.com?subject=Propuesta%20de%20actividad"
          className="inline-flex items-center gap-2 bg-[#43A047] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#388E3C] transition-colors"
        >
          Proponer una actividad
        </a>
      </div>
    </div>
  )
}
