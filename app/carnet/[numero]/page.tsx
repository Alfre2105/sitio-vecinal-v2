import { supabase } from '@/lib/supabase'
import { cuotaVencida } from '@/lib/cuotas'
import CarnetSocio from '@/components/CarnetSocio'
import { ShieldCheck, ShieldX } from 'lucide-react'

export const dynamic = 'force-dynamic'

type CuotaCheck = { mes: number; anio: number; pagada: boolean }

export default async function CarnetPublicoPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params

  const { data: socio } = await supabase
    .from('socios')
    .select('id, nombre, apellido, numero_socio, activo')
    .eq('numero_socio', numero)
    .single()

  if (!socio) {
    return (
      <div className="max-w-sm mx-auto px-4 py-20 text-center">
        <ShieldX size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-[#616161] font-medium">Este carnet no es válido.</p>
      </div>
    )
  }

  let alDia = true
  if (socio.activo) {
    const { data: cuotas } = await supabase
      .from('cuotas')
      .select('mes, anio, pagada')
      .eq('socio_id', socio.id)
    alDia = !((cuotas as CuotaCheck[] ?? []).some(c => !c.pagada && cuotaVencida(c.mes, c.anio)))
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <CarnetSocio
        nombre={socio.nombre}
        apellido={socio.apellido}
        numeroSocio={socio.numero_socio}
        activo={socio.activo}
        alDia={alDia}
      />
      <div className="flex items-center justify-center gap-2 mt-5 text-sm text-[#43A047] font-medium">
        <ShieldCheck size={16} />
        Carnet verificado por la Asociación Vecinal General Mosconi
      </div>
    </div>
  )
}
