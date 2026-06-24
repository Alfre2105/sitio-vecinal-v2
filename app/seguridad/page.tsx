import FormularioContacto from '@/components/FormularioContacto'
import { Shield, Phone, AlertTriangle, Users } from 'lucide-react'

export const metadata = {
  title: 'Red de Seguridad | Asociación Vecinal General Mosconi',
  description: 'Información sobre el plan preventivo barrial y formulario de reporte de incidentes.',
}

export default function SeguridadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#212121] mb-3">
          Red de Seguridad Barrial
        </h1>
        <p className="text-[#616161] text-lg max-w-2xl mx-auto">
          Plan preventivo comunitario del Barrio General Mosconi. La seguridad es responsabilidad de todos.
        </p>
      </div>

      {/* Info del plan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <Shield size={36} className="text-[#1E88E5] mx-auto mb-3" />
          <h3 className="font-bold text-[#212121] mb-2">Plan preventivo</h3>
          <p className="text-[#616161] text-sm">Coordinación entre vecinos y fuerzas de seguridad para prevenir incidentes.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <Users size={36} className="text-[#43A047] mx-auto mb-3" />
          <h3 className="font-bold text-[#212121] mb-2">Red vecinal</h3>
          <p className="text-[#616161] text-sm">Comunicación fluida entre vecinos ante situaciones de riesgo o emergencia.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <AlertTriangle size={36} className="text-orange-500 mx-auto mb-3" />
          <h3 className="font-bold text-[#212121] mb-2">Reportes</h3>
          <p className="text-[#616161] text-sm">Informá incidentes a través del formulario para que la Vecinal tome acción.</p>
        </div>
      </div>

      {/* Números de emergencia */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-10">
        <h2 className="font-bold text-red-800 text-lg mb-4 flex items-center gap-2">
          <Phone size={20} />
          Números de emergencia
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { nombre: 'Policía', numero: '101' },
            { nombre: 'Bomberos', numero: '100' },
            { nombre: 'Ambulancia', numero: '107' },
            { nombre: 'Vecinal', numero: '+54 297 540-2989' },
          ].map(({ nombre, numero }) => (
            <div key={nombre} className="text-center">
              <div className="text-2xl font-extrabold text-red-600">{numero}</div>
              <div className="text-sm text-red-700 font-medium">{nombre}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario de reporte */}
      <div>
        <h2 className="text-xl font-bold text-[#212121] mb-4">Reportar un incidente</h2>
        <FormularioContacto />
      </div>
    </div>
  )
}
