import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BotonWhatsApp from '@/components/BotonWhatsApp'

export const metadata: Metadata = {
  title: 'Asociación Vecinal General Mosconi | Comodoro Rivadavia',
  description: 'Sitio oficial de la Asociación Vecinal General Mosconi, Comodoro Rivadavia, Chubut. Reserva el salón, área de socios, noticias y actividades del barrio.',
  keywords: ['vecinal', 'mosconi', 'comodoro rivadavia', 'barrio', 'chubut'],
  openGraph: {
    title: 'Asociación Vecinal General Mosconi',
    description: 'Representando a los vecinos del Barrio General Mosconi desde 1970.',
    locale: 'es_AR',
    type: 'website',
    url: 'https://vecinalmosconi.com.ar',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <BotonWhatsApp />
      </body>
    </html>
  )
}
