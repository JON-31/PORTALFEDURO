# Código rescatado de archivos legacy

Extraído antes de eliminar `MARS_FUSIONADO.html` y `HTML1_vendedores.html` (2026-05-26).
Estos archivos contenían credenciales hardcodeadas y fueron reemplazados por la arquitectura actual.

---

## 1. Score de Auditoría (de MARS_FUSIONADO.html)

### Cómo funciona el cálculo

1. El usuario selecciona una **tienda** y una **categoría** (todas / chocolate / confitería / mascota).
2. Se construye la lista `productosAudit` a partir de `PRODUCTOS_AUDIT[cat]`.
3. Se filtra `DATA` (inventario cargado desde Supabase) por la tienda seleccionada.
4. Un producto se considera **presente** si `d.Producto === pa.producto && d.Inventario > 0`.
5. `score = Math.round((presentes / total) * 100)`.
6. Se muestra un círculo de score con color: ≥80% verde, ≥60% amarillo, <60% rojo.
7. La tabla detallada muestra cada producto requerido con su inventario real, días de cobertura y badge Presente/Faltante.

### `PRODUCTOS_AUDIT`

Lista de productos requeridos por categoría para calcular el score de presencia en tienda.

```javascript
const PRODUCTOS_AUDIT = {
  chocolate: [
    "M&MS PEANUT BUTTER SNG 24CT 12CS PH",
    "M&M'S MILK CHOCOLATE 1.69oz/36un",
    "M&Ms PEANUTS 1.74oz/48un",
    "M&M'S PEANUTS KING SIZE 3.27oz/24un",
    "M&Ms MINIS MINITUBO 1.08oz/24un",
    "M&MS MINIS MEGATUBO 1.77oz/24un",
    "M&MS PEANUT BUTTER SUP 9OZ 8CS",
    "M&MS CLSC MIX SUP 8.3OZ 8CS",
    "M&MS ALMOND SUP 9OZ 8CS",
    "M&MS MINIS SUP 9.4OZ 8CS",
    "M&MS MILK CHOCO SUP 10OZ 12CS",
    "M&MS PEANUT SUP 10.05OZ 12CS",
    "SNICKERS 1.86oz/48un",
    "SNICKERS KING SIZE 3.29oz/24un",
    "SNICKERS MINIATURES BOLSA 9.7oz/8un",
    "SNICKERS FUN SIZE BOLSA 10.59oz",
    "MILKY WAY 1.84oz/36un",
    "TWIX 1.79oz/36un",
    "TURIN ZERO CS 1/4/18/18GR"
  ],
  confiteria: [
    "Doublemint - 20 Pkgs. Per Box",
    "STARBURST ORIGINAL SINGLES 36CT 10/CA",
    "Skittles Original 2.17oz/36un",
    "Skittles Wildberry 2.17oz/36un",
    "LUCAS MUECAS SANDIA 24/10/25G",
    "LUCAS MUECAS MANGO 1/24/10/25G",
    "SKWINKLES CHUNK SINGLE CS 1/20/6/45G"
  ],
  mascota: [
    "PEDIGREE ADULTO ETG 10/1KG",
    "PEDIGREE ADULTO 10BL/2KG.",
    "PEDIGREE CACHORRO 10BL/2KG.",
    "PEDIGREE POUCH CORDERO ADULTO 100GRS.",
    "PEDIGREE POUCH POLLO ADULTO 100GRS.",
    "PEDIGREE POUCH RES ADULTO 100GRS.",
    "CESAR BEEF CJ24/100GR",
    "CESAR CACHORRO CJ24/100GR",
    "WHISKAS CARNE ORIGINAL 12/300GR",
    "WHISKAS GATITOS 12BL/1.4KG.",
    "WHISKAS POUCH ATÚN GATITOS CJ24/85GR.",
    "WHISKAS POUCH POLLO CJ24/85GR."
  ]
};
```

### `initAuditoria()` y `renderAuditoria()`

