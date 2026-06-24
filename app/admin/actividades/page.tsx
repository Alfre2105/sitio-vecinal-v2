'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2 } from 'lucide-react'

type Actividad = {
  id: string
  titulo: string
  fecha: string
  hora_inicio: string
  es_gratuita: boolean
  lugar: string
}

export default function AdminActividadesPage() {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const { data } = await supabase.from('actividades').select('id,titulo,fecha,hora_inicio,es_gratuita,lugar').order('fecha', { ascending: false })
    setActividades((data as Actividad[]) ?? [])
    setCargando(false)
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar esta actividad?')) return
    await supabase.from('actividades').delete().eq('id', id)
    setActividades(prev => prev.filter(a => a.id !== id))
  }

  async function handleCrear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setGuardando(true)
    const form = e.currentTarget
    const data = new FormData(form)
    await supabase.from('actividades').insert({
      titulo: data.get('titulo') as string,
      descripcion: data.get('descripcion') as string,
      fecha: data.get('fecha') as string,
      hora_inicio: data.get('hora_inicio') as string,
      hora_fin: data.get('hora_fin') as string,
      lugar: data.get('lugar') as string,
      es_gratuita: data.get('es_gratuita') === 'true',
      precio: data.get('es_gratuita') === 'false' ? parseFloat(data.get('precio') as string) : null,
      responsable: data.get('responsable') as string,
      contacto_inscripcion: data.get('contacto_inscripcion') as string,
    })
    form.reset()
    setMostrarForm(false)
    setGuardando(false)
    cargar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#212121]">Actividades</h1>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="bg-[#43A047] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#388E3C] text-sm">
          <Plus size={18} /> Nueva actividad
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleCrear} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-[#212121]">Nueva actividad</h2>
          <input name="titulo" required placeholder="Título *" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047]" />
          <textarea name="descripcion" required rows={3} placeholder="Descripción *" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047] resize-none" />
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-[#616161] block mb-1">Fecha *</label><input name="fecha" type="date" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047]" /></div>
            <div><label className="text-xs font-medium text-[#616161] block mb-1">Lugar *</label><input name="lugar" required placeholder="Ej: Salón comunitario" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#43A047]" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-[#616161] block mb-1">Hora inicio</label><input name="hora_inicio" type="time" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" /></div>
            <div><label className="text-xs font-medium text-[#616161] block mb-1">Hora fin</label><input name="hora_fin" type="time" required className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-[#616161] block mb-1">¿Es gratuita?</label>
              <select name="es_gratuita" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm bg-white">
                <option value="true">Sí, gratuita</option>
                <option value="false">No, tiene costo</option>
              </select>
            </div>
            <div><label className="text-xs font-medium text-[#616161] block mb-1">Precio (si tiene)</label><input name="precio" type="number" step="0.01" placeholder="0.00" className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="responsable" required placeholder="Responsable *" className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
            <input name="contacto_inscripcion" required placeholder="Contacto inscripción *" className="border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={guardando} className="bg-[#43A047] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#388E3C] disabled:opacity-60">
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} className="border border-[#E0E0E0] text-[#616161] px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-[#9E9E9E]">Cargando...</div>
        ) : actividades.length === 0 ? (
          <div className="p-8 text-center text-[#9E9E9E]">No hay actividades cargadas.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F4F6F9]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-[#616161]">Actividad</th>
                <th className="text-left px-5 py-3 font-semibold text-[#616161] hidden md:table-cell">Fecha</th>
                <th className="text-left px-5 py-3 font-semibold text-[#616161] hidden lg:table-cell">Lugar</th>
                <th className="text-center px-5 py-3 font-semibold text-[#616161]">Tipo</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F9]">
              {actividades.map(a => (
                <tr key={a.id} className="hover:bg-[#FAFAFA]">
                  <td className="px-5 py-4 font-medium text-[#212121]">{a.titulo}</td>
                  <td className="px-5 py-4 text-[#9E9E9E] hidden md:table-cell">{new Date(a.fecha + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                  <td className="px-5 py-4 text-[#616161] hidden lg:table-cell">{a.lugar}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${a.es_gratuita ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {a.es_gratuita ? 'Gratuita' : 'Con costo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => eliminar(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
