-- ============================================
-- Esquema Supabase - Asociación Vecinal General Mosconi
-- ============================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- NOTICIAS
CREATE TABLE IF NOT EXISTS noticias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  resumen TEXT NOT NULL,
  contenido TEXT NOT NULL,
  imagen_url TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('Seguridad', 'Comunidad', 'Obras', 'Servicios', 'Institucional')),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  publicada BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ACTIVIDADES
CREATE TABLE IF NOT EXISTS actividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  lugar TEXT NOT NULL,
  es_gratuita BOOLEAN NOT NULL DEFAULT true,
  precio DECIMAL(10,2),
  responsable TEXT NOT NULL,
  contacto_inscripcion TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RESERVAS DEL SALÓN
CREATE TABLE IF NOT EXISTS reservas_salon (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  motivo TEXT NOT NULL,
  cantidad_personas INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SOCIOS
CREATE TABLE IF NOT EXISTS socios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dni TEXT NOT NULL UNIQUE,
  numero_socio TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT UNIQUE,
  telefono TEXT,
  direccion TEXT,
  fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria TEXT NOT NULL DEFAULT 'activo' CHECK (categoria IN ('activo', 'cadete', 'vitalicio', 'honorario', 'adherente')),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CUOTAS
CREATE TABLE IF NOT EXISTS cuotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  socio_id UUID NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  anio INTEGER NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  pagada BOOLEAN NOT NULL DEFAULT false,
  fecha_pago DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(socio_id, mes, anio)
);

-- COMISIÓN DIRECTIVA
CREATE TABLE IF NOT EXISTS comision_directiva (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL,
  foto_url TEXT,
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true
);

-- COMERCIOS
CREATE TABLE IF NOT EXISTS comercios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  rubro TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  beneficio_socios TEXT,
  telefono TEXT,
  direccion TEXT,
  imagen_url TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MENSAJES DE CONTACTO
CREATE TABLE IF NOT EXISTS contacto_mensajes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('consulta', 'reclamo', 'sugerencia', 'otro')),
  mensaje TEXT NOT NULL,
  archivo_url TEXT,
  leido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HISTORIAL DEL BARRIO
CREATE TABLE IF NOT EXISTS historial_barrio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anio INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  imagen_url TEXT,
  orden INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- DATOS INICIALES - COMISIÓN DIRECTIVA
-- ============================================
INSERT INTO comision_directiva (nombre, rol, orden) VALUES
  ('Alfredo Alberto Gómez', 'Presidente', 1),
  ('Deflina González', 'Vicepresidenta', 2),
  ('María Ovejero', 'Tesorera', 3),
  ('Mirtha Di Clemente', 'Pro-tesorera', 4),
  ('María Cristina Saraiva', 'Secretaria', 5),
  ('Aida Martínez', 'Pro-secretaria', 6),
  ('Juan Manuel Cosentino', '1° Vocal', 7),
  ('Cristina González', '2° Vocal', 8),
  ('Julia Fernández', '3° Vocal', 9),
  ('Estela Carrizo', 'Vocal Suplente', 10),
  ('Silvana Ceda', 'Vocal Suplente', 11),
  ('Ingrid González', 'Vocal Suplente', 12),
  ('Laura Durante', 'Revisora de Cuentas (Titular)', 13),
  ('Ina Manso', 'Revisora de Cuentas (Titular)', 14),
  ('Nadia Arias', 'Revisora de Cuentas (Suplente)', 15);

-- ============================================
-- DATOS INICIALES - HISTORIAL DEL BARRIO
-- ============================================
INSERT INTO historial_barrio (anio, titulo, descripcion, orden) VALUES
  (1970, 'Fundación de la Asociación Vecinal', 'El 4 de octubre de 1970 se fundó formalmente la Asociación Vecinal General Mosconi, con el objetivo de representar y defender los intereses de los vecinos del barrio.', 1),
  (1975, 'Construcción del salón comunitario', 'Se levantó el primer salón comunitario que serviría de punto de encuentro para todas las actividades del barrio.', 2),
  (1990, 'Expansión de servicios', 'La Vecinal amplió sus servicios incorporando actividades deportivas, culturales y de contención social para los vecinos.', 3),
  (2000, 'Renovación de la comisión y nuevos proyectos', 'Una nueva comisión directiva tomó las riendas con proyectos de mejora de infraestructura barrial y ampliación de la cobertura social.', 4),
  (2010, 'Programa de seguridad barrial', 'Se lanzó el plan preventivo barrial en coordinación con las fuerzas de seguridad locales para mejorar la convivencia.', 5),
  (2024, 'Digitalización y nuevos canales', 'La Vecinal lanzó su presencia digital con sitio web y redes sociales para llegar a todos los vecinos.', 6);

-- ============================================
-- RLS (Row Level Security) - configuración básica
-- ============================================
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas_salon ENABLE ROW LEVEL SECURITY;
ALTER TABLE socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comision_directiva ENABLE ROW LEVEL SECURITY;
ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacto_mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_barrio ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (tablas públicas)
-- Nota: el filtro publicada=true para la portada pública se aplica en la query
-- de la app (app/page.tsx, app/noticias/[slug]/page.tsx), no en RLS, porque el
-- panel /admin/noticias (protegido por contraseña) necesita ver y gestionar borradores.
CREATE POLICY "Lectura de noticias" ON noticias FOR SELECT USING (true);
CREATE POLICY "Insertar noticias" ON noticias FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar noticias" ON noticias FOR UPDATE USING (true);
CREATE POLICY "Eliminar noticias" ON noticias FOR DELETE USING (true);
CREATE POLICY "Actividades son públicas" ON actividades FOR SELECT USING (true);
CREATE POLICY "Comisión es pública" ON comision_directiva FOR SELECT USING (activo = true);
CREATE POLICY "Comercios activos son públicos" ON comercios FOR SELECT USING (activo = true);
CREATE POLICY "Historial es público" ON historial_barrio FOR SELECT USING (true);

-- Cualquiera puede insertar mensajes de contacto y reservas
CREATE POLICY "Insertar mensajes de contacto" ON contacto_mensajes FOR INSERT WITH CHECK (true);
CREATE POLICY "Insertar reservas" ON reservas_salon FOR INSERT WITH CHECK (true);
-- Nota: en producción también se habilitaron SELECT y UPDATE en reservas_salon
-- para anon (agregado julio 2026, no reflejado aquí originalmente) para que el
-- panel admin pueda listar, confirmar/cancelar y editar reservas.
CREATE POLICY "Ver reservas" ON reservas_salon FOR SELECT USING (true);
CREATE POLICY "Actualizar reservas" ON reservas_salon FOR UPDATE USING (true);

-- Socios pueden ver sus propios datos (requiere auth configurada)
CREATE POLICY "Socios ven sus datos" ON socios FOR SELECT USING (true);
CREATE POLICY "Socios ven sus cuotas" ON cuotas FOR SELECT USING (true);
