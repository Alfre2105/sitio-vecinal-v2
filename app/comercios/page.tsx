export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import ComercioCard from '@/components/ComercioCard'
import FormularioComercio from '@/components/FormularioComercio'

async function getComercios() {
  const { data } = await supabase
    .from('comercios')
    .select('*')
    .eq('estado', 'aprobado')
    .eq('activo', true)
    .order('nombre', { ascending: true })
  return data ?? []
}

export const metadata = {
  title: 'Comercios recomendados | Asociación Vecinal General Mosconi',
  description: 'Comercios del Barrio General Mosconi, con beneficios especiales para socios de la Vecinal.',
}

export default async function ComerciosPage() {
  const comercios = await getComercios()
  const conBeneficio = comercios.filter(c => c.beneficio_socios)
  const sinBeneficio = comercios.filter(c => !c.beneficio_socios)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#212121] mb-3">Comercios recomendados</h1>
        <p className="text-[#616161] text-lg max-w-2xl mx-auto">
          Comercios del barrio que apoyan a la Vecinal — algunos con beneficios exclusivos para socios.
        </p>
      </div>

      {comercios.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center text-[#9E9E9E] shadow-sm mb-10">
          <p className="text-lg mb-2">Todavía no hay comercios publicados.</p>
          <p className="text-sm">¿Tenés un negocio en el barrio? ¡Anotate más abajo!</p>
        </div>
      )}

      {conBeneficio.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#212121] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#43A047] inline-block" />
            Con beneficios para socios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conBeneficio.map(c => <ComercioCard key={c.id} {...c} />)}
          </div>
        </section>
      )}

      {sinBeneficio.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#212121] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1E88E5] inline-block" />
            Otros comercios adheridos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sinBeneficio.map(c => <ComercioCard key={c.id} {...c} />)}
          </div>
        </section>
      )}

      <FormularioComercio />
    </div>
  )
}
