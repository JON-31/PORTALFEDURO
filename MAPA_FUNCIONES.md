# MAPA DE FUNCIONES — FEDURO|MARS PORTALFEDURO

Generado: 2026-05-22  
Archivos activos: `shared.js`, `index.html`, `admin-datos.html`, `admin-visual.html`, `vendedor.html`, `auditoria.html`  
Archivos legacy (no documentados): `MARS_FUSIONADO.html`, `HTML1_vendedores.html`

---

## 1. AUTENTICACIÓN Y SESIÓN

### `shared.js`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `getSession()` | 8 | Lee `mars_portal_session` de localStorage y lo parsea como JSON | `localStorage` | Todos los HTML al verificar si hay sesión activa |
| `saveSession(rol, nombre, username, access_token, refresh_token, expires_in)` | 12 | Guarda sesión unificada en localStorage con `expires_at` en milisegundos | `localStorage` | `index.html → doLogin()` |
| `clearSession()` | 26 | Elimina la clave `mars_portal_session` de localStorage | `localStorage` | `admin-datos.html → cerrarSesionAdmin()`, `admin-visual.html → cerrarSesionAdmin()`, `vendedor.html → cerrarSesion()` |

### `index.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `doLogin()` | 111 | Consulta tabla `usuarios` con username+password, obtiene JWT para vendedores via Supabase Auth, guarda sesión y redirige según `rol` | `shared.js → saveSession()`, `SB_URL`, tabla `usuarios` | Botón "Ingresar" y tecla Enter |

### `admin-datos.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `init()` | 2207 | Punto de entrada del panel admin: inicializa fecha, llama a todas las subsecciones y carga datos de Supabase | `initVendedores()`, `initTiendas()`, `initInventario()`, `initAuditoria()`, `renderDashboard()`, `renderDashboardFromSupabase()`, `renderOfertasFromSupabase()` | `DOMContentLoaded` |
| `cerrarSesionAdmin()` | 2201 | Llama `clearSession()` y redirige a `index.html` | `shared.js → clearSession()` | Botón "Salir" del sidebar |

### `admin-visual.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `init()` | 1932 | Punto de entrada del panel admin-visual | `initVendedores()`, `initTiendas()`, `renderDashboardFromSupabase()`, `renderOfertasFromSupabase()` | `DOMContentLoaded` via `setTimeout(init, 100)` |
| `cerrarSesionAdmin()` | 1926 | Llama `clearSession()` y redirige a `index.html` | `shared.js → clearSession()` | Botón "Salir" del sidebar |

### `vendedor.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `iniciarSesionVendedor(nombreCompleto)` | 929 | Carga inventario de Supabase, filtra por nombre del vendedor, inicializa todas las vistas | `sbGetV()`, `INV_DATA_V`, `renderDashboard()`, `cargarTareasCount()`, `renderOfertas()` | `DOMContentLoaded` al leer sesión |
| `doLogin()` | 918 | Redirige a `index.html` (el login real está en index.html) | — | Botón login si la sesión expiró |
| `cerrarSesion()` | 961 | Llama `clearSession()`, redirige a `index.html` | `shared.js → clearSession()` | Botón "Salir" |
| `resetInactivityTimer()` | 980 | Reinicia el temporizador de inactividad | `_inactivityTimer` | Eventos de actividad del usuario |
| `clearInactivityTimer()` | 990 | Detiene el temporizador de inactividad | `_inactivityTimer` | `cerrarSesion()` |
| `startInactivityWatch()` | 991 | Activa el watcher de inactividad (10 min → cierra sesión automáticamente) | `resetInactivityTimer()`, `cerrarSesion()` | `iniciarSesionVendedor()` |

### `auditoria.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `cerrarSesion()` | 122 | Elimina `mars_portal_session` y redirige a `index.html` — **usa `localStorage.removeItem` directo en vez de `clearSession()`** | `localStorage` | Botón "Salir" |

---

## 2. LECTURA DE DATOS (Supabase)

