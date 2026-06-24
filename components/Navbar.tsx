'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/quienes-somos', label: 'Quiénes somos' },
  { href: '/historia', label: 'Historia' },
  { href: '/actividades', label: 'Actividades' },
  { href: '/salon', label: 'Salón' },
  { href: '/socios', label: 'Área de Socios' },
  { href: '/seguridad', label: 'Seguridad' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[#1E88E5] shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-[#1E88E5] text-sm">
              AV
            </div>
            <div className="text-white leading-tight">
              <div className="font-bold text-sm">Vecinal</div>
              <div className="text-xs opacity-90">Gral. Mosconi</div>
            </div>
          </Link>

          {/* Links desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-white text-sm px-3 py-2 rounded hover:bg-[#1565C0] transition-colors whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Hamburger */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {open && (
        <div className="lg:hidden bg-[#1565C0] px-4 pb-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block text-white py-3 border-b border-[#1E88E5] text-base"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
