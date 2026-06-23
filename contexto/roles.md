# Módulo de Roles y Permisos — Contexto técnico

## Propósito

Gestiona el control de acceso basado en roles (RBAC) con soporte multi-tenant y multi-sucursal. Un rol agrupa un conjunto de permisos (por menú) y se asigna a usuarios por sucursal. La autorización es siempre explícita: sin registro en `sg_permiso` no hay acceso.

---

## Modelo de datos

### Jerarquía de entidades

```
SgRol (por empresa)
  └── SgPermiso[] (uno por menú habilitado)
        └── SgMenu (catálogo global — no filtrado por tenant)

SgUsuarioRol (por empresa + sucursal)
  ├── SgRol
  ├── SgUsuario
  └── SgSucursal
```

### `seguridad.sg_rol`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `empresa_id` | INTEGER NOT NULL | Multi-tenant |
| `secuencia` | INTEGER | Número visible al usuario (por empresa) |
| `nombre` | VARCHAR(100) | Único por empresa (`UNIQUE (empresa_id, nombre)`) |
| `descripcion` | VARCHAR(255) | |
| `activo` | BOOLEAN DEFAULT TRUE | Soft-delete |
| `fecha_reg` | TIMESTAMP NOT NULL | |
| `usuario_reg` | VARCHAR(50) NOT NULL | |

### `seguridad.sg_permiso`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `empresa_id` | INTEGER NOT NULL | |
| `rol_id` | INTEGER FK → `sg_rol(id)` | |
| `menu_id` | INTEGER FK → `sg_menu(id)` | |
| `puede_leer` | BOOLEAN DEFAULT FALSE | |
| `puede_escribir` | BOOLEAN DEFAULT FALSE | |
| `puede_eliminar` | BOOLEAN DEFAULT FALSE | |
| `puede_imprimir` | BOOLEAN DEFAULT FALSE | |
| `activo` | BOOLEAN DEFAULT TRUE | |
| `fecha_reg` | TIMESTAMP NOT NULL | |
| `usuario_reg` | VARCHAR(50) NOT NULL | |

Restricción: `UNIQUE (empresa_id, rol_id, menu_id)` — un solo registro de permisos por combinación rol+menú.

### `seguridad.sg_usuario_rol`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `empresa_id` | INTEGER NOT NULL | |
| `username` | VARCHAR(20) FK → `sg_usuario(username)` | |
| `rol_id` | INTEGER FK → `sg_rol(id)` | |
| `sucursal_id` | INTEGER FK → `sg_sucursal(id)` | Un usuario puede tener roles distintos por sucursal |
| `activo` | BOOLEAN DEFAULT TRUE | |
| `fecha_reg` | TIMESTAMP NOT NULL | |
| `usuario_reg` | VARCHAR(50) NOT NULL | |

Restricción: `UNIQUE (empresa_id, sucursal_id, username, rol_id)`.

Migración completa: `db-migrations/create_sg_roles_permisos.sql`

---

## Módulo de menús (`sg_menu`)

Catálogo **global** (no tiene `empresa_id`). Un menú tiene:
- `url` — ruta React (ej. `/roles`, `/productos`). Es el identificador usado en `@RequierePermiso`.
- `modulo_id` — referencia a `sg_modulo` (ej. `SEG`, `IN`, `FAC`). Se verifica en `PermisoAspect` contra la licencia de la empresa.
- `tipo_menu_id` — tipo A = accesible desde el sidebar.

El endpoint `GET /api/seguridad/modulo/todos` retorna **todos** los módulos y sus menús (para la UI de gestión de roles). El endpoint `GET /api/seguridad/modulo/permitidos` retorna solo los menús donde el usuario autenticado tiene `puede_leer = true`.

---

## Backend

### Entidades JPA (`jpa/seguridad/`)

- **`SgRol`**: extiende base manual (no `BaseSucursal`), tiene `empresaId` directo.
  - `@OneToMany(cascade = CascadeType.ALL, mappedBy = "rol")` → `permisos`
  - `@OneToMany(fetch = LAZY, mappedBy = "rol")` → `usuariosRol`
  - Usa `@JsonManagedReference("rol-permisos")` en `permisos`.