```javascript
function initAuditoria() {
  const sel = document.getElementById('sel-audit-tienda');
  sel.innerHTML = TIENDAS.map(t => `<option value="${t}">${t}</option>`).join('');
  renderAuditoria();
}

function renderAuditoria() {
  const tienda = document.getElementById('sel-audit-tienda').value;
  const cat = document.getElementById('sel-audit-cat').value;
  const tiendaData = DATA.filter(d => d.Tienda === tienda);

  let productosAudit = [];
  const cats = cat === 'todas' ? ['chocolate', 'confiteria', 'mascota'] : [cat];
  cats.forEach(c => {
    PRODUCTOS_AUDIT[c].forEach(p => productosAudit.push({ cat: c, producto: p }));
  });

  const presentes = productosAudit.filter(pa => {
    return tiendaData.some(d => d.Producto === pa.producto && d.Inventario > 0);
  }).length;

  const score = Math.round((presentes / productosAudit.length) * 100);
  const scoreCls = score >= 80 ? 'score-high' : score >= 60 ? 'score-mid' : 'score-low';
  const vendedor = TIENDAS_VENDEDORES[tienda] || 'N/A';

  document.getElementById('audit-score-area').innerHTML = `
    <div class="audit-score-card">
      <div class="score-circle ${scoreCls}">
        <div class="score-number">${score}%</div>
        <div class="score-label">Score</div>
      </div>
      <div>
        <div style="font-family:'Bebas Neue';font-size:22px;letter-spacing:2px;margin-bottom:6px">${tienda}</div>
        <div style="font-size:13px;color:var(--muted);margin-bottom:12px">Vendedor: <strong style="color:var(--text)">${vendedor}</strong></div>
        <div style="font-size:14px">
          <span style="color:#00C853">✅ ${presentes}</span> presentes ·
          <span style="color:#FF4444">❌ ${productosAudit.length - presentes}</span> faltantes
          de ${productosAudit.length} requeridos
        </div>
      </div>
    </div>
  `;

  const catLabels = { chocolate: '🍫 Chocolate', confiteria: '🍬 Confitería', mascota: '🐾 Mascota' };
  document.getElementById('audit-count').textContent = `${productosAudit.length} productos requeridos`;
  document.getElementById('audit-table-body').innerHTML = productosAudit.map(pa => {
    const found = tiendaData.find(d => d.Producto === pa.producto);
    const tieneStock = found && found.Inventario > 0;
    return `<tr>
      <td><span class="badge badge-brand">${catLabels[pa.cat]}</span></td>
      <td style="max-width:300px;white-space:normal">${pa.producto}</td>
      <td>${found ? found.Inventario.toLocaleString() : '—'}</td>
      <td>${found ? found.Dias_Cobertura : '—'}</td>
      <td><span class="badge ${tieneStock ? 'badge-ok' : 'badge-danger'}">${tieneStock ? '✅ Presente' : '❌ Faltante'}</span></td>
    </tr>`;
  }).join('');
}
```

**Dependencias para portar a producción:**
- `DATA` → reemplazar por `config.inventario` (array cargado desde Supabase)
- `TIENDAS_VENDEDORES` → ya existe en `admin-datos.html` / `admin-visual.html`
- Campos requeridos en cada registro: `Tienda`, `Producto`, `Inventario`, `Dias_Cobertura`
- En producción el campo equivalente a `Producto` es `producto` (minúscula) y a `Inventario` es `inventario`

---

## 2. Búsqueda Fuzzy de Bodega (de HTML1_vendedores.html)

### Cómo funciona

1. Recibe la `descripcion` de un ítem de bodega.
2. Busca primero en `MACHETAZO_PRODUCTOS` — compara `descripcion.toUpperCase()` contra `p.descripcion.toUpperCase()` en ambas direcciones (substring bidireccional).
3. Si encuentra match, retorna `p.codigo` (el código de barras del producto Machetazo).
4. Si no, busca en `CAT_DATA` (catálogo XTRA) — misma lógica con `p.n` (nombre del producto).
5. Si encuentra, retorna `p.b` (barcode XTRA).
6. Si no hay match en ninguno, retorna `''`.

```javascript
function buscarCodigoBodega(descripcion) {
  if (!descripcion) return '';
  var desc = descripcion.toUpperCase();
  var found = null;
  if (window.MACHETAZO_PRODUCTOS) {
    found = MACHETAZO_PRODUCTOS.find(function(p) {
      return p.descripcion &&
        (p.descripcion.toUpperCase().indexOf(desc) >= 0 ||
         desc.indexOf(p.descripcion.toUpperCase()) >= 0);
    });
    if (found) return found.codigo;
  }
  if (window.CAT_DATA) {
    found = CAT_DATA.find(function(p) {
      return p.n &&
        (p.n.toUpperCase().indexOf(desc) >= 0 ||
         desc.indexOf(p.n.toUpperCase()) >= 0);
    });
    if (found) return found.b;
  }
  return '';
}
```

**Dependencias para portar a producción:**
- `window.MACHETAZO_PRODUCTOS` → ya definido en `vendedor.html` (array global `<script>`)
- `window.CAT_DATA` → ya definido en `vendedor.html` (array global `<script>`)
- La función puede copiarse tal cual a `vendedor.html` o `shared.js`

---

## 3. Catálogos únicos

