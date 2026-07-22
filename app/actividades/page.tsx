export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import ActividadCard from '@/components/ActividadCard'
import FormularioPropuestaActividad from '@/components/FormularioPropuestaActividad'

async function getActividades() {
  const hoy = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('actividades')
    .select('*')
    .eq('estado', 'aprobada')
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

      {/* GRILLA SEMANAL - SALÓN */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-[#212121] mb-1 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
          Grilla semanal — Salón
        </h2>
        <p className="text-sm text-[#9E9E9E] mb-4">Actividades regulares en el salón principal de la Vecinal.</p>
        <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-100">
          <table className="w-full text-xs text-center border-collapse bg-white min-w-[700px]">
            <thead>
              <tr className="bg-[#1E88E5] text-white">
                {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'].map(d => (
                  <th key={d} className="px-2 py-3 font-bold">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="bg-blue-50">
                <td className="px-2 py-2"><strong>Gimnasia</strong><br/>9.30 a 10.30</td>
                <td className="px-2 py-2"><strong>Yoga</strong> (Ana M)<br/>9 a 10.30</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"><strong>Yoga</strong> (Ana M)<br/>9 a 10.30</td>
                <td className="px-2 py-2"><strong>Gimnasia</strong><br/>9.30 a 10.30</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
              </tr>
              <tr>
                <td className="px-2 py-2"><strong>Act. Física Adultos</strong><br/>11.15 a 12.15</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"><strong>Act. Física Adultos</strong><br/>11.15 a 12.15</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
              </tr>
              <tr className="bg-blue-50">
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"><strong>Zumba</strong><br/>14 a 15</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"><strong>Zumba</strong><br/>14 a 15</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
              </tr>
              <tr>
                {['Lunes','Martes','Miércoles','Jueves','Viernes'].map(d => (
                  <td key={d} className="px-2 py-2"><strong>Entrenamiento Funcional</strong><br/>15 a 16</td>
                ))}
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
              </tr>
              <tr className="bg-blue-50">
                <td className="px-2 py-2"><strong>Yoga</strong><br/>16 a 17</td>
                <td className="px-2 py-2"><strong>Pilates</strong><br/>16 a 17</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"><strong>Pilates</strong><br/>16 a 17</td>
                <td className="px-2 py-2"><strong>Yoga</strong><br/>16 a 17</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
              </tr>
              <tr>
                <td className="px-2 py-2"><strong>Pre Danza Baby</strong><br/>17 a 18<br/><span className="text-[#9E9E9E]">Árabe Adulto Principiante 18 a 19</span></td>
                <td className="px-2 py-2"><strong>Taekwondo</strong><br/>(Sabonim Cristina)<br/>17 a 21</td>
                <td className="px-2 py-2"><strong>Pre Danza Baby</strong><br/>17 a 18<br/><span className="text-[#9E9E9E]">Árabe Adulto Principiante 18 a 19</span></td>
                <td className="px-2 py-2"><strong>Taekwondo</strong><br/>(Sabonim Cristina)<br/>17 a 21</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
              </tr>
              <tr className="bg-blue-50">
                <td className="px-2 py-2"><strong>Taekwondo</strong><br/>(Sabom Leonardo)<br/>19 a 21</td>
                <td className="px-2 py-2"><strong>Folclore</strong><br/>21 a 22.30</td>
                <td className="px-2 py-2"><strong>Taekwondo</strong><br/>(Sabom Leonardo)<br/>19 a 21</td>
                <td className="px-2 py-2"><strong>Folclore</strong><br/>21 a 22.30</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"><strong>Coro</strong> (Emanuel)<br/>19 hs</td>
              </tr>
              <tr>
                <td className="px-2 py-2"><strong>Fight Do</strong><br/>21 a 22</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"><strong>Fight Do</strong><br/>21 a 22</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"><strong>Comerciales</strong><br/>21.30 a 23</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* GRILLA SEMANAL - AULAS */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-[#212121] mb-1 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#43A047] inline-block" />
          Grilla semanal — Aulas
        </h2>
        <p className="text-sm text-[#9E9E9E] mb-4">Talleres y cursos en las aulas de la Vecinal.</p>
        <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-100">
          <table className="w-full text-xs text-center border-collapse bg-white min-w-[700px]">
            <thead>
              <tr className="bg-[#43A047] text-white">
                {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map(d => (
                  <th key={d} className="px-2 py-3 font-bold">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="bg-green-50">
                <td className="px-2 py-2"><strong>Tejido</strong><br/>10 a 13</td>
                <td className="px-2 py-2"><strong>Corte y Confección</strong><br/>9 a 12</td>
                <td className="px-2 py-2"><strong>Origami</strong><br/>9 a 12</td>
                <td className="px-2 py-2"><strong>Taller Musical GN</strong><br/>10 a 12</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"><strong>Taller de Arte Niños</strong><br/>10 a 12</td>
              </tr>
              <tr>
                <td className="px-2 py-2"><strong>Pintura y Stencil</strong><br/>15.30 a 18</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"><strong>Carpintería</strong><br/>14 a 17</td>
                <td className="px-2 py-2"><strong>Pintura y Stencil</strong><br/>15.30 a 18</td>
                <td className="px-2 py-2"><strong>Estimulación Cognitiva</strong><br/>14 a 16</td>
                <td className="px-2 py-2"></td>
              </tr>
              <tr className="bg-green-50">
                <td className="px-2 py-2"><strong>Taller Recreativo TEA</strong><br/>18 a 20</td>
                <td className="px-2 py-2"><strong>Taller Musical GN</strong><br/>18.30 a 20.30</td>
                <td className="px-2 py-2"><strong>Taller Musical GN</strong><br/>18.30 a 20.30</td>
                <td className="px-2 py-2"><strong>Taller Recreativo Niños</strong><br/>18 a 20</td>
                <td className="px-2 py-2"><strong>Taller Plástica y Escritura Niños</strong><br/>18 a 20</td>
                <td className="px-2 py-2"><strong>Inglés</strong><br/>17 a 19.30</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Formulario de propuesta */}
      <FormularioPropuestaActividad />
    </div>
  )
}