### `shared.js`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `sbGet(endpoint)` | 31 | GET a Supabase REST con `window.MARS_TOKEN \|\| ANON_KEY`; retorna array o `[]` | `SB_URL`, `ANON_KEY`, `window.MARS_TOKEN` | `admin-datos.html`, `admin-visual.html` (para configuracion, no para tareas) |
| `sbAdmin(method, ep, body)` | 52 | Fetch genérico (GET/POST/PATCH/DELETE) a Supabase; usa JWT de sesión si está vigente, sino ANON_KEY | `getSession()`, `SB_URL`, `ANON_KEY` | `admin-datos.html`, `admin-visual.html` (para tareas y configuracion protegida) |

### `vendedor.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `sbGetV(ep)` | 904 | GET a Supabase con ANON_KEY (sin JWT de vendedor) | `SB_URL`, `ANON_KEY` | `iniciarSesionVendedor()`, `renderOfertas()`, `cargarBodegaVendedor()` |
| `sbGetVAuth(ep)` | 2314 | GET a Supabase con JWT del vendedor (`SESSION_TOKEN`) — requerido para leer tareas propias | `SB_URL`, `SESSION_TOKEN` | `cargarTareasCount()`, `renderTareas()` |
| `cargarTareasCount()` | 2335 | Cuenta tareas pendientes y completadas del vendedor, actualiza el badge del dashboard. Usa `ilike.` (case-insensitive) + `.trim().toUpperCase()` para resistir diferencias de case en `usuarios.nombre` vs `tareas.vendedor_nombre` | `sbGetVAuth()`, `VENDOR_ACTUAL` | `iniciarSesionVendedor()`, `completarTarea()` |

### `admin-datos.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `renderDashboardFromSupabase()` | 2056 | Lee `configuracion[inventario]` y renderiza métricas del dashboard | `sbGet()` | `init()`, `showView('dashboard')` |
| `renderOfertasFromSupabase()` | 2130 | Lee `configuracion[ofertas]` y renderiza la lista de ofertas en vista admin | `sbGet()` | `init()` |
| `cargarOfertasGuardadas()` | 1998 | Lee `configuracion[ofertas]` y llena el formulario de gestión de ofertas | `sbGet()` | `initGestionOfertas()` |
| `cargarBodegaData()` | 2332 | Lee `configuracion[inventario_bodega]` y llena la tabla de bodega | `sbGet()` | `addBodegaRow()` |
| `cdCargarConteo(tipo)` | 3808 | Cuenta registros de `tareas` o `reportes` para mostrar en el Centro de Descargas | `sbGet()`, `sbAdmin()` | `cdInicializar()` |
| `cdCargar(tipo)` | 3818 | Carga datos completos de `tareas`, `inventario` o `machetazo` para previsualizar | `sbAdmin()`, `sbGet()` | `cdToggle()` |
| `gtInicializar()` | 4081 | Lee `configuracion[inventario]` y llena `GT_INV_DATA` para la pantalla Gestionar Tareas | `sbAdmin()` | `showView('gestionar-tareas')` |

### `admin-visual.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `cargarDataActual()` | 1543 | Lee `configuracion[inventario]` y llena la tabla editable de inventario | `sbGet()` | `init()` o botón refrescar |
| `gtInicializar()` | 3484 | Lee `configuracion[inventario]` y popula lista de vendedores para Gestionar Tareas | `sbAdmin()` | `showView('gestionar-tareas')` |

---

## 3. ESCRITURA DE DATOS (Supabase)

### `shared.js`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `sbUpsert(table, data)` | 41 | POST con `Prefer: resolution=merge-duplicates` — insert o update según `clave` | `SB_URL`, `ANON_KEY`, `window.MARS_TOKEN` | `admin-datos.html`, `admin-visual.html` (para `configuracion`) |

