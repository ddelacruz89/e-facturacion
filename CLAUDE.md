# eFacturador — Instrucciones para Claude

## Stack
- **Backend:** Java 17 + Spring Boot + Hibernate 6 + PostgreSQL
- **Frontend:** React + TypeScript + Material UI
- **Auth:** JWT via `TenantContext` (empresaId, sucursalId, username)

---

## Multi-tenant y multi-sucursal — OBLIGATORIO

Esta aplicación es **multi-tenant** (por `empresaId`) y **multi-sucursal** por tenant (por `sucursalId`). Toda query que toque datos de negocio debe aplicar ambos filtros.

### Reglas de filtrado
- Entidades que extienden `BaseEntityPk` tienen `empresaId` como campo directo → filtrar con `AND o.empresaId = :empresaId`.
- Entidades que extienden `BaseSucursal` tienen `empresaId` (Integer) Y `sucursalId` (FK a `SgSucursal`) → filtrar con `AND o.empresaId = :empresaId AND o.sucursalId.id = :sucursalId`.
- Tablas de catálogo del sistema (`SgEmpresa`, `SgSucursal`, `MgItbis`, `MgTipoComprobante`, etc.) son datos globales y NO se filtran por tenant.

### Quién lee el tenant
- `empresaId` y `sucursalId` se obtienen **siempre** en el service vía `TenantContext`, nunca en el DAO ni en el controller.
- El DAO recibe los valores ya extraídos como parámetros primitivos `Integer`.

### Al persistir
- El service siempre sobreescribe `empresaId` y `sucursalId` desde `TenantContext` antes de guardar, ignorando lo que envíe el cliente.
- Cuando la entidad usa `BaseSucursal.sucursalId` (tipo `SgSucursal`), se resuelve el objeto `SgSucursal` vía `SgSucursalRepository.findById(sucursalId)` antes de asignarlo.

---

## Patrón de búsqueda — OBLIGATORIO en todos los módulos

Toda búsqueda de listado debe seguir este patrón de dos pasos:

### Paso 1 — Búsqueda: retornar resumen (mínima data)
- El endpoint `POST /buscar` devuelve **siempre un DTO de resumen**, nunca la entidad completa.
- El DTO incluye únicamente los campos necesarios para mostrar en la tabla: típicamente `id, fechaReg, [nombre descriptivo], total, usuarioReg, estadoId`.
- Nunca se retornan colecciones anidadas (detalles, lotes, relaciones lazy) en la búsqueda.
- Usar proyección JPQL con `new com.braintech.dto.MiResumenDTO(...)` en el DAO.
- Si se necesita el nombre de una entidad relacionada que solo está referenciada por ID (ej. `almacenId` como `Integer`), usar una subquery JPQL:
  ```java
  "(SELECT a.nombre FROM InAlmacen a WHERE a.id = o.almacenId)"
  ```

**Ejemplo de DTO de resumen:**
```java
@Data @NoArgsConstructor @AllArgsConstructor
public class InOrdenEntradaResumenDTO {
  private Integer id;
  private LocalDateTime fechaReg;
  private String almacenNombre;
  private BigDecimal total;
  private String usuarioReg;
  private String estadoId;
}
```

### Paso 2 — Click: cargar objeto completo
- Al hacer click en un resultado del modal de búsqueda, el frontend llama al endpoint `GET /{id}` para cargar el objeto completo.
- El handler siempre tiene esta forma:
```typescript
const handleSelect = search.handleSelect(async (resumen: any) => {
    const completo = await getEntidad(resumen.id); // GET /{id}
    setSelectedEntidad(completo);
});
```
- Nunca se usa el objeto del resumen directamente como objeto de trabajo.

### Columnas del modal de búsqueda
Usar los campos del DTO de resumen. Formato estándar:
```typescript
displayColumns: [
    { key: "id", label: "ID", width: "8%" },
    { key: "fechaReg", label: "Fecha", width: "22%", render: (v) => formatDateTimeForUi(v) },
    { key: "nombreDescriptivo", label: "Descripción", width: "30%" },
    { key: "total", label: "Total", width: "18%", render: (v) => formatTotal16_2(v) },
    { key: "usuarioReg", label: "Usuario", width: "12%" },
    { key: "estadoId", label: "Estado", width: "10%" },
]
```

---

## Patrón de secuencia por empresa — OBLIGATORIO en módulos de negocio

Aunque la PK interna es `id` (autoincremental global), el usuario siempre ve un número de secuencia propio por empresa (`secuencia`). Ejemplo: empresa 1 tiene facturas 1, 2, 3; empresa 2 también tiene 1, 2, 3 — pero internamente son IDs 1, 2, 3, 4, 5, 6.

