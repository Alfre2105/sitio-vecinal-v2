'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, Clock, Plus, X, Pencil, Trash2 } from 'lucide-react'

type Reserva = {
  id: string
  nombre: string
  telefono: string
  email: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  motivo: string
  cantidad_personas: number
  estado: 'pendiente' | 'confirmada' | 'cancelada'
  observaciones: string
  created_at: string
}

const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente', cls: 'bg-orange-100 text-orange-700', icono: Clock },
  confirmada: { label: 'Confirmada', cls: 'bg-green-100 text-green-700', icono: CheckCircle },
  cancelada: { label: 'Cancelada', cls: 'bg-red-100 text-red-600', icono: XCircle },
}

const FORM_INICIAL = {
  nombre: '', telefono: '', email: '', fecha: '', hora_inicio: '',
  hora_fin: '', motivo: '', cantidad_personas: 1, estado: 'confirmada' as Reserva['estado'], observaciones: '',
}

export default function AdminReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState<'todas' | 'pendiente' | 'confirmada' | 'cancelada'>('todas')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const { data } = await supabase.from('reservas_salon').select('*').order('fecha', { ascending: false })
    setReservas((data as Reserva[]) ?? [])
    setCargando(false)
  }

  function abrirNueva() {
    setEditandoId(null)
    setForm(FORM_INICIAL)
    setError(null)
    setMostrarForm(true)
  }

  function abrirEditar(r: Reserva) {
    setEditandoId(r.id)
    setForm({
      nombre: r.nombre, telefono: r.telefono, email: r.email,
      fecha: r.fecha, hora_inicio: r.hora_inicio?.slice(0, 5), hora_fin: r.hora_fin?.slice(0, 5),
      motivo: r.motivo, cantidad_personas: r.cantidad_personas, estado: r.estado,
      observaciones: r.observaciones ?? '',
    })
    setError(null)
    setMostrarForm(true)
  }

  function cerrarForm() {
    setMostrarForm(false)
    setEditandoId(null)
    setForm(FORM_INICIAL)
    setError(null)
  }

  async function guardarReserva() {
    setError(null)
    if (!form.nombre.trim() || !form.fecha || !form.hora_inicio || !form.hora_fin) {
      setError('Nombre, fecha y horarios son obligatorios.')
      return
    }
    setGuardando(true)
    const datos = {
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim() || '-',
      email: form.email.trim() || '-',
      fecha: form.fecha,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      motivo: form.motivo.trim() || '-',
      cantidad_personas: form.cantidad_personas,
      estado: form.estado,
      observaciones: form.observaciones.trim() || null,
    }

    let err
    if (editandoId) {
      const res = await supabase.from('reservas_salon').update(datos).eq('id', editandoId)
      err = res.error
    } else {
      const res = await supabase.from('reservas_salon').insert(datos)
      err = res.error
    }

    setGuardando(false)
    if (err) { setError('Error al guardar. Intentá de nuevo.'); return }
    cerrarForm()
    cargar()
  }

  async function cambiarEstado(id: string, estado: Reserva['estado']) {
    await supabase.from('reservas_salon').update({ estado }).eq('id', id)
    setReservas(prev => prev.map(r => r.id === id ? { ...r, estado } : r))
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar esta reserva definitivamente?')) return
    await supabase.from('reservas_salon').delete().eq('id', id)
    setReservas(prev => prev.filter(r => r.id !== id))
  }

  const filtradas = filtro === 'todas' ? reservas : reservas.filter(r => r.estado === filtro)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#212121]">Reservas del Salón</h1>
        <div className="flex gap-2 flex-wrap">
          {(['todas', 'pendiente', 'confirmada', 'cancelada'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-colors ${filtro === f ? 'bg-[#1E88E5] text-white' : 'bg-white text-[#616161] hover:bg-[#E3F2FD]'}`}>
              {f}
            </button>
          ))}
          <button onClick={abrirNueva}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#1E88E5] text-white flex items-center gap-1 hover:bg-[#1565C0] transition-colors">
            <Plus size={14} /> Nueva reserva
          </button>
        </div>
      </div>

      {/* Formulario nueva / editar */}
      {mostrarForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#212121]">{editandoId ? 'Editar reserva' : 'Cargar reserva presencial'}</h2>
            <button onClick={cerrarForm}><X size={18} className="text-[#9E9E9E] hover:text-[#212121]" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#616161] block mb-1">Nombre *</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E88E5]"
                value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#616161] block mb-1">Teléfono</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E88E5]"
                value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#616161] block mb-1">Email</label>
              <input type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E88E5]"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#616161] block mb-1">Fecha *</label>
              <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E88E5]"
                value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#616161] block mb-1">Cantidad de personas</label>
              <input type="number" min={1} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E88E5]"
                value={form.cantidad_personas} onChange={e => setForm(f => ({ ...f, cantidad_personas: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#616161] block mb-1">Hora inicio *</label>
              <input type="time" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E88E5]"
                value={form.hora_inicio} onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#616161] block mb-1">Hora fin *</label>
              <input type="time" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E88E5]"
                value={form.hora_fin} onChange={e => setForm(f => ({ ...f, hora_fin: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#616161] block mb-1">Motivo</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E88E5]"
                placeholder="Ej: Cumpleaños, Reunión, Evento..."
                value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#616161] block mb-1">Estado</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E88E5]"
                value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as Reserva['estado'] }))}>
                <option value="confirmada">Confirmada</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#616161] block mb-1">Observaciones</label>
              <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E88E5] min-h-[70px] resize-none"
                placeholder="Notas internas, condiciones especiales, señas, etc."
                value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={cerrarForm}
              className="text-sm px-4 py-2 rounded-xl border border-gray-200 text-[#616161] hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={guardarReserva} disabled={guardando}
              className="text-sm px-4 py-2 rounded-xl bg-[#1E88E5] text-white font-semibold hover:bg-[#1565C0] disabled:opacity-50">
              {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Guardar reserva'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {cargando ? (
          <div className="bg-white rounded-2xl p-8 text-center text-[#9E9E9E]">Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-[#9E9E9E]">No hay reservas.</div>
        ) : (
          filtradas.map(r => {
            const cfg = ESTADO_CONFIG[r.estado]
            const Icono = cfg.icono
            return (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${cfg.cls}`}>
                        <Icono size={12} />{cfg.label}
                      </span>
                      <span className="text-[#9E9E9E] text-xs">
                        Solicitado {new Date(r.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#212121]">{r.nombre}</h3>
                    <p className="text-sm text-[#616161]">
                      {new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}{r.hora_inicio?.slice(0, 5)}–{r.hora_fin?.slice(0, 5)}
                      {' · '}{r.motivo} ({r.cantidad_personas} personas)
                    </p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-[#9E9E9E]">
                      <a href={`tel:${r.telefono}`} className="hover:text-[#1E88E5]">{r.telefono}</a>
                      <a href={`mailto:${r.email}`} className="hover:text-[#1E88E5]">{r.email}</a>
                    </div>
                    {r.observaciones && (
                      <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5">
                        📝 {r.observaciones}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {r.estado !== 'confirmada' && (
                      <button onClick={() => cambiarEstado(r.id, 'confirmada')}
                        className="text-xs bg-green-100 text-green-700 hover:bg-green-200 font-semibold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors">
                        <CheckCircle size={14} /> Confirmar
                      </button>
                    )}
                    {r.estado !== 'cancelada' && (
                      <button onClick={() => cambiarEstado(r.id, 'cancelada')}
                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 font-semibold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors">
                        <XCircle size={14} /> Cancelar
                      </button>
                    )}
                    <button onClick={() => abrirEditar(r)}
                      className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors">
                      <Pencil size={14} /> Editar
                    </button>
                    {r.estado === 'cancelada' && (
                      <button onClick={() => eliminar(r.id)}
                        className="text-xs bg-red-100 text-red-700 hover:bg-red-200 font-semibold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors">
                        <Trash2 size={14} /> Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