### `vendedor.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `sbPatchV(ep, body)` | 2323 | PATCH a Supabase con JWT del vendedor — solo puede actualizar sus propias tareas | `SB_URL`, `SESSION_TOKEN` | `completarTarea()` |
| `completarTarea(id)` | 2412 | Lee el input de inventario real, hace PATCH en `tareas` con `inventario_real`, `estado='completada'`, `fecha_completada` | `sbPatchV()`, tabla `tareas` | Botón "Completar" en cada tarea |

### `admin-datos.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `adSubirLotes()` | 3714 | Lee datos existentes de `configuracion[inventario]`, reemplaza solo la cadena actual y guarda el JSON fusionado | `sbGet()`, `sbUpsert()`, `AD_RECORDS` | Botón "Subir a Supabase" en Actualizar Data |
| `adLimpiarCadena()` | 3748 | Elimina registros de una cadena específica de `configuracion[inventario]` sin tocar otras cadenas | `sbGet()`, `sbUpsert()`, `AD_RECORDS` | Botón "Limpiar Cadena" |
| `guardarOfertas()` | 1964 | Guarda lista de ofertas en `configuracion[ofertas]` | `sbUpsert()`, `ofertasList` | Botón "Guardar Ofertas" |
| `eliminarOfertaGuardada(i)` | 2029 | Elimina una oferta del array guardado en `configuracion[ofertas]` | `sbGet()`, `sbUpsert()` | Botón "Eliminar" en cada oferta |
| `guardarBodegaData()` | 2304 | Guarda datos de bodega en `configuracion[inventario_bodega]` | `sbUpsert()`, `parseBodegaData()` | Botón "Guardar Bodega" |
| `gtSubirTareas()` | 4051 | Inserta array de tareas en tabla `tareas` de Supabase | `sbAdmin('POST', '/tareas', ...)`, `TIENDAS_VENDEDORES` | Botón "Asignar Tareas" en Gestionar Tareas |
| `cdDescargar(tipo)` | 3870 | Descarga datos de `tareas`, `inventario` o `machetazo` como archivo Excel usando SheetJS. Tareas incluye: Vendedor, Tienda, Producto, Inv. Sistema, **Inv. Real**, Estado, Fecha | `CD_DATA`, `XLSX` | Botón "Descargar Excel" en Centro de Descargas |
| `cdEliminar(tipo)` | 3891 | Elimina TODOS los registros de `tareas` o `reportes` (con confirmación) | `sbAdmin('DELETE', ...)` | Botón "Eliminar Data" en Centro de Descargas |

### `admin-visual.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `guardarInventarioData()` | 1557 | Guarda tabla editable de inventario en `configuracion[inventario]` | `sbUpsert()`, `parseDataRows()` | Botón "Guardar Inventario" |
| `guardarOfertas()` | 1689 | Guarda lista de ofertas en `configuracion[ofertas]` | `sbUpsert()`, `ofertasList` | Botón "Guardar Ofertas" |
| `guardarBodegaData()` | 2110 | Guarda datos de bodega en `configuracion[inventario_bodega]` | `sbUpsert()`, `parseBodegaData()` | Botón "Guardar Bodega" |
| `gtAsignarTareas()` | 3465 | Inserta tareas seleccionadas en tabla `tareas` | `sbAdmin('POST', '/tareas', ...)`, `GT_INV_DATA` | Botón "Asignar Tareas" |
| `cdEliminar(tipo)` | 3518 | Elimina registros de `tareas` o `inventario` (con confirmación) | `sbAdmin('DELETE', ...)` | Botón "Eliminar Data" |

---

## 4. MAPEO TIENDAS → VENDEDOR

Todas las estructuras y funciones de esta sección están **duplicadas** entre `admin-datos.html` y `admin-visual.html`. Si se modifica un vendedor, debe actualizarse en ambos archivos.

### Estructuras de datos

