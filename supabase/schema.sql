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
-- fecha/hora_inicio/hora_fin/lugar/responsable/contacto_inscripcion son NULL
-- mientras la actividad esta "pendiente" (propuesta de un vecino todavia sin
-- revisar) porque esos datos se completan cuando la Vecinal la aprueba.
CREATE TABLE IF NOT EXISTS actividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  fecha DATE,
  hora_inicio TIME,
  hora_fin TIME,
  lugar TEXT,
  es_gratuita BOOLEAN NOT NULL DEFAULT true,
  precio DECIMAL(10,2),
  responsable TEXT,
  contacto_inscripcion TEXT,
  imagen_url TEXT,
  origen TEXT NOT NULL DEFAULT 'vecinal' CHECK (origen IN ('vecinal', 'vecino')),
  estado TEXT NOT NULL DEFAULT 'aprobada' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  nombre_propone TEXT,
  contacto_propone TEXT,
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
-- dni_foto_frente_url, dni_foto_dorso_url y comprobante_domicilio_url guardan
-- la RUTA dentro del bucket privado "socios-documentos" (no una URL pública)
-- — se resuelven a un link firmado y temporal solo desde el panel admin,
-- via /api/documento-socio.
CREATE TABLE IF NOT EXISTS socios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dni TEXT NOT NULL UNIQUE,
  numero_socio TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT UNIQUE,
  telefono TEXT,
  direccion TEXT,
  fecha_nacimiento DATE,
  dni_foto_frente_url TEXT,
  dni_foto_dorso_url TEXT,
  comprobante_domicilio_url TEXT,
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

-- NOTIFICACIONES AUTOMATICAS DE CUOTAS
-- email_invalido se pone en true desde /api/webhooks/resend cuando un envio
-- rebota (email inexistente/lleno/etc). Mientras este en true, el cron de
-- /api/cron/notificaciones deja de intentarle mandar mail a ese socio -- ver
-- lib/notificaciones.ts para la logica de que aviso le toca a cada quien.
ALTER TABLE socios ADD COLUMN IF NOT EXISTS email_invalido BOOLEAN NOT NULL DEFAULT false;

-- Un registro por cada aviso efectivamente disparado (o intentado). Sirve
-- para no reenviar el mismo aviso dos veces (se busca por socio_id+tipo+mes+anio
-- antes de mandar) y como historial visible en /admin/notificaciones.
-- resend_email_id guarda el id que devuelve Resend al enviar, para poder
-- cruzarlo con los webhooks de rebote y marcar el registro como 'rebotado'.
CREATE TABLE IF NOT EXISTS notificaciones_enviadas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  socio_id UUID NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('proximo_vencimiento', 'vencida', 'recordatorio_deuda')),
  canal TEXT NOT NULL DEFAULT 'email' CHECK (canal IN ('email', 'whatsapp')),
  estado TEXT NOT NULL DEFAULT 'enviado' CHECK (estado IN ('enviado', 'fallido', 'rebotado')),
  mes INTEGER,
  anio INTEGER,
  detalle TEXT,
  resend_email_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TALLERES
-- El dia/horario detallado de cada taller vive en las tablas de grilla
-- semanal (hardcodeadas en app/actividades/page.tsx), no aca — la tarjeta
-- de taller solo muestra nombre/profesor/telefono/descripcion/foto/es_gratuito.
CREATE TABLE IF NOT EXISTS talleres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  profesor TEXT,
  telefono TEXT,
  descripcion TEXT,
  foto_url TEXT,
  es_gratuito BOOLEAN NOT NULL DEFAULT true,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
-- Mismo patron que actividades: el comercio puede anotarse solo desde el
-- sitio (origen='comercio', estado='pendiente', datos minimos) o cargarlo
-- la Vecinal directo (origen='vecinal', estado='aprobado' de una). Una vez
-- aprobado sigue siendo editable en cualquier momento porque las ofertas
-- (beneficio_socios) cambian semana a semana o mes a mes.
CREATE TABLE IF NOT EXISTS comercios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  rubro TEXT NOT NULL,
  descripcion TEXT,
  beneficio_socios TEXT,
  telefono TEXT,
  direccion TEXT,
  imagen_url TEXT,
  origen TEXT NOT NULL DEFAULT 'vecinal' CHECK (origen IN ('vecinal', 'comercio')),
  estado TEXT NOT NULL DEFAULT 'aprobado' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  contacto_nombre TEXT,
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