### `TIPOS_PEDIDO` (HTML1_vendedores.html)

Tipos de pedido para el componente MachetazoApp.

```javascript
const TIPOS_PEDIDO = [
  'Pedido adicional',
  'Pedido para Tonga',
  'Pedido para Isla',
  'Pedido para botadero',
  'Pedido para frente de caja',
];
```

### `MACHETAZO_TIENDAS` (HTML1_vendedores.html)

Mapping completo de tiendas Machetazo/Goly con vendedor asignado, columna Excel y nombre corto de tienda.
Campos: `n` (nombre completo en sistema), `v` (vendedor), `col` (índice columna Excel), `colLetter` (letra columna), `store` (nombre corto).

```javascript
const MACHETAZO_TIENDAS = [
  {n:'COMPANIA GOLY,S.A. CALIDONIA',       v:'CECILIA VALDES',          col:7,  colLetter:'G', store:'CALIDONIA'},
  {n:'COMPANIA GOLY S A ARRAIJAN',          v:'ALEXIS VAZQUEZ',          col:10, colLetter:'J', store:'ARRAIJAN'},
  {n:'COMPANIA GOLY S A COSTA SUR',         v:'MANUEL VALDEZ',           col:17, colLetter:'Q', store:'COSTA SUR'},
  {n:'COMPANIA GOLY, S.A. CORONADO',        v:'EDUARDO LÓPEZ',           col:15, colLetter:'O', store:'CORONADO'},
  {n:'COMPANIA GOLY,S.A. BRISAS DEL GOLF',  v:'ELEIDI FRANCO',           col:18, colLetter:'R', store:'BRISAS'},
  {n:'COMPANIA GOLY,S.A. NUEVO TOCUMEN',    v:'ADESSA COOK',             col:19, colLetter:'S', store:'NUEVO TOCUMEN'},
  {n:'COMPANIA GOLY,S.A. EL DORADO',        v:'IRVING TORRES',           col:22, colLetter:'V', store:'DORADO'},
  {n:'COMPANIA GOLY S A TOCUMEN',           v:'BELTRAN FRANCO GONZALEZ', col:9,  colLetter:'I', store:'TOCUMEN'},
  {n:'COMPANIA GOLY S A S MIGUELITO',       v:'JAAZIEL GONZALEZ',        col:8,  colLetter:'H', store:'SAN MIGUELITO'},
  {n:'COMPANIA GOLY-MACHETAZO EXPRESS 3',   v:'SAMUEL BARRIA',           col:14, colLetter:'N', store:'METRO MALL'},
  {n:'COMPANIA GOLY S A OJO DE AGUA',       v:'ERICK RUIZ',              col:21, colLetter:'U', store:'VIA ESPAÑA'},
  {n:'CIA. GOLY, S.A. METROMALL',           v:'PEDRO RODRIGUEZ',         col:23, colLetter:'W', store:'METROMALL'},
  {n:'SUPER CARNES #15 TRAPICHITO',         v:'YESLIN PALERMO',          col:24, colLetter:'X', store:'TRAPICHITO'},
];
```

### `OFERTAS_PRODUCTOS` (MARS_FUSIONADO.html)

Catálogo completo de ~80 productos para el autocomplete de gestión de ofertas.
Campos: `b` (barcode EAN), `n` (nombre del producto).