| Nombre | Archivo | Línea | Cadena | Descripción |
|--------|---------|-------|--------|-------------|
| `TIENDAS_VENDEDORES` | admin-datos.html, admin-visual.html | 1243 / ~900 | XTRA | Objeto `{"Nombre Tienda - TCOD": "VENDEDOR"}`. Lookup por clave exacta. 38 tiendas. |
| `MACHETAZO_TIENDAS` | admin-datos.html, admin-visual.html, vendedor.html | 2377 / 2273 / 1308 | GOLY | Array `[{n, v, col, colLetter, store}]`. Incluye número de columna en el Excel. 11 tiendas. |
| `MACHETAZO_LUT` | admin-datos.html | 3547 | GOLY | Objeto con múltiples aliases por tienda (nombre corto, nombre legal, nombre GOLY). Para matching flexible. |
| `TIENDAS_REY` | admin-datos.html, admin-visual.html, vendedor.html | 2542 / 2438 / 1578 | Super Rey | Array `[{id, n, v}]`. 25 tiendas. |
| `TIENDAS_INGRESO` | admin-datos.html | 2570 | Todas | Array completo multi-cadena (80+ entradas: XTRA, REY, GOLY, Riba Smith, Ricamar). Usado para búsqueda fuzzy. |
| `MACHETAZO_NOMBRE_MAP` | admin-datos.html | 3664 | GOLY | Objeto inline en `adProcessFile()` que convierte nombres cortos del Excel (ej: `SAN MIGUELITO`) al formato GOLY (ej: `GOLY SAN MIGUELITO`). |
| `MACHETAZO_USERS` | vendedor.html | ~953 | GOLY | **Derivado dinámicamente** de `MACHETAZO_TIENDAS.map(t => t.v)` — ya NO es un array hardcodeado. Controla visibilidad del tab Machetazo en el menú del vendedor. La comparación contra `VENDOR_ACTUAL` usa normalización en ambos lados: `.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'')`. **Fix 2026-05-22**: antes era case-sensitive y causaba que el tab Machetazo no apareciera. |

### Funciones de lookup

| Función | Archivo | Línea | Qué hace | Depende de | La usan |
|---------|---------|-------|----------|-----------|---------|
| `buscarVendedorPorTienda(tienda)` | admin-datos.html, admin-visual.html | 2225 / 1950 | Lookup universal en 4 pasos: (1) busca en `MACHETAZO_TIENDAS`, (2) extrae código T### con regex y busca en `TIENDAS_INGRESO`, (3) búsqueda fuzzy por palabras clave ignorando genéricas, (4) retorna `''` si falla | `MACHETAZO_TIENDAS`, `TIENDAS_INGRESO`, `TIENDAS_REY`, `normStr()` | `admin-visual.html → guardarInventarioData()`, `admin-visual.html → buildRowHTML()`, formulario de inventario manual |
| `buscarVendedorMachetazo(tienda)` | admin-datos.html | 3561 | Busca en `MACHETAZO_LUT`: exact match primero, luego substring bidireccional | `MACHETAZO_LUT` | `adProcessFile()` al procesar Excel de cadena `machetazo` |
| `normStr(s)` | admin-datos.html, admin-visual.html | 2220 / 1945 | Normaliza texto a MAYÚSCULAS sin tildes ni Ñ para comparaciones insensibles a acentos | — | `buscarVendedorPorTienda()` |
| `gtTiendaChanged()` | admin-datos.html | 4015 | Al seleccionar una tienda en Gestionar Tareas, auto-selecciona el vendedor usando `TIENDAS_VENDEDORES` | `TIENDAS_VENDEDORES` | `<select>` de tienda en Gestionar Tareas |
| `gtCadenaChanged()` | admin-datos.html | 3938 | Filtra tiendas por cadena seleccionada usando `GT_CADENAS` (objeto de filtros). Muestra checkboxes de tiendas | `GT_INV_DATA`, `GT_CADENAS` | `<select>` de cadena en Gestionar Tareas |

---

## 5. PROCESAMIENTO DE EXCEL