### Reglas
- `secuencia` está en `BaseEntityPk` como `Integer secuencia`.
- Se genera **solo en `save`** (creación), nunca en `update`.
- Llamar `secuenciasDao.getNextSecuencia(empresaId, NombreClase.class.getSimpleName().toUpperCase(Locale.ROOT))` después del primer `repository.save()` para tener el `id` asignado, luego hacer un segundo `save` con la secuencia.
- **Nunca** usar `id` en la UI para mostrar al usuario — siempre mostrar `secuencia`.
- Internamente los joins, FKs y llamadas GET `/{id}` siguen usando `id`.
- El DTO de resumen (búsqueda) debe incluir `secuencia` y el modal de búsqueda muestra `secuencia` como columna "No." en lugar de "ID".
- El frontend guarda `id` en el estado interno y `secuencia` solo como display.

### Ejemplo (service)
```java
MfFacturaSuplidor saved = repository.save(entity);
int seq = secuenciasDao.getNextSecuencia(
    saved.getEmpresaId(), MfFacturaSuplidor.class.getSimpleName().toUpperCase(Locale.ROOT));
saved.setSecuencia(seq);
return repository.save(saved);
```

---

## Reglas generales del backend

### TenantContext — siempre en el service, nunca en el DAO
- `empresaId`, `sucursalId` y `username` se leen en el service desde `TenantContext` y se pasan como parámetros al DAO.
- El DAO solo recibe tipos primitivos (Integer, String), nunca inyecta `TenantContext`.

### Fechas en JPQL
- `fechaReg` es `LocalDateTime`. Para filtrar por rango de fechas recibidas como `LocalDate`:
```java
LocalDateTime desde = criteria.getFechaInicio().atStartOfDay();
LocalDateTime hasta  = criteria.getFechaFin().atTime(LocalTime.MAX);
```
- Nunca usar `CAST(o.fechaReg AS date)` en JPQL con Hibernate 6, no funciona correctamente.

### Guardar entidades desde el frontend
- El service siempre sobreescribe `empresaId` y `sucursalId` desde `TenantContext` antes de persistir, nunca confía en lo que envía el cliente.
- Corregir back-references del grafo JPA en el service antes de llamar al DAO (especialmente `@OneToMany` bidireccionales).

### Evitar referencias circulares en JSON
- Usar `@JsonIgnoreProperties({"campoQueGeneraCiclo"})` en el lado `@ManyToOne` de relaciones bidireccionales.
- Nunca devolver entidades completas con colecciones eager anidadas en endpoints de búsqueda.
- `@JsonIdentityInfo` solo aplica si la misma instancia Java aparece dos veces; no resuelve ciclos entre entidades diferentes.

---

## Esquema para crear un nuevo módulo (backend Java)

Al crear un módulo nuevo (ej. `InRequisicion`), seguir este orden exacto:

### 1 — Entidad JPA
```
jpa/{dominio}/NombreEntidad.java          ← extiende BaseSucursal o BaseEntityPk
jpa/{dominio}/NombreEntidadDetalle.java   ← si tiene líneas de detalle
```
- `@Table(name = "nombre_tabla", schema = "inventario"|"general"|etc.)`
- `@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")` en el header.
- `@JsonIgnoreProperties({"header"})` en el detalle para el lado `@ManyToOne`.
- `@OneToMany(cascade = CascadeType.ALL, mappedBy = "headerId", fetch = FetchType.EAGER)` en el header.

### 2 — DTOs
```
dto/{dominio}/NombreEntidadResumenDTO.java    ← campos para la tabla de búsqueda
dto/{dominio}/NombreEntidadSearchCriteria.java ← filtros + page/size
```
- `ResumenDTO` siempre tiene `@Data @NoArgsConstructor @AllArgsConstructor`.
- Incluir `secuencia` en el ResumenDTO si el módulo lo usa.

### 3 — DAO interface
```
dao/{dominio}/NombreEntidadDao.java
```
Métodos estándar:
```java
NombreEntidad save(NombreEntidad e);
Optional<NombreEntidad> findById(Integer id, Integer empresaId);
List<NombreEntidad> findAll(Integer empresaId);
void disableById(Integer id, Integer empresaId);
Page<NombreEntidadResumenDTO> searchByCriteria(NombreEntidadSearchCriteria criteria, Integer empresaId);
```

### 4 — DAO implementación
```
dao/{dominio}/NombreEntidadDaoImpl.java   ← @Repository
```
- `EntityManager` con JPQL; nunca SQL nativo para búsquedas.
- Proyección JPQL con `new com.braintech.eFacturador.dto...ResumenDTO(...)`.
- Subquery para nombres de entidades referenciadas solo por ID:
  `(SELECT a.nombre FROM InAlmacen a WHERE a.id = o.almacenId)`.

