'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchTodasCuotas } from '@/lib/fetchCuotas'
import { calcularAviso, mensajeAviso, type Aviso, type CuotaAviso, type NotificacionPrevia } from '@/lib/notificaciones'
import { BellRing, Mail, MessageCircle, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

type LogItem = {
  id: string
  tipo: string
  canal: string
  estado: string
  mes: number | null
  anio: number | null
  detalle: string | null
  created_at: string
  socios: { nombre: string; apellido: string; numero_socio: string } | null
}

type SocioPendiente = {
  id: string
  nombre: string
  apellido: string
  telefono: string | null
  aviso: Aviso
}

const ESTADO_ESTILO: Record<string, string> = {
  enviado: 'bg-green-100 text-green-700',
  fallido: 'bg-red-100 text-red-700',
  rebotado: 'bg-orange-100 text-orange-700',
}

const TIPO_LABEL: Record<string, string> = {
  proximo_vencimiento: 'Próxima a vencer',
  vencida: 'Vencida',
  recordatorio_deuda: 'Recordatorio de deuda',
}

function linkWhatsApp(telefono: string, mensaje: string): string {
  const limpio = telefono.replace(/\D/g, '')
  const numero = limpio.startsWith('549') ? limpio : `549${limpio}`
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}

export default function AdminNotificacionesPage() {
  const [log, setLog] = useState<LogItem[]>([])
  const [pendientesWhatsApp, setPendientesWhatsApp] = useState<SocioPendiente[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    const [{ data: logData }, { data: sociosData }, todasCuotas] = await Promise.all([
      supabase
        .from('notificaciones_enviadas')
        .select('id, tipo, canal, estado, mes, anio, detalle, created_at, socios(nombre, apellido, numero_socio)')
        .order('created_at', { ascending: false })
        .limit(150),
      // Solo los socios que el cron NO puede avisar por mail (sin email o con
      // email que ya rebotó) son candidatos a este listado manual-asistido.
      supabase
        .from('socios')
        .select('id, nombre, apellido, telefono')
        .eq('activo', true)
        .or('email.is.null,email_invalido.eq.true'),
      fetchTodasCuotas(),
    ])

    setLog((logData as unknown as LogItem[]) ?? [])

    const cuotasPorSocio = new Map<string, CuotaAviso[]>()
    for (const c of todasCuotas) {
      if (!cuotasPorSocio.has(c.socio_id)) cuotasPorSocio.set(c.socio_id, [])
      cuotasPorSocio.get(c.socio_id)!.push({ mes: c.mes, anio: c.anio, monto: c.monto, pagada: c.pagada })
    }

    // El historial de WhatsApp no se registra automaticamente (es manual), asi
    // que aca se evalua contra un historial vacio -- puede repetir un aviso que
    // ya se mando a mano, es una lista de sugerencias, no un envio automatico.
    const sinPrevias: NotificacionPrevia[] = []
    const pendientes: SocioPendiente[] = []
    for (const s of (sociosData as { id: string; nombre: string; apellido: string; telefono: string | null }[]) ?? []) {
      const aviso = calcularAviso(cuotasPorSocio.get(s.id) ?? [], sinPrevias)
      if (aviso && s.telefono) pendientes.push({ ...s, aviso })
    }
    setPendientesWhatsApp(pendientes)

    setCargando(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#212121] flex items-center gap-2">
          <BellRing size={24} className="text-[#1E88E5]" /> Notificaciones de cuotas
        </h1>
        <p className="text-sm text-[#9E9E9E] mt-0.5">
          Avisos automáticos por email (próximo vencimiento, vencida, recordatorio de deuda) y pendientes para avisar a mano por WhatsApp.
        </p>
      </div>

      {/* Pendientes por WhatsApp */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="font-bold text-[#212121] mb-1 flex items-center gap-2">
          <MessageCircle size={18} className="text-green-600" /> Pendientes de avisar por WhatsApp
        </h2>
        <p className="text-xs text-[#9E9E9E] mb-4">
          Socios sin email o con email que rebotó, a quienes les toca algún aviso hoy. El link abre WhatsApp con el mensaje ya escrito — vos lo revisás y lo mandás.
        </p>
        {cargando ? (
          <div className="text-center py-6 text-[#9E9E9E] text-sm">Cargando...</div>
        ) : pendientesWhatsApp.length === 0 ? (
          <div className="text-center py-6 text-[#9E9E9E] text-sm">No hay pendientes por WhatsApp por ahora.</div>
        ) : (
          <div className="space-y-2">
            {pendientesWhatsApp.map(s => {
              const { textoPlano } = mensajeAviso(`${s.nombre} ${s.apellido}`, s.aviso)
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 border border-[#E0E0E0] rounded-xl px-4 py-3 flex-wrap">
                  <div>
                    <p className="font-medium text-[#212121] text-sm">{s.nombre} {s.apellido}</p>
                    <p className="text-xs text-[#9E9E9E]">{TIPO_LABEL[s.aviso.tipo]} · ${s.aviso.monto.toLocaleString('es-AR')}</p>
                  </div>
                  <a
                    href={linkWhatsApp(s.telefono!, textoPlano)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-green-50 text-green-700 font-semibold px-3 py-2 rounded-lg text-xs hover:bg-green-100 shrink-0"
                  >
                    <MessageCircle size={14} /> Abrir WhatsApp
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Historial de envíos automáticos */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#212121] flex items-center gap-2">
            <Mail size={18} className="text-[#1E88E5]" /> Historial de avisos por email
          </h2>
        </div>
        {cargando ? (
          <div className="p-8 text-center text-[#9E9E9E]">Cargando...</div>
        ) : log.length === 0 ? (
          <div className="p-8 text-center text-[#9E9E9E]">Todavía no se mandó ningún aviso automático.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F4F6F9]">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-[#616161]">Socio</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#616161]">Tipo</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#616161] hidden sm:table-cell">Período</th>
                  <th className="text-center px-5 py-3 font-semibold text-[#616161]">Estado</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#616161] hidden md:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F6F9]">
                {log.map(item => (
                  <tr key={item.id} className="hover:bg-[#FAFAFA]">
                    <td className="px-5 py-3 text-[#212121]">
                      {item.socios ? `${item.socios.nombre} ${item.socios.apellido}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-[#616161]">{TIPO_LABEL[item.tipo] ?? item.tipo}</td>
                    <td className="px-5 py-3 text-[#616161] hidden sm:table-cell">
                      {item.mes ? `${item.mes}/${item.anio}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_ESTILO[item.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                        {item.estado === 'enviado' && <CheckCircle2 size={12} />}
                        {item.estado === 'fallido' && <XCircle size={12} />}
                        {item.estado === 'rebotado' && <AlertTriangle size={12} />}
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#9E9E9E] text-xs hidden md:table-cell">
                      {new Date(item.created_at).toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