### `admin-datos.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `adProcessFile(input)` | 3567 | Lee un archivo Excel con SheetJS, detecta columnas por nombre, construye `AD_RECORDS[]` según la cadena seleccionada (`xtra`, `machetazo`, `ricamar`, `ribasmith`, `rey`). Para XTRA: construye lookup normalizado (`tvNorm`) aplicando `normStr()` a las claves de `TIENDAS_VENDEDORES`, luego asigna vendedor como `tvNorm[normStr(tienda)] \|\| buscarVendedorPorTienda(tienda)` — resiste MAYÚSCULAS y tildes del Excel. Para Machetazo usa `buscarVendedorMachetazo()` + `MACHETAZO_NOMBRE_MAP`. | `XLSX`, `TIENDAS_VENDEDORES`, `normStr()`, `buscarVendedorPorTienda()`, `buscarVendedorMachetazo()`, `MACHETAZO_NOMBRE_MAP`, `AD_RECORDS` | Input file "Seleccionar Excel" |
| `adSubirLotes()` | 3714 | Toma `AD_RECORDS[]` ya construido, fusiona con datos existentes de Supabase (preserva otras cadenas), guarda en `configuracion[inventario]` | `AD_RECORDS`, `sbGet()`, `sbUpsert()` | Botón "Subir a Supabase" |
| `adCadenaChanged()` | 3531 | Resetea `AD_RECORDS` y actualiza la UI cuando se cambia la cadena seleccionada | `AD_RECORDS` | `<select>` de cadena en Actualizar Data |
| `adLimpiarCadena()` | 3748 | Elimina registros de una cadena de `configuracion[inventario]` sin tocar otras | `sbGet()`, `sbUpsert()` | Botón "Limpiar Cadena" |
| `parseBodegaData()` | 2281 | Lee las filas del formulario manual de bodega y construye array de objetos | DOM (tabla de inputs) | `guardarBodegaData()` |

### `admin-visual.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `parsePasteData()` | 2040 | Parsea texto pegado (desde Excel) en la tabla de ingreso de inventario manual | DOM (textarea o tabla) | Botón "Procesar" en Actualizar Data |
| `parseNumExcel(s)` | 2013 | Parser robusto de números que maneja formatos europeos y americanos | — | `parsePasteData()`, `guardarInventarioData()` |
| `parseBodegaData()` | 2087 | Lee filas del formulario manual de bodega | DOM | `guardarBodegaData()` |

---

## 6. INTERFAZ DE VENDEDOR

### `vendedor.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `showView(name, el, fromBn)` | 1009 | Muestra/oculta vistas, actualiza nav activo, dispara render de la vista seleccionada (inventario, tareas, ofertas, etc.) | Todos los `renderX()` | Sidebar nav, bottom nav |
| `getCadena(tienda)` | 1031 | Determina a qué cadena pertenece una tienda por palabras clave en el nombre | — | `renderInventario()` |
| `renderDashboard()` | 1043 | Renderiza el dashboard inicial con resumen de inventario, tareas pendientes y otras métricas | `INV_DATA_V`, `cargarTareasCount()` | `iniciarSesionVendedor()`, `showView('dashboard')` |
| `renderInventario()` | 1126 | Muestra tabla de inventario filtrada por tienda y marca | `INV_DATA_V`, `filtrarInventario()` | `showView('inventario')` |
| `filtrarInventario()` | 1134 | Aplica filtros de tienda, marca y búsqueda de texto al inventario del vendedor | `INV_DATA_V` | Inputs de filtro en la vista Inventario |
| `renderOfertas()` | 1168 | Lee `configuracion[ofertas]` de Supabase y renderiza las ofertas vigentes | `sbGetV()` | `iniciarSesionVendedor()`, `showView('ofertas')` |
| `cargarBodegaVendedor()` | 1267 | Fetch `configuracion[inventario_bodega]` desde Supabase (sin filtro de vendedor — muestra TODO el inventario), parsea el JSON y llama `renderBodegaTabla()` | `sbGetV()` | `showView('bodega')` |
| `renderBodegaTabla(datos)` | 1209 | Renderiza tabla de bodega con columnas: Código de Barra, Producto, UND/FACT, B8, M8 (campos `codigoBarras`, `descripcion`, `unidFact`, `b8`, `m8`) | DOM | `cargarBodegaVendedor()`, `filtrarBodegaVendedor()` |
| `filtrarBodegaVendedor(term)` | 1254 | Filtra `_bodegaDataCache` por `descripcion` o `codigoBarras` y re-renderiza | `_bodegaDataCache`, `renderBodegaTabla()` | Input de búsqueda en Bodega |
| `renderTareas()` | 2350 | Lee tareas propias del vendedor de Supabase con `select=*` + `ilike.` (case-insensitive), separa en pendientes/completadas y renderiza ambas listas. **Bug fix**: `view-tareas` estaba anidado dentro de `view-machetazo-react` en el HTML — el div machetazo no estaba cerrado antes de abrir el div tareas, causando que la vista quedara oculta por el padre inactivo. | `sbGetVAuth()`, `VENDOR_ACTUAL`, `completarTarea()` | `showView('tareas')`, `completarTarea()` |
| `formatOfertaPeriodo(fechaInicio, fechaFin)` | 1154 | Formatea el período de vigencia de una oferta para mostrarlo en la UI | — | `renderOfertas()` |

