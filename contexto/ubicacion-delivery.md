# Módulo de Ubicación Geográfica — Contexto técnico

## Propósito

Catálogo oficial de la división territorial de República Dominicana (ONE 2021), usado como base para el **sistema de delivery**: el cliente selecciona su dirección en cascada y el sistema determina el costo de envío según el barrio/paraje.

Fuente de datos: documento PDF **División Territorial 2021** (ONE — Oficina Nacional de Estadística, 519 páginas). Los datos se extrajeron con un script Node.js (`/tmp/parse_dt.js`) que parsea la estructura tabular del PDF.

---

## Jerarquía territorial

El documento ONE usa 7 niveles. El sistema almacena 5:

```
Provincia  (32 — incluye Distrito Nacional como cod '01')
  └── Municipio  (393 — municipios propios + distritos municipales en tabla plana)
        └── Sección  (1,599 — zona urbana U o rural R)
              └── Barrio / Paraje  (12,808 — nivel donde vive el precio de envío)
                    └── Sub-barrio  (5,782 — hijo del barrio; hereda precio del padre)
```

**Regla de precio:** `precio_envio` vive únicamente en `mg_barrio_paraje`. Si el cliente selecciona un sub-barrio, el sistema lee el precio del barrio padre.

**Sub-barrio:** solo 5,782 de los 12,808 barrios tienen sub-barrios — son principalmente zonas urbanas densas (DN, Santiago). El selector solo muestra el campo sub-barrio si el barrio tiene hijos en la DB.

---

## Archivos SQL generados

Ubicados en `eFacturador/src/main/resources/db/ubicacion/`:

| Archivo | Contenido |
|---------|-----------|
| `001_schema.sql` | DROP/CREATE de las 5 tablas + índices + ALTER TABLE mg_cliente |
| `002_provincias.sql` | 32 provincias |
| `003_municipios.sql` | 393 municipios + DMs (ordenados: padre antes que hijos) |
| `004_secciones.sql` | 1,599 secciones |
| `005_barrios_parajes.sql` | 12,808 barrios/parajes (`precio_envio = NULL` por defecto) |
| `006_sub_barrios.sql` | 5,782 sub-barrios (deduplicados, `ON CONFLICT DO NOTHING`) |

**Importante:** Todos los archivos usan `ON CONFLICT DO NOTHING` — se pueden correr múltiples veces sin fallar.

Si el `006_sub_barrios.sql` fue ejecutado parcialmente (error 23505), correr primero:
```sql
TRUNCATE general.mg_sub_barrio;
```

---

## Base de datos (PostgreSQL, schema `general`)

### `general.mg_provincia`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cod_provincia` | CHAR(2) PK | Código ONE: '01'…'32' |
| `nombre` | VARCHAR(80) | Ej: "Distrito Nacional", "Santiago" |
| `cod_region` | CHAR(2) | Región ONE (01-10) |

### `general.mg_municipio`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PK | |
| `cod_one` | CHAR(6) UNIQUE | prv(2)+mun(2)+dm(2), ej. `"020102"` |
| `nombre` | VARCHAR(120) | |
| `cod_provincia` | CHAR(2) FK | |
| `parent_id` | INTEGER FK self | NULL = municipio; apunta al municipio si es DM |
| `es_dm` | BOOLEAN | false = municipio propio, true = Distrito Municipal |

`cod_one` = `'020101'` → Azua (municipio), `'020102'` → Barro Arriba (DM de Azua)

### `general.mg_seccion`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PK | |
| `cod_one` | VARCHAR(8) UNIQUE | prv+mun+dm+sec |
| `nombre` | VARCHAR(150) | |
| `municipio_id` | INTEGER FK → `mg_municipio` | |
| `tipo` | CHAR(1) | `'U'` = zona urbana, `'R'` = sección rural |

### `general.mg_barrio_paraje`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PK | |
| `cod_one` | VARCHAR(11) UNIQUE | prv+mun+dm+sec+brr |
| `nombre` | VARCHAR(150) | Ej: "Piantini", "Bella Vista", "Los Prados" |
| `seccion_id` | INTEGER FK → `mg_seccion` | |
| `precio_envio` | DECIMAL(10,2) | NULL = no configurado; sub-barrios heredan este valor |