-- REPORTES DE INCIDENTES DE SEGURIDAD
-- Formulario dedicado en /seguridad, separado de contacto_mensajes para que
-- la Vecinal pueda distinguir y priorizar reportes de seguridad del resto de
-- los mensajes. nombre/contacto son opcionales para permitir reporte anonimo.
CREATE TABLE IF NOT EXISTS incidentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL CHECK (tipo IN ('robo', 'intento_robo', 'sospechoso', 'vandalismo', 'disturbios', 'otro')),
  ubicacion TEXT NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  descripcion TEXT NOT NULL,
  nombre TEXT,
  contacto TEXT,
  revisado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ENLACES DE INTERES
-- Sitios externos utiles para los vecinos (cooperativa, ENCoSeP, municipio,
-- etc.), mostrados en el footer. Sin flujo de aprobacion, siempre lo carga
-- la Vecinal directo.
CREATE TABLE IF NOT EXISTS enlaces_interes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  url TEXT NOT NULL,
  descripcion TEXT,
  icono_url TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
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

-- RECUERDOS DEL BARRIO
-- Fotos que los vecinos comparten por WhatsApp (boton en /historia) y que
-- la Vecinal sube manualmente desde /admin/recuerdos, con una descripcion
-- corta. No hay formulario publico de carga, es siempre carga manual.
CREATE TABLE IF NOT EXISTS recuerdos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  foto_url TEXT NOT NULL,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
ALTER TABLE talleres ENABLE ROW LEVEL SECURITY;
ALTER TABLE recuerdos ENABLE ROW LEVEL SECURITY;
ALTER TABLE enlaces_interes ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (tablas públicas)
-- Nota: el filtro publicada=true para la portada pública se aplica en la query
-- de la app (app/page.tsx, app/noticias/[slug]/page.tsx), no en RLS, porque el
-- panel /admin/noticias (protegido por contraseña) necesita ver y gestionar borradores.
CREATE POLICY "Lectura de noticias" ON noticias FOR SELECT USING (true);
CREATE POLICY "Insertar noticias" ON noticias FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar noticias" ON noticias FOR UPDATE USING (true);
CREATE POLICY "Eliminar noticias" ON noticias FOR DELETE USING (true);
-- Nota: el filtro estado='aprobada' para el publico se aplica en la query de
-- la app (app/page.tsx, app/actividades/page.tsx), no en RLS, porque el panel
-- /admin/actividades necesita ver y moderar las propuestas pendientes/rechazadas,
-- y el formulario publico de propuestas necesita poder insertar (estado='pendiente').
CREATE POLICY "Lectura de actividades" ON actividades FOR SELECT USING (true);
CREATE POLICY "Insertar actividades" ON actividades FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar actividades" ON actividades FOR UPDATE USING (true);
CREATE POLICY "Eliminar actividades" ON actividades FOR DELETE USING (true);
CREATE POLICY "Comisión es pública" ON comision_directiva FOR SELECT USING (activo = true);
-- Editar foto_url y activo/inactivo desde /admin/comision, mismo patron de
-- RLS abierto que el resto del panel admin
CREATE POLICY "Actualizar comision" ON comision_directiva FOR UPDATE USING (true);
-- Talleres: lectura publica (el filtro activo=true para el sitio se aplica
-- en la query, no en RLS, porque /admin/talleres necesita ver los inactivos)
-- y alta/edicion/baja desde /admin/talleres, mismo patron de RLS abierto
-- que el resto del panel admin.
CREATE POLICY "Lectura de talleres" ON talleres FOR SELECT USING (true);
CREATE POLICY "Insertar talleres" ON talleres FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar talleres" ON talleres FOR UPDATE USING (true);
CREATE POLICY "Eliminar talleres" ON talleres FOR DELETE USING (true);
-- Recuerdos: lectura publica (el filtro activo=true para el sitio se aplica
-- en la query, no en RLS, mismo patron que noticias/actividades/talleres) y
-- alta/edicion/baja desde /admin/recuerdos
CREATE POLICY "Lectura de recuerdos" ON recuerdos FOR SELECT USING (true);
CREATE POLICY "Insertar recuerdos" ON recuerdos FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar recuerdos" ON recuerdos FOR UPDATE USING (true);
CREATE POLICY "Eliminar recuerdos" ON recuerdos FOR DELETE USING (true);
CREATE POLICY "Lectura de enlaces" ON enlaces_interes FOR SELECT USING (true);
CREATE POLICY "Insertar enlaces" ON enlaces_interes FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar enlaces" ON enlaces_interes FOR UPDATE USING (true);
CREATE POLICY "Eliminar enlaces" ON enlaces_interes FOR DELETE USING (true);
-- Lectura abierta (el filtro estado='aprobado'/activo=true para el sitio se
-- aplica en la query, no en RLS, porque /admin/comercios necesita ver
-- pendientes/inactivos) y alta/edicion/baja desde /admin/comercios. INSERT
-- publico habilitado para el formulario de "Anotá tu comercio".
CREATE POLICY "Lectura de comercios" ON comercios FOR SELECT USING (true);
CREATE POLICY "Insertar comercios" ON comercios FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar comercios" ON comercios FOR UPDATE USING (true);
CREATE POLICY "Eliminar comercios" ON comercios FOR DELETE USING (true);
CREATE POLICY "Historial es público" ON historial_barrio FOR SELECT USING (true);