---

## 7. INTERFAZ DE ADMIN

### `admin-datos.html` y `admin-visual.html` (funciones compartidas con el mismo nombre)

| Función | Línea AD / AV | Qué hace | Depende de | La usan |
|---------|--------------|----------|-----------|---------|
| `showView(name, el)` | 1402 / 1048 | Muestra la vista solicitada, dispara init de la subsección, actualiza el topbar | Todos los `initX()` y `renderX()` | Sidebar nav |
| `toggleSidebar()` | 1390 / 1036 | Abre/cierra el sidebar en mobile | DOM | Botón hamburguesa |
| `closeSidebar()` | 1396 / 1042 | Cierra el sidebar | DOM | `toggleSidebar()`, overlay |
| `renderDashboard()` | 1423 / 1069 | Renderiza el dashboard principal con datos de `INV_DATA` en memoria | `INV_DATA` | `init()`, `showView('dashboard')` |
| `initVendedores()` | 1495 / 1141 | Inicializa la vista de Portal de Vendedores con la lista de vendedores | `TIENDAS_VENDEDORES`, `VENDEDORES` | `init()` |
| `renderVendedorProfile()` | 1500 / 1146 | Muestra el perfil e inventario de un vendedor específico | `TIENDAS_VENDEDORES`, datos de sesión | `initVendedores()` |
| `renderVendedorTable_filtered()` | 1539 / 1185 | Filtra y renderiza la tabla de inventario por vendedor y tienda | `INV_DATA` | Filtros de la vista Vendedores |
| `renderVendedorTable(rows)` | 1551 / 1197 | Renderiza las filas de la tabla de inventario de un vendedor | `cobStatus()`, `cobBar()` | `renderVendedorTable_filtered()` |
| `initTiendas()` | 1572 / 1218 | Inicializa la vista de Gestión de Tiendas | `TIENDAS_VENDEDORES` | `init()` |
| `renderTiendaView()` | 1579 / 1225 | Renderiza la tabla de tiendas con su vendedor asignado | `TIENDAS_VENDEDORES` | `initTiendas()` |
| `initInventario()` | 1616 / 1262 | Inicializa la vista de Inventario por Cadena con filtros | `INV_DATA` | `init()` |
| `renderInventario()` | 1622 / 1268 | Renderiza el inventario filtrado por cadena, tienda, marca | `INV_DATA` | `initInventario()`, filtros |
| `initAuditoria()` | 1664 / 1310 | Inicializa la vista de Auditoría | `INV_DATA`, `PRODUCTOS_AUDIT` | `init()` |
| `renderAuditoria()` | 1670 / 1316 | Renderiza la tabla de auditoría de productos críticos | `INV_DATA`, `PRODUCTOS_AUDIT` | `initAuditoria()` |
| `renderOfertas()` | 1719 / 1365 | Renderiza las ofertas guardadas en `configuracion[ofertas]` | `sbGet()` | `init()`, `showView('ofertas')` |
| `cobStatus(dias)` | 1355 / 1001 | Retorna etiqueta de estado de cobertura según días | — | `renderVendedorTable()`, `_renderInvTable()` |
| `cobBar(dias)` | 1362 / 1008 | Genera HTML de barra de progreso de cobertura | — | `renderVendedorTable()` |

