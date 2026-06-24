export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { Camera } from 'lucide-react'

async function getHistorial() {
  const { data } = await supabase
    .from('historial_barrio')
    .select('*')
    .order('orden', { ascending: true })
  return data ?? []
}

export const metadata = {
  title: 'Historia del Barrio | Asociación Vecinal General Mosconi',
  description: 'Conocé la historia del Barrio General Mosconi y la Asociación Vecinal desde su fundación en 1970.',
}

export default async function HistoriaPage() {
  const historial = await getHistorial()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#212121] mb-3">
          Historia del Barrio
        </h1>
        <p className="text-[#616161] text-lg max-w-2xl mx-auto">
          Desde la fundación el 4 de octubre de 1970, la Asociación Vecinal General Mosconi ha sido el corazón de nuestra comunidad.
        </p>
      </div>

      {/* Línea de tiempo */}
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#1E88E5] opacity-30 -translate-x-px" />

        <div className="space-y-10">
          {historial.map((hito, index) => {
            const esDerecha = index % 2 === 0

            return (
              <div key={hito.id} className={`relative flex ${esDerecha ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row gap-6 md:gap-0`}>
                {/* Año - círculo */}
                <div className="relative flex items-start md:items-center md:justify-center md:w-1/2">
                  <div className={`relative z-10 md:absolute ${esDerecha ? 'md:-right-6' : 'md:-left-6'}`}>
                    <div className="w-12 h-12 rounded-full bg-[#1E88E5] flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-xs">{hito.anio}</span>
                    </div>
                  </div>

                  {/* Contenido desktop - lado contrario */}
                  <div className={`hidden md:block ${esDerecha ? 'pr-16' : 'pl-16'} w-full`}>
                    {!esDerecha && (
                      <HitoContenido hito={hito} />
                    )}
                  </div>
                </div>

                {/* Contenido mobile / lado derecho desktop */}
                <div className={`flex-1 md:w-1/2 ${esDerecha ? 'md:pl-16' : 'md:pr-16 md:hidden'}`}>
                  <HitoContenido hito={hito} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sección de recuerdos */}
      <div className="mt-16 bg-gradient-to-br from-[#E3F2FD] to-[#E8F5E9] rounded-2xl p-8 text-center">
        <Camera size={40} className="text-[#1E88E5] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#212121] mb-2">¿Tenés fotos o recuerdos del barrio?</h2>
        <p className="text-[#616161] mb-5">
          Compartí tus fotografías históricas y testimonios para enriquecer la memoria colectiva del Barrio General Mosconi.
        </p>
        <a
          href="mailto:vecinal.mosconi@gmail.com?subject=Fotos%20históricas%20del%20barrio"
          className="inline-flex items-center gap-2 bg-[#1E88E5] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1565C0] transition-colors"
        >
          Compartir mis recuerdos
        </a>
      </div>
    </div>
  )
}

function HitoContenido({ hito }: { hito: { anio: number; titulo: string; descripcion: string; imagen_url: string | null } }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
      {hito.imagen_url && (
        <div className="h-40 rounded-xl overflow-hidden mb-4">
          <img src={hito.imagen_url} alt={hito.titulo} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="text-[#1E88E5] font-bold text-sm mb-1">{hito.anio}</div>
      <h3 className="font-bold text-[#212121] text-base mb-2">{hito.titulo}</h3>
      <p className="text-[#616161] text-sm leading-relaxed">{hito.descripcion}</p>
    </div>
  )
}