- **`SgPermiso`**: `@ManyToOne(fetch = LAZY)` → `SgRol` con `@JsonBackReference("rol-permisos")`. `@ManyToOne(fetch = EAGER)` → `SgMenu`.
- **`SgUsuarioRol`**: `@ManyToOne(fetch = EAGER)` → `SgUsuario` y `SgSucursal`. `@ManyToOne(fetch = LAZY)` → `SgRol`.

### Repositories (`dao/seguridad/`)

**`SgRolRepository`** — Spring Data JPA:
- `buscar(empresaId, nombre)` → `List<SgRolResumenDTO>` con conteo de permisos activos y usuarios asignados. Sin filtro de fechas — retorna todos los roles de la empresa ordenados por nombre.
- `findByIdAndEmpresaId(id, empresaId)` — acceso seguro multi-tenant.

**`SgPermisoRepository`**:
- `findByRolIdAndEmpresaId()` — todos los permisos de un rol.
- `findByRolIdAndMenuIdAndEmpresaId()` — lookup de upsert (¿ya existe el par rol+menú?).
- `deleteByRolIdAndEmpresaId()` — `@Modifying` — borra todos los permisos del rol antes de re-insertar.
- `findPermisosForMenu(username, empresaId, sucursalId, menuUrl)` — **crítico**: retorna los `SgPermiso` del usuario para una URL específica. Usado por `PermisoAspect` en cada request.
- `findMenuIdsPermitidos(username, empresaId, sucursalId)` → `Set<Integer>` de menús con `puede_leer`.
- `findMenuUrlsPermitidas(username, empresaId, sucursalId)` → `Set<String>` de URLs permitidas (usado por alertas/notificaciones).

**`SgUsuarioRolRepository`**:
- `findByRolAndSucursal(rolId, sucursalId, empresaId)` — usuarios del rol en una sucursal.
- `findActiveByUsuarioAndSucursal(username, sucursalId, empresaId)` — roles activos del usuario en su sucursal.
- `findSucursalesActivasByUsername(username, empresaId)` — todas las sucursales donde el usuario tiene algún rol activo (usado en login multi-sucursal).

### Service (`SgRolServiceImpl`)

**`save(rol)`** — lógica de INSERT vs UPDATE:

- **INSERT (id == null):**
  1. Set `empresaId`, `usuarioReg`, `fechaReg` desde `TenantContext`.
  2. Para cada `SgPermiso` del array: hace lookup `findByRolIdAndMenuIdAndEmpresaId()`. Si ya existe (raro en insert), reutiliza el ID y campos de auditoría; si no, crea nuevo.
  3. Primer `save()` → obtiene el `id` autoincremental.
  4. Llama `secuenciasDao.getNextSecuencia(empresaId, "SGROL")`.
  5. Segundo `save()` con la secuencia asignada.

- **UPDATE (id != null):**
  1. Carga la entidad managed con `findByIdAndEmpresaId()`.
  2. **Limpia** el `List<SgPermiso>` y llama `saveAndFlush()` — esto ejecuta el DELETE en BD inmediatamente, evitando violación de constraint único al re-insertar.
  3. Agrega los nuevos `SgPermiso` al managed entity, setea flags `null` a `false`.
  4. Llama `save()` final.

> **Razón del doble-flush en update:** Hibernate agrupa DELETE + INSERT; si el INSERT llega primero viola `uq_sg_permiso_rol_menu`. El `saveAndFlush()` intermedio garantiza el orden correcto.

**`addUsuarioRol(rolId, username, sucursalId)`:**
- Crea `SgUsuarioRol`, setea campos de auditoría desde `TenantContext`.
- Si `sucursalId == null`, usa `TenantContext.getCurrentSucursalId()`.
- Valida que `SgRol`, `SgUsuario` y `SgSucursal` existen antes de persistir.

### Controller (`SgRolController`)

Base: `api/v1/seguridad/rol`