### Solo en `admin-datos.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `renderInvFromSupabase(datos)` | 2108 | Toma datos de inventario y renderiza la tabla del dashboard en el admin | DOM | `renderDashboardFromSupabase()` |
| `initGestionOfertas()` | 2046 | Inicializa la pantalla de gestión de ofertas cargando las existentes | `cargarOfertasGuardadas()` | `showView('gestionar-ofertas')` |
| `agregarOferta()` | 1912 | Agrega una oferta a la lista en memoria `ofertasList` | `selProductoOferta()`, `ofertasList` | Botón "Agregar Oferta" |
| `selProductoOferta(cod, nombre)` | 1898 | Selecciona un producto del catálogo para la nueva oferta | `ofertasList` | Click en sugerencia del buscador de ofertas |
| `filtrarProductosOferta()` | 1878 | Filtra el catálogo de productos según el texto ingresado | CAT | Input de búsqueda de ofertas |
| `editarOferta(i)` | 1980 | Carga los datos de una oferta existente en el formulario para editar | `ofertasList` | Botón "Editar" |
| `renderOfertasInputList()` | 1940 | Renderiza el listado de ofertas pendientes de guardar | `ofertasList` | Toda modificación a `ofertasList` |
| `addBodegaRow(data)` | 2268 | Agrega una fila a la tabla de ingreso manual de bodega | DOM | Botón "Agregar Fila", carga desde Supabase |
| `gtEstadoMatch(d, estado)` | 3928 | Filtra productos por estado de inventario (agotado/crítico/insuficiente/óptimo/sobrestock) | — | `gtBuscarProductos()` |
| `gtBuscarProductos()` | 3969 | Aplica filtros de cadena, tiendas y estado para mostrar productos con stock bajo | `GT_INV_DATA`, `gtEstadoMatch()` | Botón "Buscar Productos" en Gestionar Tareas |
| `gtSeleccionarTodas(sel)` | 3961 | Selecciona/deselecciona todos los checkboxes de tiendas | DOM | Botón "Todos" / "Ninguno" |
| `gtActualizarConteoTiendas()` | 3965 | Actualiza el contador de tiendas seleccionadas | DOM | `gtCadenaChanged()`, `gtSeleccionarTodas()` |
| `gtActualizarSeleccion()` | 4026 | Actualiza el resumen de productos seleccionados para tareas | DOM | Cambios en checkboxes de productos |
| `gtToggleTodos(chkAll)` | 4011 | Selecciona/deselecciona todos los productos de la lista | DOM | Checkbox "Todos" en Gestionar Tareas |
| `cdToggle(tipo)` | 3775 | Expande/colapsa una sección del Centro de Descargas | `cdCargar()` | Click en cabecera de sección |
| `cdInicializar()` | 3793 | Resetea el Centro de Descargas y carga los conteos | `cdCargarConteo()` | `showView('centro-descargas')` |

### Solo en `admin-visual.html`

