# TODO: Módulo de Auditoría

Funcionalidades pendientes para auditoria.html.

## 1. Lectura de tareas
- Consultar tabla `tareas` via `sbAdmin()` (disponible en shared.js)
- Filtrar por vendedor_nombre, tienda, estado, rango de fechas

## 2. Comparativa de inventario
- Mostrar inventario_sistema vs inventario_real por tarea completada
- Calcular diferencia y % de variación
- Resaltar discrepancias mayores al umbral configurable

## 3. Historial de cambios
- Listar tareas completadas ordenadas por fecha_completada DESC
- Agrupar por vendedor y por tienda

## 4. Exportación
- Botón "Exportar a Excel" usando SheetJS (ya en CDN en otros archivos)
- Exportar resultado filtrado como .xlsx

## 5. Navegación adicional
- Agregar nav-items al sidebar cuando se implementen los módulos
- `showView()` ya está listo para manejar múltiples vistas

## 6. Estado actual (actualizado 2026-05-29)
- `cerrarSesion()` ya usa `clearSession()` de shared.js + logout REST a Supabase Auth ✅
- `refreshSession()` ya se llama con `await` en DOMContentLoaded ✅
