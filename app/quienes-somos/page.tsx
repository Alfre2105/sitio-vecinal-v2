export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { User, MessageCircle } from 'lucide-react'

async function getComision() {
  const { data } = await supabase
    .from('comision_directiva')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })
  return data ?? []
}

export const metadata = {
  title: 'Comisión Directiva | Asociación Vecinal General Mosconi',
  description: 'Conocé a los integrantes de la comisión directiva de la Asociación Vecinal General Mosconi.',
}

export default async function QuienesSomosPage() {
  const comision = await getComision()

  const titulares = comision.filter(m =>
    !m.rol.includes('Suplente') && !m.rol.includes('suplente')
  )
  const suplentes = comision.filter(m =>
    m.rol.includes('Suplente') || m.rol.includes('suplente')
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Encabezado */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#212121] mb-3">
          Comisión Directiva
        </h1>
        <p className="text-[#616161] text-lg max-w-2xl mx-auto">
          Las personas que trabajan día a día para representar y mejorar la calidad de vida de todos los vecinos del Barrio General Mosconi.
        </p>
      </div>

      {/* Miembros titulares */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-10">
        {titulares.map((miembro) => (
          <div key={miembro.id} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center mb-4 overflow-hidden">
              {miembro.foto_url ? (
                <img src={miembro.foto_url} alt={miembro.nombre} className="w-full h-full object-cover" />
              ) : (
                <User size={36} className="text-white" />
              )}
            </div>
            <h3 className="font-bold text-[#212121] text-base">{miembro.nombre}</h3>
            <span className="text-[#1E88E5] text-sm font-medium mt-1">{miembro.rol}</span>
            {miembro.descripcion && (
              <p className="text-[#9E9E9E] text-xs mt-2 leading-relaxed">{miembro.descripcion}</p>
            )}
          </div>
        ))}
      </div>

      {/* Suplentes y revisoras */}
      {suplentes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-10">
          <h2 className="font-bold text-[#212121] text-lg mb-4">Vocales Suplentes y Revisoras de Cuentas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {suplentes.map((miembro) => (
              <div key={miembro.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F4F6F9]">
                <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center shrink-0">
                  <User size={18} className="text-[#1E88E5]" />
                </div>
                <div>
                  <div className="font-semibold text-[#212121] text-sm">{miembro.nombre}</div>
                  <div className="text-[#616161] text-xs">{miembro.rol}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA contacto */}
      <div className="bg-gradient-to-br from-[#1E88E5] to-[#1565C0] rounded-2xl p-8 text-white text-center">
        <MessageCircle size={40} className="mx-auto mb-3 opacity-80" />
        <h2 className="text-xl font-bold mb-2">¿Querés contactar a la presidencia?</h2>
        <p className="opacity-90 mb-5">
          Escribinos por WhatsApp o email para comunicarte directamente con el presidente Alfredo Gómez.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/5492975402989?text=Hola%2C%20quisiera%20contactar%20a%20la%20presidencia%20de%20la%20Vecinal..."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1da851] transition-colors"
          >
            WhatsApp
          </a>
          <a
            href="mailto:vecinal.mosconi@gmail.com"
            className="bg-white text-[#1E88E5] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Enviar email
          </a>
        </div>
      </div>
    </div>
  )
}