### 5 — Service interface
```
interfaces/{dominio}/NombreEntidadService.java
```

### 6 — Service implementación
```
services/{dominio}/NombreEntidadServiceImpl.java   ← @Service @AllArgsConstructor
```
- Lee `empresaId`, `sucursalId`, `username` de `TenantContext` **siempre**.
- En `save()` nuevo: set `fechaReg`, `usuarioReg`, `estadoId` inicial, luego llamar `secuenciasDao.getNextSecuencia(empresaId, Clase.class.getSimpleName().toUpperCase(Locale.ROOT))` en el **segundo** save.
- Llama `fixEntityGraph()` para back-references del grafo JPA.

### 7 — Controller REST
```
controllers/{dominio}/NombreEntidadController.java   ← @RestController
```
Ruta base estándar: `api/v1/{dominio}/{nombre-modulo-kebab-case}`
```
GET    /                  → getAll()
GET    /{id}              → getById()
POST   /                  → create()   [@RequierePermiso ESCRIBIR]
PUT    /{id}              → update()   [@RequierePermiso ESCRIBIR]
POST   /buscar            → buscar()   [sin permiso, filtra por tenant]
DELETE /{id}              → disable()  [@RequierePermiso ELIMINAR]
```

---

## Esquema para crear un nuevo módulo (frontend React/TypeScript)

### Naming conventions
| Artefacto | Nombre | Ruta |
|-----------|--------|------|
| Modelos TS | `NombreEntidad.tsx` | `src/models/{dominio}/NombreEntidad.tsx` |
| API client | `NombreEntidadController.tsx` | `src/apis/NombreEntidadController.tsx` |
| Componente | `NombreEntidadView.tsx` | `src/components/{dominio}/NombreEntidadView.tsx` |

### Funciones del API controller (`src/apis/`)
```typescript
// Una función por endpoint backend
buscarNombre(criteria: SearchCriteria): Promise<Page<ResumenDTO>>
getNombre(id: number): Promise<NombreEntidad>
saveNombre(dto: NombreEntidad): Promise<NombreEntidad>
updateNombre(id: number, dto: NombreEntidad): Promise<NombreEntidad>
disableNombre(id: number): Promise<void>
```
- Siempre usar la función `unwrapContent<T>()` local para desempaquetar la respuesta.
- La constante de ruta base se llama `BASE_URL` = `"/api/v1/{dominio}/{nombre-kebab}"`.

### Config de búsqueda modal (`src/types/modalSearchTypes.ts`)
Agregar a `SEARCH_CONFIGS`:
```typescript
NOMBRE_MODULO: {
    title: "Buscar ...",
    endpoint: "/api/v1/.../buscar",
    method: "POST",
    keyField: "id",
    searchOnLoad: true,
    pagination: { enabled: true, pageSize: 10 },
    defaultParams: { /* últimos 30 días */ },
    fields: [ /* filtros */ ],
    displayColumns: [ /* columnas de la tabla */ ],
} as SearchConfig
```

### Modelos TypeScript (`src/models/{dominio}/`)
- Exportar desde `index.tsx` del dominio.
- Incluir siempre: `ResumenDTO`, `SearchCriteria`, entidad principal y detalle.

---

## Documentación de referencia por módulo
Archivos disponibles en `contexto/` — lee solo los relevantes a la tarea:
- `alertas.md` — módulo de notificaciones, SSE, deduplicación, productores
- `requisiciones.md` — módulo de requisiciones de transferencia entre almacenes (estados, validaciones, layout, config de búsqueda de almacén con select de sucursal)
- `transferencia.md` — módulo de transferencia de inventario entre almacenes (lotes, stock en tiempo real, transferencias parciales, integración con requisiciones)
- `coloresapp.md` — paleta de colores oficial (monocromática, complementaria y tetrádica), reglas de botones en ActionBar
- `movimiento.md` — trigger `trg_actualiza_inventario`: lógica cr/débito, función `fn_actualiza_inventario_producto`, campos requeridos por movimiento

---

## Reglas generales del frontend

### API controllers
- Cada módulo tiene su propio archivo en `src/apis/`.
- Separar claramente: función de búsqueda (POST /buscar), función get por ID (GET /{id}), función save (POST), función update (PUT /{id}).

### Búsqueda modal
- Config en `src/types/modalSearchTypes.ts` con `SEARCH_CONFIGS.NOMBRE_MODULO`.
- `searchOnLoad: true` para que cargue resultados al abrir.
- `defaultParams` con rango de fechas razonable (últimos 30 días).
- El `onSelect` handler siempre llama al GET completo antes de usar el objeto.
