import { Resend } from 'resend'

// El SDK de Resend tira una excepcion sincronica en el constructor si la key
// viene vacia -- eso rompe el build (Next evalua este modulo al recolectar
// datos de las rutas /api/cron/notificaciones y /api/webhooks/resend aunque
// nunca se llamen). Con placeholder, construye sin problema y el error real
// (401 de Resend) recien aparece al intentar mandar un email de verdad.
export const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder')

export const EMAIL_REMITENTE = process.env.RESEND_FROM_EMAIL ?? 'Vecinal Gral. Mosconi <notificaciones@vecinalmosconi.org.ar>'
