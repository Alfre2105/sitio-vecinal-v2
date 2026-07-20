import Link from 'next/link'
import { LayoutDashboard, Newspaper, Calendar, Users, Building2, MessageSquare, BarChart3 } from 'lucide-react'
import AdminGuard from '@/components/AdminGuard'

const navAdmin = [
  { href: '/admin', label: 'Dashboard', icono: LayoutDashboard },
  { href: '/admin/noticias', label: 'Noticias', icono: Newspaper },
  { href: '/admin/reservas', label: 'Reservas salón', icono: Calendar },
  { href: '/admin/socios', label: 'Socios', icono: Users },
  { href: '/admin/actividades', label: 'Actividades', icono: BarChart3 },
  { href: '/admin/comision', label: 'Comisión', icono: Building2 },
  { href: '/admin/mensajes', label: 'Mensajes', icono: MessageSquare },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
    <div className="flex min-h-screen bg-[#F4F6F9]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1565C0] text-white flex-col hidden md:flex">
        <div className="p-6 border-b border-[#1E88E5]">
          <div className="font-bold text-lg leading-tight">Panel Admin</div>
          <div className="text-xs opacity-70 mt-1">Vecinal Gral. Mosconi</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navAdmin.map(({ href, label, icono: Icono }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1E88E5] transition-colors text-sm font-medium"
            >
              <Icono size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#1E88E5]">
          <Link href="/" className="text-xs opacity-70 hover:opacity-100 hover:underline">
            ← Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 overflow-auto">
        {/* Topbar mobile */}
        <div className="md:hidden bg-[#1565C0] text-white px-4 py-3 flex items-center justify-between">
          <span className="font-bold">Panel Admin</span>
          <Link href="/" className="text-xs opacity-80">← Sitio</Link>
        </div>

        {/* Nav mobile */}
        <div className="md:hidden bg-[#1E88E5] overflow-x-auto flex gap-1 px-3 py-2">
          {navAdmin.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-white text-xs whitespace-nowrap px-3 py-2 rounded-lg hover:bg-[#1565C0] shrink-0"
            >
              {label}
            </Link>
          ))}
        </div>

        <main className="p-6">{children}</main>
      </div>
    </div>
    </AdminGuard>
  )
}
