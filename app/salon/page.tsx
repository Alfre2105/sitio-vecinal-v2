import CalendarioSalon from '@/components/CalendarioSalon'
import { CheckCircle, Users, Clock, DollarSign, Phone } from 'lucide-react'

export const metadata = {
  title: 'Alquiler del Salón | Asociación Vecinal General Mosconi',
  description: 'Reservá el salón comunitario del Barrio General Mosconi. Verificá disponibilidad y enviá tu solicitud online.',
}

const condiciones = [
  { icono: Users, texto: 'Capacidad máxima: 100 personas' },
  { icono: Clock, texto: 'Reservas mínimo 48hs antes del evento' },
  { icono: DollarSign, texto: 'Consultar precio según tipo de evento y cantidad de personas' },
  { icono: CheckCircle, texto: 'Incluye mesas, sillas y cocina básica' },
]

export default function SalonPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#212121] mb-3">
          Alquiler del Salón
        </h1>
        <p className="text-[#616161] text-lg max-w-2xl mx-auto">
          El salón comunitario está disponible para eventos de vecinos y socios. Verificá la disponibilidad y solicitá tu reserva.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Calendario (principal) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-[#212121] text-xl mb-5">Disponibilidad</h2>
            <CalendarioSalon />
          </div>
        </div>

        {/* Info lateral */}
        <div className="lg:col-span-2 space-y-5">
          {/* Condiciones */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-[#212121] text-lg mb-4">Condiciones de uso</h2>
            <ul className="space-y-3">
              {condiciones.map(({ icono: Icono, texto }) => (
                <li key={texto} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E3F2FD] flex items-center justify-center shrink-0">
                    <Icono size={16} className="text-[#1E88E5]" />
                  </div>
                  <span className="text-[#616161] text-sm leading-relaxed">{texto}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fotos del salón */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-[#212121] text-lg mb-4">Fotos del salón</h2>
            <div className="grid grid-cols-2 gap-2">
              <img src="/salon-1.jpg" alt="Salón comunitario" className="rounded-xl aspect-video object-cover w-full" />
              <img src="/salon-2.jpg" alt="Salón comunitario" className="rounded-xl aspect-video object-cover w-full" />
            </div>
          </div>

          {/* Contacto directo */}
          <div className="bg-gradient-to-br from-[#1E88E5] to-[#1565C0] rounded-2xl p-5 text-white">
            <Phone size={24} className="mb-2 opacity-80" />
            <h3 className="font-bold mb-1">¿Tenés alguna duda?</h3>
            <p className="text-sm opacity-90 mb-3">Consultanos directamente por WhatsApp</p>
            <a
              href="https://wa.me/5492975402989?text=Hola%2C%20quisiera%20consultar%20sobre%20el%20alquiler%20del%20sal%C3%B3n..."
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-[#25D366] text-white font-bold py-2.5 rounded-xl hover:bg-[#1da851] transition-colors text-sm"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