-- Cualquiera puede insertar mensajes de contacto y reservas
CREATE POLICY "Insertar mensajes de contacto" ON contacto_mensajes FOR INSERT WITH CHECK (true);
CREATE POLICY "Insertar reservas" ON reservas_salon FOR INSERT WITH CHECK (true);
-- Incidentes: insert publico desde /seguridad (permite reporte anonimo, sin
-- nombre/contacto) y lectura/actualizacion (marcar revisado) desde
-- /admin/incidentes, mismo patron de RLS abierto que el resto del panel admin.
ALTER TABLE incidentes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insertar incidentes" ON incidentes FOR INSERT WITH CHECK (true);
CREATE POLICY "Lectura de incidentes" ON incidentes FOR SELECT USING (true);
CREATE POLICY "Actualizar incidentes" ON incidentes FOR UPDATE USING (true);
CREATE POLICY "Eliminar incidentes" ON incidentes FOR DELETE USING (true);
-- Nota: en producción también se habilitaron SELECT y UPDATE en reservas_salon
-- para anon (agregado julio 2026, no reflejado aquí originalmente) para que el
-- panel admin pueda listar, confirmar/cancelar y editar reservas.
CREATE POLICY "Ver reservas" ON reservas_salon FOR SELECT USING (true);
CREATE POLICY "Actualizar reservas" ON reservas_salon FOR UPDATE USING (true);

-- Socios pueden ver sus propios datos (requiere auth configurada)
CREATE POLICY "Socios ven sus datos" ON socios FOR SELECT USING (true);
CREATE POLICY "Socios ven sus cuotas" ON cuotas FOR SELECT USING (true);
-- Insertar (adhesion publica via /api/adhesion con service role), y
-- actualizar/eliminar (aprobar/rechazar solicitudes) desde /admin/socios
CREATE POLICY "Insertar socios" ON socios FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar socios" ON socios FOR UPDATE USING (true);
CREATE POLICY "Eliminar socios" ON socios FOR DELETE USING (true);
-- Carga y edicion de cuotas (generar meses, marcar pagada/no pagada, ajustar
-- monto) desde /admin/socios, mismo patron de RLS abierto que el resto del
-- panel admin (el gate real es la contraseña client-side de AdminGuard)
CREATE POLICY "Insertar cuotas" ON cuotas FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar cuotas" ON cuotas FOR UPDATE USING (true);

-- Notificaciones de cuotas: el cron y el webhook usan la service role key
-- (bypassea RLS), pero /admin/notificaciones lee el historial con el cliente
-- anon, mismo patron abierto que el resto del panel.
ALTER TABLE notificaciones_enviadas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insertar notificaciones" ON notificaciones_enviadas FOR INSERT WITH CHECK (true);
CREATE POLICY "Lectura de notificaciones" ON notificaciones_enviadas FOR SELECT USING (true);
CREATE POLICY "Actualizar notificaciones" ON notificaciones_enviadas FOR UPDATE USING (true);