### `general.mg_sub_barrio`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PK | |
| `cod_one` | VARCHAR(13) UNIQUE | prv+mun+dm+sec+brr+sub |
| `cod_sub` | CHAR(2) | '01', '02'… |
| `nombre` | VARCHAR(150) | |
| `barrio_id` | INTEGER FK → `mg_barrio_paraje` | Precio se hereda desde aquí |

### Campos en `general.mg_cliente` (nuevos, reemplazan los viejos)

```sql
-- Nuevos (activos)
cod_provincia   CHAR(2)
municipio_id    INTEGER FK → mg_municipio
barrio_id       INTEGER FK → mg_barrio_paraje
sub_barrio_id   INTEGER FK → mg_sub_barrio   -- opcional
calle           VARCHAR(200)
referencia      VARCHAR(300)

-- Viejos (columnas huérfanas, no mapeadas en JPA)
cod_municipio_cabecera, cod_municipio, sector_paraje_id, sector, ciudad, direccion_entrega
```

---

## Backend Java

### Entidades JPA (`jpa/general/`)

- `MgProvincia` — PK: `String codProvincia`, campos: `nombre`, `codRegion`
- `MgMunicipio` — PK: `Integer id`, campos: `codOne`, `nombre`, `codProvincia`, `parentId`, `esDm`
- `MgSeccion` — PK: `Integer id`, campos: `codOne`, `nombre`, `municipioId`, `tipo`
- `MgBarrioParaje` — PK: `Integer id`, campos: `codOne`, `nombre`, `seccionId`, `precioEnvio`
- `MgSubBarrio` — PK: `Integer id`, campos: `codOne`, `codSub`, `nombre`, `barrioId`
- `MgCliente` — campos de ubicación: `codProvincia`, `municipioId`, `barrioId`, `subBarrioId`, `calle`, `referencia`

### DTOs (`dto/general/`)

- `MgMunicipioResumenDTO` — `id, codOne, nombre, codProvincia, parentId, esDm`
- `MgBarrioParajeResumenDTO` — `id, nombre, seccionId, precioEnvio`
- `MgSubBarrioResumenDTO` — `id, codSub, nombre, barrioId`
- `MgMunicipioSearchCriteria` — `codProvincia, nombre, esDm, parentId, page, size`

### DAOs

- `MgProvinciaDao` — JpaRepository (`getAll()`)
- `MgMunicipioDao` / `MgMunicipioDaoImpl` — `findById(Integer)`, `findByProvincia(String)`, `searchByCriteria(...)`
- `MgBarrioParajeDao` / `MgBarrioParajeDaoImpl` — `findById`, `findByMunicipio(Integer)` (subquery JPQL: municipio → secciones → barrios)
- `MgSubBarrioDao` / `MgSubBarrioDaoImpl` — `findByBarrio(Integer)`

### Services

- `ProvinciaServiceImpl` — `getAll()`
- `MunicipioServiceImpl` — `getById`, `getByProvincia`, `buscar`
- `BarrioParajeServiceImpl` — `getById`, `getByMunicipio`, `getSubBarriosByBarrio`

### Controllers REST

```
GET  /api/v1/general/provincias                          → todas las provincias
GET  /api/v1/general/municipios/{id}                     → municipio por id
GET  /api/v1/general/municipios/por-provincia/{cod}      → lista para cascada (sin paginar)
POST /api/v1/general/municipios/buscar                   → búsqueda paginada
GET  /api/v1/general/barrios/{id}                        → barrio por id
GET  /api/v1/general/barrios/por-municipio/{municipioId} → lista para cascada (sin paginar)
GET  /api/v1/general/barrios/{barrioId}/sub-barrios      → sub-barrios de un barrio
```

**Ningún endpoint filtra por tenant** — son catálogos globales de sistema.

### Impacto en módulo Despacho

`DeRutaEntregaServiceImpl.buildDireccionEntrega()` actualizado:
- Antes: usaba `getDireccionEntrega()`, `getSector()`, `getCiudad()`
- Ahora: usa `getCalle()` (o `getDireccion()` como fallback) + `getReferencia()` separado por ` — `

