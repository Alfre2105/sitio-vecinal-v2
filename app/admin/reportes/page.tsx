'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchTodasCuotas } from '@/lib/fetchCuotas'
import { Download, DollarSign, AlertCircle, Users, TrendingUp } from 'lucide-react'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const CATEGORIAS = ['activo', 'cadete', 'vitalicio', 'honorario', 'adherente']

type Socio = {
  id: string
  dni: string
  numero_socio: string
  nombre: string
  apellido: string
  email: string | null
  telefono: string | null
  categoria: string
  activo: boolean
}

type Cuota = {
  socio_id: string
  mes: number
  anio: number
  monto: number
  pagada: boolean
}

function escaparCsv(valor: string | number) {
  const texto = String(valor ?? '')
  if (/[",\n]/.test(texto)) return `"${texto.replace(/"/g, '""')}"`
  return texto
}

export default function AdminReportesPage() {
  const [anio, setAnio] = useState(new Date().getFullYear())
  const [socios, setSocios] = useState<Socio[]>([])
  const [cuotasAnio, setCuotasAnio] = useState<Cuota[]>([])
  const [cuotasTodas, setCuotasTodas] = useState<Cuota[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anio])

  async function cargar() {
    setCargando(true)
    const [{ data: sociosData }, cuotasAnioData, cuotasTodasData] = await Promise.all([
      supabase.from('socios').select('id, dni, numero_socio, nombre, apellido, email, telefono, categoria, activo').order('apellido', { ascending: true }),
      fetchTodasCuotas({ anio }),
      fetchTodasCuotas(),
    ])
    setSocios((sociosData as Socio[]) ?? [])
    setCuotasAnio(cuotasAnioData)
    setCuotasTodas(cuotasTodasData)
    setCargando(false)
  }

  // Resumen por socio con TODOS los años — la deuda real de un socio puede
  // incluir meses o años anteriores, no solo el año que se está mirando.
  const resumenPorSocio = useMemo(() => {
    const mapa: Record<string, { pagadas: number; pendientes: number; deuda: number }> = {}
    for (const c of cuotasTodas) {
      const r = mapa[c.socio_id] ?? { pagadas: 0, pendientes: 0, deuda: 0 }
      if (c.pagada) r.pagadas++
      else { r.pendientes++; r.deuda += Number(c.monto) }
      mapa[c.socio_id] = r
    }
    return mapa
  }, [cuotasTodas])

  const activos = socios.filter(s => s.activo)
  const recaudadoAnio = cuotasAnio.filter(c => c.pagada).reduce((acc, c) => acc + Number(c.monto), 0)
  const deudaTotal = Object.values(resumenPorSocio).reduce((acc, r) => acc + r.deuda, 0)
  const sociosAlDia = activos.filter(s => (resumenPorSocio[s.id]?.pendientes ?? 0) === 0 && (resumenPorSocio[s.id]?.pagadas ?? 0) > 0)
  const sociosConDeuda = activos.filter(s => (resumenPorSocio[s.id]?.pendientes ?? 0) > 0)

  const porMes = MESES.map((nombre, i) => {
    const mes = i + 1
    const delMes = cuotasAnio.filter(c => c.mes === mes)
    return {
      nombre,
      recaudado: delMes.filter(c => c.pagada).reduce((acc, c) => acc + Number(c.monto), 0),
      pendiente: delMes.filter(c => !c.pagada).reduce((acc, c) => acc + Number(c.monto), 0),
    }
  })

  const porCategoria = CATEGORIAS.map(categoria => ({
    categoria,
    cantidad: socios.filter(s => s.categoria === categoria).length,
  }))

  const morosos = activos
    .map(s => ({ socio: s, resumen: resumenPorSocio[s.id] }))
    .filter(x => (x.resumen?.pendientes ?? 0) > 0)
    .sort((a, b) => (b.resumen?.deuda ?? 0) - (a.resumen?.deuda ?? 0))

  function exportarCsv() {
    const encabezado = ['Apellido', 'Nombre', 'DNI', 'N° Socio', 'Categoría', 'Estado', 'Email', 'Teléfono', 'Cuotas pagadas (total)', 'Cuotas pendientes (total)', 'Deuda total']
    const filas = socios.map(s => {
      const r = resumenPorSocio[s.id]
      return [
        s.apellido, s.nombre, s.dni, s.numero_socio, s.categoria, s.activo ? 'Activo' : 'Inactivo',
        s.email ?? '', s.telefono ?? '', r?.pagadas ?? 0, r?.pendientes ?? 0, r?.deuda ?? 0,
      ]
    })
    const csv = [encabezado, ...filas].map(fila => fila.map(escaparCsv).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `socios-cuotas.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Reportes</h1>
          <p className="text-sm text-[#9E9E9E] mt-0.5">Estado contable de los socios</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <button onClick={() => setAnio(a => a - 1)} className="px-3 py-1.5 border border-[#E0E0E0] rounded-lg text-sm hover:bg-gray-50 bg-white">←</button>
              <span className="font-semibold text-[#212121] w-14 text-center">{anio}</span>
              <button onClick={() => setAnio(a => a + 1)} className="px-3 py-1.5 border border-[#E0E0E0] rounded-lg text-sm hover:bg-gray-50 bg-white">→</button>
            </div>
            <p className="text-[10px] text-[#9E9E9E] mt-0.5">Solo afecta recaudado y recaudación por mes</p>
          </div>
          <button onClick={exportarCsv} className="bg-[#1E88E5] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#1565C0] text-sm">
            <Download size={18} /> Exportar CSV
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="p-8 text-center text-[#9E9E9E]">Cargando...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-[#43A047] flex items-center justify-center mb-3"><DollarSign size={20} /></div>
              <div className="text-2xl font-extrabold text-[#212121]">${recaudadoAnio.toLocaleString('es-AR')}</div>
              <div className="text-[#9E9E9E] text-sm mt-1">Recaudado en {anio}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3"><AlertCircle size={20} /></div>
              <div className="text-2xl font-extrabold text-[#212121]">${deudaTotal.toLocaleString('es-AR')}</div>
              <div className="text-[#9E9E9E] text-sm mt-1">Deuda total acumulada</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E88E5] flex items-center justify-center mb-3"><Users size={20} /></div>
              <div className="text-2xl font-extrabold text-[#212121]">{sociosAlDia.length}</div>
              <div className="text-[#9E9E9E] text-sm mt-1">Socios al día</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3"><TrendingUp size={20} /></div>
              <div className="text-2xl font-extrabold text-[#212121]">{sociosConDeuda.length}</div>
              <div className="text-[#9E9E9E] text-sm mt-1">Socios con deuda</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="font-bold text-[#212121] mb-4">Recaudación por mes — {anio}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#9E9E9E]">
                    <th className="py-2 pr-4 font-medium">Mes</th>
                    <th className="py-2 pr-4 font-medium">Recaudado</th>
                    <th className="py-2 font-medium">Pendiente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F6F9]">
                  {porMes.map(m => (
                    <tr key={m.nombre}>
                      <td className="py-2 pr-4 text-[#212121] font-medium">{m.nombre}</td>
                      <td className="py-2 pr-4 text-green-600">${m.recaudado.toLocaleString('es-AR')}</td>
                      <td className="py-2 text-red-500">${m.pendiente.toLocaleString('es-AR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="font-bold text-[#212121] mb-4">Socios por categoría</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {porCategoria.map(c => (
                <div key={c.categoria} className="bg-[#F4F6F9] rounded-xl p-4 text-center">
                  <div className="text-xl font-extrabold text-[#212121]">{c.cantidad}</div>
                  <div className="text-xs text-[#9E9E9E] capitalize mt-1">{c.categoria}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="font-bold text-[#212121]">Socios con deuda</h2>
              <p className="text-xs text-[#9E9E9E] mt-1">Deuda acumulada de todos los años, ordenados de mayor a menor</p>
            </div>
            {morosos.length === 0 ? (
              <p className="text-[#9E9E9E] text-sm text-center py-8">No hay socios con cuotas pendientes.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F4F6F9]">
                    <tr>
                      <th className="text-left px-6 py-3 font-semibold text-[#616161]">Socio</th>
                      <th className="text-left px-6 py-3 font-semibold text-[#616161] hidden sm:table-cell">Contacto</th>
                      <th className="text-center px-6 py-3 font-semibold text-[#616161]">Cuotas debidas</th>
                      <th className="text-right px-6 py-3 font-semibold text-[#616161]">Deuda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F6F9]">
                    {morosos.map(({ socio: s, resumen: r }) => (
                      <tr key={s.id} className="hover:bg-[#FAFAFA]">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#212121]">{s.apellido}, {s.nombre}</div>
                          <div className="text-xs text-[#9E9E9E] font-mono">{s.numero_socio}</div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          {s.email && <div className="text-xs text-[#616161]">{s.email}</div>}
                          {s.telefono && <div className="text-xs text-[#9E9E9E]">{s.telefono}</div>}
                        </td>
                        <td className="px-6 py-4 text-center text-red-600 font-semibold">{r?.pendientes}</td>
                        <td className="px-6 py-4 text-right font-bold text-red-600">${(r?.deuda ?? 0).toLocaleString('es-AR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
