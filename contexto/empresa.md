# Módulo Empresa y Sucursales

## Propósito
Configuración de datos de la empresa (tenant) y gestión de sus sucursales. Este módulo es multi-tenant: cada empresa solo ve y modifica sus propios datos.

---

## Entidades JPA

### `SgEmpresa` — `seguridad.sg_empresa`
Tabla de catálogo global (no tiene `empresaId`). JPA: `@AllArgsConstructor @NoArgsConstructor`. **No usar `new SgEmpresa(id)` — no existe ese constructor.** Para referencias por id, usar `new SgEmpresa()` + `setId(id)`.

| Campo | Tipo | Columna |
|-------|------|---------|
| id | Integer (PK, autogen) | id |
| empresa | String | empresa |
| rnc | String | rnc (9-11 chars) |
| razonSocial | String | razon_social |
| telefono | String | telefono |
| correo | String | correo |
| direccion | String | direccion |
| logo | byte[] | logo |
| reportePath | String | reporte_path |
| apikey | String | apikey |
| apiKeyActivo | Boolean | api_key_activo |
| tipoRetencion | Integer | tipo_retencion (default 0) |
| usuarioReg | String | usuario_reg (NOT NULL) |
| fechaReg | LocalDateTime | fecha_reg (NOT NULL) |
| activo | Boolean | activo |

`@Transient getClienteId()` → `rnc.replace("-", "")` (usado para DGII).

### `SgSucursal` — `seguridad.sg_sucursal`
Tiene `empresa_id` FK. **Sí es multi-tenant** (filtrar siempre por `empresaId` del `TenantContext`).

| Campo | Tipo | Notas |
|-------|------|-------|
| id | Integer (PK, autogen) | |
| nombre | String | |
| encargado | String | |
| direccion | String | |
| email | String | |
| estadoId | String | "ACT" / "INA" |
| activo | Boolean | |
| empresa | SgEmpresa (@ManyToOne EAGER) | FK empresa_id |
| usuarioReg | String (NOT NULL) | |
| fechaReg | LocalDateTime (NOT NULL) | |

Constructor de conveniencia disponible: `new SgSucursal(Integer id)`.

---

## Backend

### DAOs

**`EmpresaDao`** — `JpaRepository<SgEmpresa, Integer>`. Sin queries custom; usa `findById(id)` y `save()` estándar.

**`SgSucursalRepository`** — `JpaRepository<SgSucursal, Integer>` + queries:
```java
// Por empresa (activas e inactivas)
findByEmpresaId(Integer empresaId)

// Solo activas de la empresa — SIEMPRE usar este en listados
findActiveByEmpresaId(Integer empresaId)
// Query: SELECT s FROM SgSucursal s WHERE s.empresa.id = :empresaId AND s.activo = true

// Conteo para validación de licencia
countByEmpresaIdAndActivoTrue(Integer empresaId)
```

> **Nota:** existía `findAllActive()` sin filtro de empresa — fue reemplazado por `findActiveByEmpresaId`. No recrear sin filtro.

### Services

**`EmpresaServices`**
- `getCurrent()` → lee `empresaId` de `TenantContext` → llama `getFindById(empresaId)`. **Siempre usar este método en el controller.**
- `getFindById(Integer id)` → búsqueda directa por id (solo para admin).
- `save(SgEmpresa)` → guarda sin sobreescribir tenant (empresa es catálogo global).

**`SgSucursalServiceImpl`** — inyecta `TenantContext` via `@Autowired`.
- `getFindAllActive()` → `tenantContext.getCurrentEmpresaId()` → `findActiveByEmpresaId(empresaId)`.
- `getFindByAll()` → `tenantContext.getCurrentEmpresaId()` → `findByEmpresaId(empresaId)`.
- `save()` → **sobreescribe siempre** `empresa` desde `TenantContext` antes de persistir:
  ```java
  SgEmpresa emp = new SgEmpresa();
  emp.setId(tenantContext.getCurrentEmpresaId());
  sucursal.setEmpresa(emp);
  ```
  También valida límite de sucursales via `licenciaService.validarLimiteSucursales(empresaId)` en creación nueva.

  > **IMPORTANTE:** el `catch` del `save()` tiene dos ramas separadas. `LicenciaExcedidaException` se relanza (`throw e`) para que llegue al `GlobalDatabaseExceptionHandler` y retorne HTTP 402. El `catch (Exception e)` genérico solo captura errores de persistencia JPA.
  > Si se atrapa todo con un solo `catch (Exception e)` la excepción se convierte en un `Response` con error interno y el controller devuelve HTTP 200, haciendo que el frontend entre al `.then()` y muestre "guardado" incorrectamente.

### Controllers

**`EmpresaController`** — `GET /api/seguridad/empresa`
```java
// CORRECTO — usa TenantContext internamente
Response<?> response = services.getCurrent();

// INCORRECTO — no hardcodear id
// Response<?> response = services.getFindById(1);  ← bug corregido 2026-06-20
```

