import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#1565C0] text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Identidad */}
          <div>
            <h3 className="font-bold text-lg mb-3">Asociación Vecinal<br />General Mosconi</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Representando a los vecinos del Barrio General Mosconi, Comodoro Rivadavia, desde 1970.
            </p>
            <div className="flex gap-4 mt-4 items-center">
              <a href="https://www.facebook.com/vecinalmosconikm3" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" aria-label="Facebook">
                <Image src="/facebook.png" alt="Facebook" width={32} height={32} />
              </a>
              <a href="https://www.instagram.com/asociacionvecinalmosconi" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" aria-label="Instagram">
                <Image src="/instagram.png" alt="Instagram" width={32} height={32} />
              </a>
              <a href="https://wa.me/5492975402989" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" aria-label="WhatsApp">
                <Image src="/whatsapp.png" alt="WhatsApp" width={32} height={32} />
              </a>
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="font-bold text-lg mb-3">Accesos rápidos</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/salon" className="hover:opacity-100 hover:underline">Reservar el salón</Link></li>
              <li><Link href="/socios" className="hover:opacity-100 hover:underline">Área de socios</Link></li>
              <li><Link href="/actividades" className="hover:opacity-100 hover:underline">Actividades</Link></li>
              <li><Link href="/quienes-somos" className="hover:opacity-100 hover:underline">Comisión directiva</Link></li>
              <li><Link href="/historia" className="hover:opacity-100 hover:underline">Historia del barrio</Link></li>
              <li><Link href="/admin" className="hover:opacity-100 hover:underline">Panel administrativo</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-bold text-lg mb-3">Contacto</h3>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>Petrolero San Lorenzo 40, Barrio General Mosconi, Comodoro Rivadavia, Chubut</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0" />
                <a href="mailto:vecinal.mosconi@gmail.com" className="hover:underline">
                  vecinal.mosconi@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" />
                <a href="tel:+5492975402989" className="hover:underline">
                  +54 297 540-2989
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1E88E5] mt-8 pt-6 text-center text-sm opacity-60">
          © {new Date().getFullYear()} Asociación Vecinal General Mosconi · Todos los derechos reservados
        </div>
      </div>
    </footer>
  )
}