| Función | Línea | Qué hace | Depende de | La usan |
|---------|-------|----------|-----------|---------|
| `addDataRow(data)` | 1512 | Agrega una fila editable a la tabla de inventario manual | DOM | Botón "Agregar Fila", `cargarDataActual()` |
| `actualizarVendedorFila(input)` | 1532 | Al editar el nombre de tienda, auto-llena el vendedor via `buscarVendedorPorTienda()` | `buscarVendedorPorTienda()` | Evento `oninput` en celda de tienda |
| `buildRowHTML(data)` | 1989 | Construye el HTML de una fila de inventario con campos editables | `buscarVendedorPorTienda()` | `addDataRow()` |
| `gtCargarTiendas()` | 3428 | Filtra tiendas por vendedor seleccionado en Gestionar Tareas | `GT_INV_DATA` | `<select>` de vendedor |
| `gtCargarProductos()` | 3438 | Filtra productos con inventario bajo (≤5) por vendedor y tienda | `GT_INV_DATA` | `<select>` de tienda |
| `gtCheckChanged()` | 3461 | Muestra/oculta el botón de asignar según checkboxes seleccionados | DOM | Checkboxes de productos |
| `avCargarBodega()` | 3535 | Lee `configuracion[inventario_bodega]` y carga la vista de bodega | `sbAdmin()` | `showView('bodega-admin')` |
| `avFiltrarBodega(q)` | 3548 | Filtra la tabla de bodega por término de búsqueda | DOM | Input de búsqueda |
| `avRenderBodega(data)` | 3556 | Renderiza la tabla de bodega en la vista admin | DOM | `avCargarBodega()` |

---

## NOTA SOBRE COMPONENTES REACT

Los tres archivos activos con React (`admin-datos.html`, `admin-visual.html`, `vendedor.html`) contienen componentes definidos en bloques `<script type="text/babel">`:

| Componente | Archivos | Qué es |
|-----------|---------|--------|
| `IngresoApp` | admin-datos.html:2847, admin-visual.html:2743, vendedor.html:1886 | Formulario de ingreso de inventario para cadena XTRA. En `vendedor.html` (~1895): `tiendasV` filtra con normalización en ambos lados (`t.v` y `VENDOR_ACTUAL`). **Fix 2026-05-22**: antes el filtro era case-sensitive y la lista de tiendas aparecía vacía. |
| `MachetazoApp` | admin-datos.html:3094, admin-visual.html:2990, vendedor.html:2108 | Formulario de pedido sugerido para cadena GOLY/Machetazo. En `vendedor.html` (~2105): `misTiendas` filtra con normalización en ambos lados (`t.v` y `VENDOR_ACTUAL`). **Fix 2026-05-22**: antes el filtro era case-sensitive y mostraba "Sin tiendas Machetazo asignadas". |
| `ReyApp` | admin-datos.html:3317, admin-visual.html:3213 | Formulario de pedido para auditores (Super Rey) |
| `ItemEditable` | admin-datos.html:2812, admin-visual.html:2708, vendedor.html:1851 | Componente reutilizable de fila de producto en las apps |

Todos montan vía `ReactDOM.createRoot(container).render(<App/>)` (ya migrados a React 18).

---

## REGLA GLOBAL — NORMALIZACIÓN DE NOMBRES DE VENDEDOR

**Causa raíz identificada (2026-05-22):** `VENDOR_ACTUAL` llega del localStorage en formato mixto (`"Nombre Apellido"`), pero todos los arrays estáticos (`MACHETAZO_TIENDAS`, `TIENDAS_REY`, `TIENDAS_INGRESO`) almacenan vendedores en MAYÚSCULAS (`"NOMBRE APELLIDO"`). Una comparación directa `t.v === VENDOR_ACTUAL` falla silenciosamente.

**Patrón estándar obligatorio** para cualquier comparación de nombre de vendedor:

```js
function normVendedor(s) {
  return (s || '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
// Uso: normVendedor(t.v) === normVendedor(VENDOR_ACTUAL)
```

**Archivos y lugares ya corregidos con este patrón:**

| Archivo | Línea aprox. | Qué filtra |
|---------|-------------|-----------|
| `vendedor.html` | ~953 | Visibilidad del tab Machetazo (`MACHETAZO_USERS` vs `VENDOR_ACTUAL`) |
| `vendedor.html` | ~1895 | `IngresoApp.tiendasV` — tiendas XTRA del vendedor |
| `vendedor.html` | ~2105 | `MachetazoApp.misTiendas` — tiendas GOLY del vendedor |

**Regla para futuros cambios:** Antes de agregar cualquier filtro `t.v === algo` o `t.vendedor === algo` en cualquier archivo, verificar que usa esta normalización en ambos lados. Si no la usa, es un bug latente.