---

## Frontend React

### `src/apis/UbicacionController.tsx`

Tipos exportados: `MgProvincia`, `MgMunicipioResumen`, `MgBarrioParajeResumen`, `MgSubBarrioResumen`, `DireccionValue`, `MgMunicipioSearchCriteria`, `Page<T>`.

Funciones principales:
- `getProvincias()` — lista completa
- `getMunicipiosByProvincia(cod)` — para cascada (sin paginar)
- `getBarriosByMunicipio(id)` — para cascada (sin paginar)
- `getSubBarriosByBarrio(id)` — lista completa
- `buscarMunicipios(criteria)` — POST /buscar, paginado (usado en modales de búsqueda)

### `src/components/general/DireccionSelector.tsx`

Componente React con Autocomplete MUI en cascada:

```tsx
<DireccionSelector
  value={direccion}          // DireccionValue
  onChange={setDireccion}
  showDireccionTextual={true} // muestra campos Calle y Referencia
  disabled={false}
/>
```

**Comportamiento:**
1. Provincia → carga municipios/DMs (agrupados: "Municipios" / "Distritos Municipales")
2. Municipio → carga barrios/parajes del municipio
3. Barrio → muestra `precio_envio` en helper text; carga sub-barrios si los hay
4. Sub-barrio → **aparece solo si el barrio tiene hijos en la DB** (barrios urbanos de DN/Santiago)
5. Calle + Referencia → campos de texto libre (con `showDireccionTextual`)

Al resetear un nivel, los niveles inferiores se limpian en cascada.

### Integración en `ClientesView.tsx`

La sección "Dirección de Entrega" usa `DireccionSelector` directamente. Estado local `DireccionValue` separado del `useForm`. Al guardar se mezcla con los datos del form:

```tsx
const payload: Cliente = {
  ...data,
  codProvincia: direccion.codProvincia,
  municipioId:  direccion.municipioId,
  barrioId:     direccion.barrioId,
  subBarrioId:  direccion.subBarrioId,
  calle:        direccion.calle,
  referencia:   direccion.referencia,
};
```

Al cargar un cliente existente, `setDireccion({ codProvincia, municipioId, barrioId, subBarrioId, calle, referencia })` restaura el selector automáticamente.

### Modales de búsqueda (legacy, aún existentes)

`MunicipioBuscarModal`, `MunicipioCabeceraBuscarModal`, `SectorParajeBuscarModal` siguen en `src/components/general/` pero ya no se usan en `ClientesView`. Usan los nuevos tipos:
- `MunicipioBuscarModal` — prop `parentId: number|undefined`
- `SectorParajeBuscarModal` — prop `municipioId: number|undefined`, usa `getBarriosByMunicipio`, filtra localmente

---

## Modelo `Cliente.tsx`

```typescript
interface Cliente {
  // ... campos normales ...
  // Ubicación de entrega
  codProvincia?: string
  municipioId?: number
  barrioId?: number
  subBarrioId?: number
  calle?: string
  referencia?: string
  // Campos eliminados: codMunicipioCabecera, codMunicipio, sectorParajeId, sector, ciudad, direccionEntrega
}
```

---

## Decisiones de diseño

- **`precio_envio` en `mg_barrio_paraje`**, no en sub-barrio. El sub-barrio hereda leyendo `barrio_id → mg_barrio_paraje.precio_envio`.
- **Municipios y DMs en una sola tabla** (`es_dm` + `parent_id`). Simplifica queries y el selector.
- **`findByMunicipio` usa subquery JPQL** (municipio → secciones → barrios) para no exponer `seccion_id` en la capa de servicio.
- **Sin paginación en los endpoints de cascada** — municipios por provincia: máx ~30; barrios por municipio: máx ~71 (DN). Manejable como lista en memoria.
- **Catálogos globales** — no tienen `empresa_id` ni `sucursal_id`. Son datos de la ONE.
- **`cod_one`** sigue el estándar ONE: concatenación de códigos de nivel. Sirve para trazabilidad, deduplicación y actualizaciones futuras.
- **`ON CONFLICT DO NOTHING`** en todos los INSERT de datos — idempotentes, se pueden re-ejecutar.