| Método | Ruta | Descripción | Permiso |
|---|---|---|---|
| POST | `/buscar` | Búsqueda paginada | (filtro tenant) |
| GET | `/{id}` | Rol completo con permisos | |
| POST | `/` | Crear rol | `@RequierePermiso("/roles", ESCRIBIR)` |
| PUT | `/{id}` | Actualizar rol | `@RequierePermiso("/roles", ESCRIBIR)` |
| GET | `/{id}/usuarios` | Listar asignaciones de usuarios | |
| POST | `/{id}/usuarios` | Asignar usuario (`{username, sucursalId}`) | `@RequierePermiso("/roles", ESCRIBIR)` |
| DELETE | `/{id}/usuarios/{asignacionId}` | Remover asignación | `@RequierePermiso("/roles", ELIMINAR)` |

---

## Sistema de autorización

### Anotación `@RequierePermiso`

```java
@RequierePermiso(menuUrl = "/productos", accion = Accion.ESCRIBIR)
@PostMapping
public ResponseEntity<MgProducto> create(@RequestBody MgProducto p) { ... }
```

- `menuUrl`: URL exacta del registro en `sg_menu.url`.
- `accion`: `LEER | ESCRIBIR | ELIMINAR | IMPRIMIR`.

### `PermisoAspect` (AOP `@Before`)

Flujo por cada request protegido:

```
1. ¿Es usuario de soporte? → solo LEER está permitido
2. findPermisosForMenu(username, empresaId, sucursalId, menuUrl)
   → Une sg_usuario_rol (activo) + sg_permiso por menuUrl
3. ¿Algún SgPermiso tiene el flag requerido en true?
   → No: lanza AccesoDenegadoException (HTTP 403)
4. Verifica licencia: ¿el módulo del menú está en sg_licencia_modulo?
   → No: lanza AccesoDenegadoException (HTTP 403)
5. Permite continuar
```

La URL del menú se resuelve a `modulo_id` vía `SgMenuRepository.findModuloIdByUrl()` para la verificación de licencia.

---

## Frontend

### Modelos TypeScript (`src/models/seguridad.tsx`)

```typescript
interface SgRol {
    id?: number;
    empresaId?: number;
    secuencia?: number;
    activo: boolean;
    fechaReg?: string;
    usuarioReg?: string;
    nombre: string;
    descripcion?: string;
    permisos: SgPermiso[];
}

interface SgPermiso {
    id?: number;
    empresaId?: number;
    activo?: boolean;
    menu: { id: number; menu?: string; url?: string; moduloId?: string } | number;
    puedeLeer: boolean;
    puedeEscribir: boolean;
    puedeEliminar: boolean;
    puedeImprimir: boolean;
}

interface SgRolResumenDTO {
    id: number;
    secuencia?: number;
    fechaReg: string;
    nombre: string;
    descripcion?: string;
    cantidadPermisos: number;
    cantidadUsuarios: number;
    usuarioReg: string;
    activo: boolean;
}

interface SgUsuarioRol {
    id?: number;
    empresaId?: number;
    activo?: boolean;
    fechaReg?: string;
    usuarioReg?: string;
    usuario: { username: string; nombre: string };
    sucursalId: { id: number; nombre: string };
}

interface ModuloDto {
    id: string;
    modulo: string;
    menus: MenuDto[];
    sinLicencia?: boolean;
}

interface MenuDto {
    id: number;
    menu: string;
    url: string;
    urlSql: string;
}
```

### API Client (`src/apis/RolController.tsx`)

```typescript
const BASE_URL = "/api/v1/seguridad/rol";

buscarRoles(criteria: SgRolSearchCriteria)   → Promise<Page<SgRolResumenDTO>>
getRol(id: number)                            → Promise<SgRol>
saveRol(rol: SgRol)                           → Promise<SgRol>
updateRol(id: number, rol: SgRol)             → Promise<SgRol>
getUsuariosRol(rolId: number)                 → Promise<SgUsuarioRol[]>
addUsuarioRol(rolId, username, sucursalId)    → Promise<SgUsuarioRol>
removeUsuarioRol(rolId, asignacionId)         → Promise<void>
```

Módulos: `GET /api/seguridad/modulo/todos` retorna `ModuloDto[]` (todos los módulos con sus menús).

### Componente `RolView.tsx` (`src/components/seguridad/RolView.tsx`)

Interfaz de dos pestañas:

**Pestaña 0 — Permisos por Módulo:**
- Matriz jerárquica: módulo → menús → columnas (Leer, Escribir, Eliminar, Imprimir).
- Controles de selección masiva:
  - Checkbox en **header de columna**: activa/desactiva esa acción en todos los menús visibles.
  - Checkbox en **header de módulo**: activa/desactiva todos los permisos de todos los menús del módulo.
  - Checkbox en **fila de menú**: activa/desactiva todos los flags de ese menú.
- Módulos `sinLicencia = true` aparecen grisados y deshabilitados.
- Estado interno `matrix: Record<menuId, {leer, escribir, eliminar, imprimir}>`.
- Al guardar: convierte `matrix` a `SgPermiso[]` incluyendo solo filas con al menos un flag `true`.

**Pestaña 1 — Usuarios Asignados:**
- Tabla de `SgUsuarioRol[]` para el rol seleccionado en la sucursal actual.
- Botón "Agregar usuario" → `ModalSearch` para seleccionar usuario → wizard de sucursales.
- Wizard de asignación:
  - Paso 0: resumen del usuario seleccionado.
  - Paso 1: listado de sucursales de la empresa con checkboxes. Las sucursales donde el usuario ya tiene el rol aparecen pre-marcadas.
  - Al confirmar: calcula delta (nuevas = marcar y no estaban; removidas = desmarcar y sí estaban). Llama `addUsuarioRol` para nuevas y `removeUsuarioRol` para removidas.

**Búsqueda modal de roles** (`SEARCH_CONFIGS.ROL` en `modalSearchTypes.ts`):
- `POST /api/v1/seguridad/rol/buscar` con filtro: `nombre` (opcional). Sin fechas — retorna todos los roles de la empresa ordenados por nombre.
- Columnas: No. (secuencia), Nombre, Permisos, Usuarios, Usuario Reg., Estado.

---

## Flujos clave

### Verificar acceso en el backend (por request)

```
Request → PermisoAspect → findPermisosForMenu() → flag check → licencia check → continuar o 403
```

### Crear un rol nuevo

```
RolView → saveRol(rol) →
  SgRolController.save() →
  SgRolServiceImpl.save() [sin id] →
    set audit fields →
    upsert permisos (lookup por rol+menu+empresa) →
    repository.save() → obtiene id →
    secuenciasDao.getNextSecuencia(empresaId, "SGROL") →
    repository.save() con secuencia →
  return SgRol completo
```

### Actualizar un rol existente

```
RolView → updateRol(id, rol) →
  SgRolController.update(id) →
  SgRolServiceImpl.save() [con id] →
    findByIdAndEmpresaId() → managed entity →
    permisos.clear() + saveAndFlush() → DELETE en BD →
    permisos.addAll(nuevos) + save() → INSERT en BD →
  return SgRol actualizado
```

### Construir el menú lateral del usuario

```
Login exitoso → frontend llama GET /api/seguridad/modulo/permitidos →
  SgPermisoRepository.findMenuIdsPermitidos(username, empresaId, sucursalId) →
  Filtra sg_menu por los IDs devueltos →
  Agrupa por módulo →
  Retorna ModuloDto[] con solo los menús permitidos
```

---

## Notas importantes

- **No borrar permisos, siempre recrear:** La estrategia de update (clear + flush + re-insert) es intencional. No intentar optimizarla con merge in-place sin entender el constraint `uq_sg_permiso_rol_menu`.
- **`sg_menu` no es multi-tenant:** No filtrar `SgMenu` por `empresaId`. Es catálogo global del sistema.
- **Módulo SEG en licencia:** El módulo de seguridad (`SEG`) debe estar en `sg_licencia_modulo` de la empresa para que cualquier endpoint de `/api/v1/seguridad/` sea accesible. El bootstrap admin lo inserta automáticamente.
- **Soporte = solo lectura:** Usuarios de soporte (empresa_id=1 con flag de soporte) tienen implícitamente `puedeLeer=true` en todo, pero `puedeEscribir/Eliminar/Imprimir=false` siempre.
- **Roles en eFacturadorManagement:** La app de management puede crear roles en empresas cliente vía el bootstrap admin (`POST /api/v1/admin/empresas/{id}/bootstrap-admin`), que inserta el rol ADMIN con permisos en módulo SEG.