```javascript
const OFERTAS_PRODUCTOS = [
  // M&M'S
  {b:'040000514480', n:"M&M'S MILK CHOCOLATE 1.69oz 36un"},
  {b:'040000514510', n:"M&M'S PEANUTS 1.74oz 48un"},
  {b:'040000001447', n:"M&MS PEANUT BUTTER 5NG 24CT 12CS"},
  {b:'040000580881', n:"M&M'S MILK CHOCOLATE CRUNCHY COOKIE 1.35oz"},
  {b:'040000516583', n:"M&M'S MILK CHOCOLATE SHARING SIZE 3.14oz"},
  {b:'040000516605', n:"M&M'S PEANUTS SHARING SIZE 3.27oz"},
  {b:'040000516636', n:"M&M'S CRISPY SHARING SIZE 2.83oz"},
  {b:'040000516612', n:"M&M'S CARAMEL SHARING SIZE 2.83oz"},
  {b:'040000534151', n:"M&M'S HAZELNUT SPREAD 1.35oz"},
  {b:'040000549056', n:"M&M'S FUDGE BROWNIE 1.35oz"},
  {b:'040000549063', n:"M&M'S FUDGE BROWNIE SHARING SIZE 2.83oz"},
  {b:'040000580867', n:"M&M'S CARAMEL COLD BREW 1.35oz"},
  {b:'040000001379', n:"M&M'S MILK CHOCOLATE CANDY 19.2oz"},
  {b:'040000523650', n:"M&M'S MINI TUBES 1.77oz"},
  {b:'040000001423', n:"M&MS PEANUT 5NG 24CT 12CS"},
  {b:'040000580898', n:"M&M'S CRUNCHY MINT 1.35oz"},
  {b:'040000580904', n:"M&M'S CRUNCHY ESPRESSO 1.35oz"},
  {b:'040000555132', n:"M&M'S MIXED 1.75oz"},
  {b:'040000555125', n:"M&M'S MIXED CHOCOLATE BAG 8oz"},
  {b:'040000001386', n:"M&M'S PEANUT BUTTER CANDY 5.1oz"},
  // SNICKERS
  {b:'040000514251', n:"SNICKERS 1.86oz 48un"},
  {b:'040000264978', n:"SNICKERS KING SIZE 3.29oz 24un"},
  {b:'040000026527', n:"SNICKERS FUN SIZE BAG 10.59oz"},
  {b:'040000264244', n:"SNICKERS MINIS 9.7oz"},
  {b:'040000514275', n:"SNICKERS PEANUT BROWNIE 1.65oz"},
  {b:'040000580836', n:"SNICKERS CREAMY PEANUT BUTTER 1.5oz"},
  {b:'040000580829', n:"SNICKERS DARK 1.76oz"},
  {b:'040000001584', n:"SNICKERS ALMOND 1.76oz"},
  {b:'040000514268', n:"SNICKERS WHITE 1.76oz"},
  {b:'040000001591', n:"SNICKERS SHARING SIZE 3.29oz"},
  {b:'040000264985', n:"SNICKERS ORIGINAL BARS 6CT"},
  {b:'040000026558', n:"SNICKERS SHARING SIZE ALMOND 3.29oz"},
  // MILKY WAY
  {b:'040000264947', n:"MILKY WAY 1.84oz 24un"},
  // TWIX
  {b:'040000264916', n:"TWIX COOKIE BARS 1.79oz 24un"},
  // MIXED
  {b:'040000555149', n:"MARS VARIETY MIXED BAG"},
  // TURIN ZERO
  {b:'7501034940015', n:"TURIN ZERO CHOCOLATE CON LECHE 65g"},
  {b:'7501034940022', n:"TURIN ZERO CHOCOLATE AMARGO 65g"},
  {b:'7501034940039', n:"TURIN ZERO CHOCOLATE BLANCO 65g"},
  {b:'7501034940046', n:"TURIN ZERO ALMENDRAS 65g"},
  {b:'7501034940053', n:"TURIN ZERO AVELLANAS 65g"},
  {b:'7501034940060', n:"TURIN ZERO MENTA 65g"},
  {b:'7501034940077', n:"TURIN ZERO NARANJA 65g"},
  {b:'7501034940084', n:"TURIN ZERO FRESA 65g"},
  // PEDIGREE SECO
  {b:'7506174516027', n:"PEDIGREE CACHORROS RAZAS PEQUEÑAS 1.8KG"},
  {b:'7506174516034', n:"PEDIGREE ADULTO RAZAS PEQUEÑAS 1.8KG"},
  {b:'7506174516010', n:"PEDIGREE ADULTO RAZAS MEDIANAS 4KG"},
  {b:'7506174516003', n:"PEDIGREE ADULTO RAZAS GRANDES 8KG"},
  {b:'7506174516041', n:"PEDIGREE CACHORROS 4KG"},
  {b:'7506174516058', n:"PEDIGREE ADULTO TODAS LAS RAZAS 1KG"},
  // PEDIGREE POUCH
  {b:'7506174700019', n:"PEDIGREE POUCH ADULTO CARNE 100g"},
  {b:'7506174700026', n:"PEDIGREE POUCH ADULTO POLLO 100g"},
  {b:'7506174700033', n:"PEDIGREE POUCH CACHORROS 100g"},
  // PEDIGREE HIGH PROTEIN
  {b:'7506174516065', n:"PEDIGREE HIGH PROTEIN ADULTO 2KG"},
  {b:'7506174516072', n:"PEDIGREE HIGH PROTEIN ADULTO 4KG"},
  // PEDIGREE PANIKITA
  {b:'7506174600019', n:"PEDIGREE PANIKITA 85g 20UN"},
  // PEDIGREE LATA
  {b:'7506174400015', n:"PEDIGREE LATA ADULTO CARNE 374g"},
  {b:'7506174400022', n:"PEDIGREE LATA ADULTO POLLO 374g"},
  // PEDIGREE BISCUIT
  {b:'7506174300014', n:"PEDIGREE BISCUIT LECHE Y MIEL 500g"},
  {b:'7506174300021', n:"PEDIGREE BISCUIT CARNE 500g"},
  // CESAR WET FOOD
  {b:'023100004012', n:"CESAR CHICKEN AND LIVER 100g"},
  {b:'023100004029', n:"CESAR BEEF AND VEGETABLES 100g"},
  {b:'023100004036', n:"CESAR LAMB AND RICE 100g"},
  {b:'023100004043', n:"CESAR SALMON AND RICE 100g"},
  // WHISKAS
  {b:'023100019009', n:"WHISKAS ADULTO ATUN POUCH 85g"},
  {b:'023100019016', n:"WHISKAS ADULTO SALMON POUCH 85g"},
  {b:'023100019023', n:"WHISKAS ADULTO POLLO POUCH 85g"},
  {b:'023100010006', n:"WHISKAS SECO ADULTO SALMON 1.5KG"},
  {b:'023100010013', n:"WHISKAS SECO ADULTO POLLO 1.5KG"},
  // DOUBLEMINT
  {b:'022000293213', n:"DOUBLEMINT 20 PKGS PER BOX"},
  {b:'022000009136', n:"DOUBLEMINT SINGLE PACK 15 PELLETS"},
  // WINTERFRESH
  {b:'022000009259', n:"WINTERFRESH GUM SINGLE PACK"},
  {b:'022000293237', n:"WINTERFRESH 20 PKGS BOX"},
  // EXTRA
  {b:'022000009297', n:"EXTRA SPEARMINT SINGLE PACK"},
  {b:'022000009280', n:"EXTRA PEPPERMINT SINGLE PACK"},
  {b:'022000293251', n:"EXTRA SPEARMINT 15 PKGS BOX"},
  // ORBIT
  {b:'022000009372', n:"ORBIT SPEARMINT SINGLE PACK"},
  {b:'022000009358', n:"ORBIT PEPPERMINT SINGLE PACK"},
  {b:'022000009396', n:"ORBIT WINTERMINT SINGLE PACK"},
  {b:'022000009389', n:"ORBIT CINNAMINT SINGLE PACK"},
  // ALTOIDS
  {b:'022000050671', n:"ALTOIDS PEPPERMINT 1.76oz"},
  {b:'022000050688', n:"ALTOIDS SPEARMINT 1.76oz"},
  {b:'022000050695', n:"ALTOIDS CINNAMON 1.76oz"},
  // HUBBA BUBBA
  {b:'022000009501', n:"HUBBA BUBBA BUBBLE TAPE ORIGINAL 2oz"},
  {b:'022000009518', n:"HUBBA BUBBA BUBBLE TAPE STRAWBERRY 2oz"},
  {b:'022000009525', n:"HUBBA BUBBA MAX ORIGINAL 1oz"},
  // STARBURST
  {b:'022000012648', n:"STARBURST ORIGINAL FRUIT CHEWS 2.07oz 36un"},
  {b:'022000012662', n:"STARBURST TROPICAL 2.07oz 36un"},
  {b:'022000012655', n:"STARBURST SOURS 2.07oz 36un"},
  {b:'022000012679', n:"STARBURST FAVEREDS 2.07oz 36un"},
  // SKITTLES
  {b:'022000018465', n:"SKITTLES ORIGINAL 2.17oz 36un"},
  {b:'022000018472', n:"SKITTLES WILD BERRY 2.17oz 36un"},
  {b:'022000018489', n:"SKITTLES TROPICAL 2.17oz 36un"},
  {b:'022000018496', n:"SKITTLES SOURS 2.17oz 36un"},
  // LUCAS
  {b:'7501000700010', n:"LUCAS CHAMOY 12g"},
  {b:'7501000700027', n:"LUCAS MUECAS CHAMOY 12g"},
  {b:'7501000700034', n:"LUCAS PELUCAS 12g"},
  // SKWINKLES
  {b:'7501000702014', n:"SKWINKLES SALSAGHETI SANDIA 57g"},
  {b:'7501000702021', n:"SKWINKLES RUNNERS FRESA 57g"},
  // LUCAS GOMITAS
  {b:'7501000701017', n:"LUCAS GOMITAS CHAMOY 30g"},
  {b:'7501000701024', n:"LUCAS GOMITAS FRESA 30g"},
  // LUCAS LENWAS
  {b:'7501000703011', n:"LUCAS LENWAS LIMON CHILE 17g"},
  {b:'7501000703028', n:"LUCAS LENWAS MANGO CHILE 17g"},
];
```
