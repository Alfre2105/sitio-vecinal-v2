'use client'

import { QRCodeSVG } from 'qrcode.react'
import { ShieldCheck } from 'lucide-react'

type Props = {
  nombre: string
  apellido: string
  numeroSocio: string
  dni?: string
  activo: boolean
  alDia: boolean
  qrUrl?: string
}

export default function CarnetSocio({ nombre, apellido, numeroSocio, dni, activo, alDia, qrUrl }: Props) {
  return (
    <div className="bg-gradient-to-br from-[#1E88E5] to-[#1565C0] rounded-2xl p-5 text-white max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] opacity-80">Asociación Vecinal</div>
          <div className="text-sm font-bold">General Mosconi</div>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <ShieldCheck size={18} />
        </div>
      </div>

      <div className="mt-6">
        <div className="text-lg font-bold leading-tight">{nombre} {apellido}</div>
        <div className="text-xs opacity-85 mt-1">Socio N° {numeroSocio}</div>
        {dni && <div className="text-xs opacity-85">DNI {dni}</div>}
      </div>

      <div className="flex items-end justify-between mt-6">
        <div className="flex flex-col gap-1.5">
          <span className={`inline-block w-fit text-[11px] font-semibold px-2.5 py-1 rounded-md ${activo ? 'bg-white/20' : 'bg-black/25'}`}>
            {activo ? 'Socio activo' : 'Socio inactivo'}
          </span>
          {activo && (
            <span className={`inline-block w-fit text-[11px] font-semibold px-2.5 py-1 rounded-md ${alDia ? 'bg-white/20' : 'bg-orange-900/30'}`}>
              {alDia ? 'Al día' : 'Con deuda'}
            </span>
          )}
        </div>
        {qrUrl && (
          <div className="bg-white rounded-lg p-2 shrink-0">
            <QRCodeSVG value={qrUrl} size={72} />
          </div>
        )}
      </div>
    </div>
  )
}
