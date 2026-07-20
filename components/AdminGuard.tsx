'use client'

import { useState, useEffect } from 'react'
import { Lock, LogOut } from 'lucide-react'

const STORAGE_KEY = 'admin_auth'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [autenticado, setAutenticado] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    const ok = sessionStorage.getItem(STORAGE_KEY)
    if (ok === 'true') setAutenticado(true)
    setCargando(false)
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const correcta = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    if (password === correcta) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setAutenticado(true)
      setError(false)
    } else {
      setError(true)
      setPassword('')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY)
    setAutenticado(false)
  }

  if (cargando) return null

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-[#E3F2FD] rounded-full flex items-center justify-center mb-3">
              <Lock size={28} className="text-[#1E88E5]" />
            </div>
            <h1 className="text-xl font-bold text-[#212121]">Panel de Administración</h1>
            <p className="text-sm text-[#9E9E9E] mt-1">Asociación Vecinal General Mosconi</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-[#616161] block mb-1">Contraseña</label>
              <input
                type="password"
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1E88E5]"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false) }}
                placeholder="Ingresá la contraseña"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm text-center">Contraseña incorrecta.</p>
            )}
            <button type="submit"
              className="bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold py-3 rounded-xl transition-colors">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      <button
        onClick={handleLogout}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white border border-gray-200 text-[#616161] text-xs font-semibold px-3 py-2 rounded-xl shadow hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
      >
        <LogOut size={14} /> Cerrar sesión
      </button>
    </>
  )
}
