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

## Documentación de referencia por módulo
Archivos disponibles en `contexto/` — lee solo los relevantes a la tarea:
- `alertas.md` — módulo de notificaciones, SSE, deduplicación, productores

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
