-- ============================================================
-- FEDURO|MARS — PORTALDEVENTAS
-- Ejecutar en Supabase > SQL Editor
-- ============================================================

-- Tabla tareas
CREATE TABLE IF NOT EXISTS tareas (
  id                 SERIAL PRIMARY KEY,
  vendedor_nombre    TEXT NOT NULL,
  tienda             TEXT NOT NULL,
  producto           TEXT NOT NULL,
  inventario_sistema NUMERIC DEFAULT 0,
  inventario_real    NUMERIC,
  estado             TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente','completada')),
  fecha_asignacion   TIMESTAMPTZ DEFAULT NOW(),
  fecha_completada   TIMESTAMPTZ
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_tareas_vendedor ON tareas(vendedor_nombre);
CREATE INDEX IF NOT EXISTS idx_tareas_estado   ON tareas(estado);

-- Row Level Security (RLS) — recomendado para producción
-- ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "vendors_own_tasks" ON tareas FOR SELECT USING (true);
-- CREATE POLICY "admins_full"       ON tareas FOR ALL   USING (true);

-- ============================================================
-- VERIFICAR QUE EXISTE LA TABLA configuracion
-- (ya debe existir en tu Supabase)
-- ============================================================
-- SELECT * FROM configuracion LIMIT 1;

-- ============================================================
-- DATOS DE PRUEBA (opcional — eliminar antes de producción)
-- ============================================================
-- INSERT INTO tareas (vendedor_nombre, tienda, producto, inventario_sistema, estado)
-- VALUES
--   ('JONATAN SANTAMARIA', 'XTRA ALBROOK', 'SNICKERS 40G', 0, 'pendiente'),
--   ('JONATAN SANTAMARIA', 'XTRA TRANSISTMICA', 'M&MS PEANUT 46G', 3, 'pendiente');

-- ============================================================
-- TABLA usuarios — autenticación unificada por rol
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id         SERIAL PRIMARY KEY,
  username   TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  nombre     TEXT NOT NULL,
  rol        TEXT NOT NULL CHECK (rol IN ('vendedor','admin','admin-visual','auditoria')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_usuarios" ON usuarios
  FOR SELECT USING (true);

-- ============================================================
-- TABLA configuracion — parámetros del sistema
-- ============================================================
CREATE TABLE IF NOT EXISTS configuracion (
  id         SERIAL PRIMARY KEY,
  clave      TEXT NOT NULL UNIQUE,
  valor      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_configuracion" ON configuracion
  FOR SELECT USING (true);

-- ============================================================
-- USUARIOS ADMINISTRADORES (ejecutar una sola vez)
-- ============================================================
INSERT INTO usuarios (username, password, nombre, rol) VALUES
  ('admin',         'Feduromars2026', 'ADMIN',        'admin'),
  ('administrador', 'Feduromars2026', 'ADMINISTRADOR','admin-visual'),
  ('auditoria',     'Yvarona2026',    'AUDITORIA',    'auditoria')
ON CONFLICT (username) DO NOTHING;
