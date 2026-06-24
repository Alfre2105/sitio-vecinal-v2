import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      noticias: {
        Row: {
          id: string
          titulo: string
          resumen: string
          contenido: string
          imagen_url: string | null
          categoria: 'Seguridad' | 'Comunidad' | 'Obras' | 'Servicios' | 'Institucional'
          fecha: string
          publicada: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['noticias']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['noticias']['Insert']>
      }
      actividades: {
        Row: {
          id: string
          titulo: string
          descripcion: string
          fecha: string
          hora_inicio: string
          hora_fin: string
          lugar: string
          es_gratuita: boolean
          precio: number | null
          responsable: string
          contacto_inscripcion: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['actividades']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['actividades']['Insert']>
      }
      reservas_salon: {
        Row: {
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
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reservas_salon']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reservas_salon']['Insert']>
      }
      socios: {
        Row: {
          id: string
          dni: string
          numero_socio: string
          nombre: string
          apellido: string
          email: string | null
          telefono: string | null
          direccion: string | null
          fecha_ingreso: string
          categoria: 'activo' | 'cadete' | 'vitalicio' | 'honorario' | 'adherente'
          activo: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['socios']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['socios']['Insert']>
      }
      cuotas: {
        Row: {
          id: string
          socio_id: string
          mes: number
          anio: number
          monto: number
          pagada: boolean
          fecha_pago: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cuotas']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['cuotas']['Insert']>
      }
      comision_directiva: {
        Row: {
          id: string
          nombre: string
          rol: string
          foto_url: string | null
          descripcion: string | null
          orden: number
          activo: boolean
        }
        Insert: Omit<Database['public']['Tables']['comision_directiva']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['comision_directiva']['Insert']>
      }
      comercios: {
        Row: {
          id: string
          nombre: string
          rubro: string
          descripcion: string
          beneficio_socios: string | null
          telefono: string | null
          direccion: string | null
          imagen_url: string | null
          activo: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['comercios']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['comercios']['Insert']>
      }
      contacto_mensajes: {
        Row: {
          id: string
          nombre: string
          email: string
          categoria: 'consulta' | 'reclamo' | 'sugerencia' | 'otro'
          mensaje: string
          archivo_url: string | null
          leido: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['contacto_mensajes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['contacto_mensajes']['Insert']>
      }
      historial_barrio: {
        Row: {
          id: string
          anio: number
          titulo: string
          descripcion: string
          imagen_url: string | null
          orden: number
        }
        Insert: Omit<Database['public']['Tables']['historial_barrio']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['historial_barrio']['Insert']>
      }
    }
  }
}
