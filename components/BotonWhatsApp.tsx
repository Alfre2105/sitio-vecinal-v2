import Image from 'next/image'

export default function BotonWhatsApp() {
  const mensaje = encodeURIComponent(
    'Hola, soy vecino del Barrio General Mosconi y quisiera consultar...'
  )
  const url = `https://wa.me/5492975402989?text=${mensaje}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
      aria-label="Contactar por WhatsApp"
    >
      <Image src="/whatsapp.png" alt="WhatsApp" width={56} height={56} className="rounded-full" />
    </a>
  )
}
