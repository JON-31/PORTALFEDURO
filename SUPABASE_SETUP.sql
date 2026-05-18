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
