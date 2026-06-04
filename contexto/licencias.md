# Módulo de Licencias

Sistema de control de acceso por licencia a nivel de empresa. Determina qué módulos puede usar cada empresa y cuántos usuarios/sucursales puede crear.

---

## Tablas (schema `seguridad`)

### `sg_licencia`
Un registro por empresa. Define los límites cuantitativos.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `empresa_id` | INTEGER UNIQUE FK | Una licencia por empresa |
| `max_usuarios` | INTEGER | Máximo de usuarios con `estado_id <> 'INA'` |
| `max_sucursales` | INTEGER | Máximo de sucursales activas |
| `fecha_vencimiento` | DATE | NULL = sin vencimiento |
| `activo` | BOOLEAN | FALSE bloquea toda la empresa |
| `fecha_reg` / `usuario_reg` | | Auditoría |

### `sg_licencia_modulo`
Define qué módulos contrató cada empresa. FK a `sg_modulo`.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `empresa_id` | INTEGER FK | |
| `modulo_id` | VARCHAR(5) FK → `sg_modulo` | Ej: `FA`, `INV`, `DE`, `SEG` |
| `activo` | BOOLEAN | |
| UNIQUE | (empresa_id, modulo_id) | |

### Módulos disponibles en `sg_modulo`
| ID | Nombre |
|---|---|
| `FA` | Facturación |
| `INV` | Inventario |
| `DE` | Despacho |
| `SEG` | Seguridad |
| `CONT` | Contabilidad |
| `TAR` | Tarifario |

---

## Configuración por base de datos

```sql
-- 1. Crear licencia (límites)
INSERT INTO seguridad.sg_licencia (empresa_id, max_usuarios, max_sucursales, activo, fecha_reg, usuario_reg)
VALUES (2, 10, 3, TRUE, NOW(), 'Master');

-- 2. Habilitar módulos contratados
INSERT INTO seguridad.sg_licencia_modulo (empresa_id, modulo_id, activo, fecha_reg, usuario_reg)
VALUES (2, 'FA',  TRUE, NOW(), 'Master'),
       (2, 'INV', TRUE, NOW(), 'Master')
ON CONFLICT (empresa_id, modulo_id) DO UPDATE SET activo = TRUE;

-- 3. Deshabilitar un módulo
UPDATE seguridad.sg_licencia_modulo SET activo = FALSE
WHERE empresa_id = 2 AND modulo_id = 'DE';
```

---

## Endpoints REST (admin only — requiere estar autenticado como gestor con acceso)

Ruta base: `api/v1/admin/licencias`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista todas las licencias |
| GET | `/{empresaId}` | Licencia de una empresa |
| POST | `/` | Crear licencia |
| PUT | `/{empresaId}` | Actualizar límites o estado |
| GET | `/{empresaId}/modulos` | Módulos habilitados |
| POST | `/{empresaId}/modulos/{moduloId}` | Habilitar módulo |
| DELETE | `/{empresaId}/modulos/{moduloId}` | Deshabilitar módulo |

---

## Cómo se aplica la licencia

### 1. Sidebar de navegación (`HomeView`)
- Llama a `GET /api/seguridad/modulo/permitidos` → `ModuloServices.getFindByAll()`
- Filtra RBAC (permisos del usuario) + módulos sin licencia (`sinLicencia = true`)
- Solo devuelve módulos con licencia activa → el sidebar solo muestra los módulos contratados

### 2. Pantalla de Roles (`RolView`)
- Llama a `GET /api/seguridad/modulo/todos` → `ModuloServices.getTodos()`
- Devuelve todos los módulos con `sinLicencia: boolean`
- Módulos sin licencia aparecen con cabecera gris, chip naranja "Sin licencia" y mensaje
  *"No tiene licencia para este módulo. Contacte al administrador para habilitarlo."*
- Los checkboxes de módulos sin licencia están deshabilitados

### 3. Creación de usuarios (`SgUsuarioServiceImpl.save()`)
- Llama a `licenciaService.validarLimiteUsuarios(empresaId)` antes de persistir
- Lanza `LicenciaExcedidaException` (HTTP 402) si se alcanza `max_usuarios`

### 4. Creación de sucursales (`SgSucursalServiceImpl.save()`)
- Llama a `licenciaService.validarLimiteSucursales(empresaId)` antes de persistir
- Lanza `LicenciaExcedidaException` (HTTP 402) si se alcanza `max_sucursales`

### 5. Endpoints protegidos con `@RequierePermiso` (`PermisoAspect`)
- Después de validar RBAC, busca el `modulo_id` del menú por URL
- Si el módulo no está en `sg_licencia_modulo` con `activo = true` → HTTP 403

---

## Archivos del módulo

### Backend
| Archivo | Descripción |
|---|---|
| `jpa/seguridad/SgLicencia.java` | Entidad límites |
| `jpa/seguridad/SgLicenciaModulo.java` | Entidad módulos habilitados |
| `dao/seguridad/SgLicenciaRepository.java` | JPA repo |
| `dao/seguridad/SgLicenciaModuloRepository.java` | JPA repo |
| `interfaces/seguridad/LicenciaService.java` | Interface |
| `services/seguridad/LicenciaServiceImpl.java` | Implementación |
| `controllers/seguridad/LicenciaController.java` | REST controller |
| `exceptions/LicenciaExcedidaException.java` | HTTP 402 |
| `db-migrations/create_sg_licencia.sql` | DDL |

### Frontend
| Archivo | Campo/Cambio |
|---|---|
| `models/seguridad.tsx` | `sinLicencia?: boolean` en `ModuloDto` |
| `HomeView.tsx` | `refresh()` al autenticarse para limpiar caché del hook |
| `components/seguridad/RolView.tsx` | Sección deshabilitada con mensaje para módulos sin licencia |

---

## Reglas clave
- **Ninguna empresa está exenta**: `empresa_id = 1` también respeta su `sg_licencia_modulo`
- Los endpoints de gestión (`/api/v1/admin/*`) no tienen `@RequierePermiso`, no se ven afectados
- `LicenciaExcedidaException` → HTTP 402, body: `{ status: "LICENCIA_EXCEDIDA", message: "..." }`
- El hook `useSharedModulos` tiene caché singleton en memoria; llama `refresh()` en cada login