**`SgSucursalController`** — base `/api/v1/seguridad/sucursales`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Sucursales activas de la empresa (usa `getFindAllActive`) |
| GET | `/all` | Todas las sucursales de la empresa (activas e inactivas) |
| GET | `/{id}` | Por id |
| POST | `/` | Crear sucursal |
| PUT | `/{id}` | Actualizar sucursal |
| DELETE | `/{id}` | Deshabilitar (estadoId = "INA") |

---

## Frontend

### API clients (`src/apis/`)

**`EmpresaController.tsx`** — base `/api/seguridad/empresa`
```typescript
getEmpresa(): Promise<SgEmpresa>   // GET /
saveEmpresa(dto): Promise<SgEmpresa> // POST /
```
> Nota: no usa el patrón `unwrapContent<T>()` estándar — desempaqueta manualmente `x.data.content`.

**`SucursalController.tsx`** — base `/api/v1/seguridad/sucursales`
```typescript
getSucursalesActivas(): Promise<SgSucursal[]>            // GET /  (solo activas)
getSucursales(): Promise<SgSucursal[]>                   // GET /all (todas)
getSucursalById(id): Promise<SgSucursal>                 // GET /{id}
saveSucursal(dto): Promise<SgSucursal>                   // POST /
updateSucursal(id, dto): Promise<SgSucursal>             // PUT /{id}
disableSucursal(id): Promise<void>                       // DELETE /{id}

// Hooks singleton — evitan llamadas duplicadas cuando varios componentes los usan
useSharedSucursalesActivas  // singleton de getSucursalesActivas
useSharedSucursalesAll      // singleton de getSucursales
```

### Modelos TS (`src/models/seguridad/`)

```typescript
// SgEmpresa.tsx
interface SgEmpresa {
    id: number; empresa: string; rnc: string; razonSocial: string;
    telefono: string; correo: string; direccion: string;
    logo?: Uint8Array; reportePath: string;
    // apikey y apiKeyActivo están en backend pero no en el modelo TS
}

// SgSucursal.tsx
interface SgSucursal {
    id?: number; nombre: string; encargado: string; direccion: string;
    email: string; estadoId: string; usuarioReg: string;
    fechaReg: Date; activo: boolean; empresa: SgEmpresa;
}
```

> **Pendiente:** `SgEmpresa` en TS no incluye `apikey` ni `apiKeyActivo` aunque el backend los tiene. `EmpresaView.tsx` los maneja via `useForm` pero el modelo no los expone.

### `EmpresaView.tsx`
Componente con dos tabs: **Empresa** y **Sucursales**.

- Tab Empresa: carga con `getEmpresa()` en `useEffect`, guarda con `saveEmpresa()`.
- Tab Sucursales: carga con `getSucursales()` (todas, para permitir editar inactivas). Lista en `TableComponent`. Al click en fila popula el form. Botón "Nuevo" limpia el form.
- El logo se maneja como `byte[]` → `Uint8Array` → input file con `FileReader.readAsArrayBuffer`.
- `empresaId` se guarda en state local para asignarlo al crear sucursal (`empresa: { id: empresaId }`). El backend ignora este valor y lo sobreescribe desde `TenantContext`.

**Notificaciones:** usa el patrón `Snackbar` + `Alert` de MUI con `autoHideDuration={4000}` y `anchorOrigin={{ vertical: "top", horizontal: "right" }}`. Estado: `{ open, message, severity }`. Helper `showSnackbar(msg, severity)`. Mismo patrón que `ProductoView.tsx`.
- Éxito → `severity="success"`
- Error (incluyendo licencia excedida) → `severity="error"`, mensaje viene de `error?.response?.data?.message`
- Al recargar sucursales tras guardar usar `data ?? []` para evitar `setSucursales(null)` cuando el backend devuelve lista vacía.

---

## Reglas y advertencias

1. **`EmpresaController` siempre llama `services.getCurrent()`**, nunca `getFindById` con id hardcodeado.
2. **Toda consulta de sucursales filtra por `empresaId`** — nunca usar `findAll()` ni `findAllActive()` sin filtro.
3. **`SgEmpresa` no tiene constructor `(Integer id)`** — para referencias JPA, usar `new SgEmpresa()` + `setId(id)`.
4. **`SgSucursalService.save()` sobreescribe empresa desde `TenantContext`** — el cliente no puede inyectar un `empresaId` diferente.
5. **Los hooks `useShared*` son singletons** — si un componente actualiza sucursales, invalidar el hook o recargar directamente.
6. **En `save()` nunca atrapar `LicenciaExcedidaException` con `catch (Exception e)` genérico** — relanzarla siempre para que el `@ControllerAdvice` devuelva HTTP 402. Si se atrapa, el controller retorna HTTP 200 y el frontend no detecta el error.
