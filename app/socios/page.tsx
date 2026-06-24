import LoginSocio from '@/components/LoginSocio'
import FormularioAdhesion from '@/components/FormularioAdhesion'
import { Users, FileText } from 'lucide-react'

export const metadata = {
  title: 'Área de Socios | Asociación Vecinal General Mosconi',
  description: 'Accedé a tu cuenta de socio, consultá el estado de tus cuotas y asociate a la Vecinal del Barrio General Mosconi.',
}

export default function SociosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#212121] mb-3">Área de Socios</h1>
        <p className="text-[#616161] text-lg">
          Consultá tus datos, el estado de tus cuotas o asociate a la Vecinal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Login */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users size={22} className="text-[#1E88E5]" />
            <h2 className="text-xl font-bold text-[#212121]">Ya soy socio</h2>
          </div>
          <LoginSocio />
        </div>

        {/* Adhesión */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={22} className="text-[#43A047]" />
            <h2 className="text-xl font-bold text-[#212121]">Quiero asociarme</h2>
          </div>
          <FormularioAdhesion />
        </div>
      </div>
    </div>
  )
}
