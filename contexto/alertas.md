# Módulo de Notificaciones — Resumen técnico

> **Para la app de management externa:** ver sección [API para management](#api-para-management) al final del archivo. Contiene todos los endpoints, el modelo de datos y ejemplos de payload listos para consumir.

## Base de datos (PostgreSQL, schema `general`)

### `sg_notificacion` — tabla central

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `empresa_id` | INTEGER | Tenant |
| `sucursal_id` | INTEGER | Null = toda la empresa |
| `modulo` | VARCHAR(30) | `INVENTARIO` \| `COMPRAS` \| `APROBACIONES` |
| `tipo` | VARCHAR(50) | `VENCIMIENTO` \| `STOCK_BAJO` \| `APROBACION_PENDIENTE` \| … |
| `titulo` | VARCHAR(200) | Texto legible para el usuario |
| `descripcion` | TEXT | Detalle |
| `referencia_id` | INTEGER | ID del objeto origen (producto, orden, etc.) |
| `referencia_tipo` | VARCHAR(50) | `InLote` \| `MgProducto` \| … |
| `referencia_key` | VARCHAR(200) | Clave de negocio para deduplicar. VENCIMIENTO: `"lote:productoId"`, STOCK_BAJO: `"productoId:almacenId"` |
| `payload` | JSONB | Datos estructurados específicos del tipo |
| `menu_url_origen` | VARCHAR(200) | NULL = global (todos la ven). Con valor = solo usuarios con `puedeLeer=true` en ese menú (`sg_menu.url`). **Solo aplica al badge/campana, no al modal login.** |
| `para_login` | BOOLEAN | Si `TRUE`, aparece en el wizard bloqueante al iniciar sesión |
| `repetir_login` | BOOLEAN | `FALSE` (default): desaparece tras el primer "Entendido". `TRUE`: reaparece en cada login hasta `fecha_expiracion` |
| `fecha_expiracion` | TIMESTAMPTZ | Fecha límite de aparición en el login. `NULL` = sin límite |
| `estado_id` | VARCHAR(10) | `ACT` \| `CER` |
| `fecha_reg` | TIMESTAMPTZ | |
| `usuario_reg` | VARCHAR(45) | |
| `fecha_cierre` | TIMESTAMPTZ | |
| `usuario_cierre` | VARCHAR(45) | |

**Índices:**
- `idx_notif_tenant_estado` → `(empresa_id, sucursal_id, estado_id, fecha_reg)`
- `idx_notif_dedup` → `(modulo, tipo, referencia_key, empresa_id, estado_id)`

### `sg_notificacion_destinatario` — destinatarios específicos (schema `general`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `notificacion_id` | FK → sg_notificacion | CASCADE DELETE |
| `username` | VARCHAR(45) | |
| UNIQUE | `(notificacion_id, username)` | |

**Regla:** si la notificación tiene al menos una fila aquí → solo esos usuarios la ven en el login (ignora `acceso_restringido` del tipo). Si no tiene filas → aplica la regla del tipo.

---

### `sg_notificacion_tipo_config` — catálogo de tipos (schema `seguridad`)

| Campo | Tipo | Descripción |
|---|---|---|
| `tipo_id` | VARCHAR(50) PK | Ej: `VENCIMIENTO`, `STOCK_BAJO`, `RECORDATORIO` |
| `nombre` | VARCHAR(100) | Label legible |
| `modulo` | VARCHAR(30) | Solo categoría visual, no controla acceso |
| `para_login` | BOOLEAN | Si `TRUE`, el tipo puede aparecer en el modal login |
| `acceso_restringido` | BOOLEAN | `FALSE` = todos los usuarios lo ven sin suscribirse. `TRUE` = solo usuarios suscritos |
| `activo` | BOOLEAN | |

**Regla de acceso al modal login:**
- `acceso_restringido = FALSE` → va al set `tiposNoRestringidos` → cualquier usuario del tenant lo ve al login
- `acceso_restringido = TRUE` → solo usuarios con registro en `sg_usuario_notif_suscripcion` para ese tipo

### `sg_usuario_notif_suscripcion` — suscripciones (schema `seguridad`)

| Campo | Tipo |
|---|---|
| `empresa_id` | INTEGER |
| `username` | VARCHAR(45) |
| `tipo_id` | FK → sg_notificacion_tipo_config |
| UNIQUE | `(empresa_id, username, tipo_id)` |

### `sg_notificacion_visto` — visto por usuario

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `notificacion_id` | FK → sg_notificacion | |
| `username` | VARCHAR(45) | |
| `fecha_visto` | TIMESTAMPTZ | |
| UNIQUE | `(notificacion_id, username)` | Idempotencia |

---

## Backend — estructura de paquetes

```
jpa/notificacion/
  SgNotificacion.java               ← entidad principal (incluye paraLogin)
  SgNotificacionVisto.java          ← junction por usuario
  SgNotificacionTipoConfig.java     ← catálogo tipos (accesoRestringido, paraLogin)
  SgUsuarioNotifSuscripcion.java    ← suscripciones por usuario
dao/notificacion/
  SgNotificacionRepository.java           ← findActivasByTenant, contarNoVistas, dedup, findLoginPendientes
  SgNotificacionVistoRepository.java      ← existsByNotificacionIdAndUsername
  SgNotificacionTipoConfigRepository.java ← findTiposNoRestringidos()
  SgUsuarioNotifSuscripcionRepository.java
dto/notificacion/
  SgNotificacionDTO.java            ← flat DTO + campos "visto" y "paraLogin"
  SgNotificacionTipoConfigDTO.java  ← incluye flag "suscrito" por usuario
interfaces/notificacion/
  SgNotificacionService.java
services/notificacion/
  SgNotificacionServiceImpl.java    ← findLoginPendientes: tiposNoRestringidos ∪ tiposSuscritos
controllers/notificacion/
  SgNotificacionController.java     ← /api/v1/notificaciones
sse/
  InAlertaSseService.java           ← gestiona emitters SSE por tenant (empresaId-sucursalId)
```

---

## REST endpoints — `/api/v1/notificaciones`

| Método | Path | Descripción |
|---|---|---|
| GET | `/` | Todas las activas del tenant con `visto` por usuario |
| GET | `/modulo/{modulo}` | Filtradas por módulo |
| GET | `/contador` | `{ noVistas: N }` para el badge |
| GET | `/stream` | Conexión SSE. Token via `?token=` (EventSource no soporta headers) |
| POST | `/{id}/visto` | Marca como vista. Idempotente |
| PUT | `/{id}/cerrar` | Cierra la notificación (`estadoId = 'CER'`) |
| GET | `/login` | Notificaciones pendientes al login para el usuario autenticado |
| GET | `/tipos` | Catálogo de tipos activos |
| GET | `/tipos/{username}` | Catálogo con flag `suscrito` para el usuario |
| PUT | `/tipos/{username}/suscripciones` | Guarda suscripciones del usuario (reemplaza) |
| PATCH | `/tipos/{tipoId}` | Actualiza `paraLogin` / `accesoRestringido` / `activo` (admin) |

---

## Productores de notificaciones

### `InLoteVencimientoScheduler` — cron `0 0 6 * * *` (6am diario)
- Native query sobre `inventario.in_lote` buscando lotes por vencer
- Deduplication via `NOT EXISTS` en `sg_notificacion`
- `referenciaKey = "lote:productoId"`
- `menuUrlOrigen = "/lotes"` — solo la ven usuarios con acceso al menú Lotes
- Llama `sseService.push(empresaId, sucursalId)` por cada notificación creada

### `InAlertaInventarioListener` — `@Async("alertasExecutor")` + `@TransactionalEventListener(AFTER_COMMIT)` + `@Transactional(REQUIRES_NEW)`
- Se dispara con `InStockBajoEvent`, publicado por `InMovimientoServiceImpl` en cada movimiento
- Corre **después del commit** de la transacción principal (evita race condition con `READ COMMITTED`)
- Compara el **total de todos los lotes** (`SUM` en `in_inventarios`) contra el límite — nunca el saldo de un lote individual
- **Caso saludable sin alerta activa → `return` inmediato** (2 queries, sin writes)
- Primer cruce del límite → `updateEstado='BAJO'` + crear notificación + SSE push
- Sigue bajo → actualizar payload con nueva cantidad (sin nuevo push)
- Recuperación → `updateEstado='SALUDABLE'` + cerrar notificación (`CER`)
- `referenciaKey = "productoId:almacenId"`
- `menuUrlOrigen = "/almacenes"` — solo la ven usuarios con acceso al menú Almacenes
- Actualiza `in_inventarios.estado_producto_inventario` para todos los lotes del producto-almacén

### `InRequisicionServiceImpl.save()` — al crear una requisición nueva
- Se dispara en el `save()` del service, después del segundo save (cuando ya tiene `secuencia`)
- `tipo = "REQUISICION_PENDIENTE"`, `modulo = "INVENTARIO"`
- `referenciaKey = "requisicion:{id}"` — una por requisición, sin deduplicación adicional
- `menuUrlOrigen = "/transferencias"` — solo la ven usuarios con acceso al menú Transferencias
- `payload`: `{ requisicionId, secuencia, almacenSolicitanteId, almacenOrigenId, prioridad }`
- Llama `sseService.push(empresaId, sucursalId)` al crear

### Para agregar un nuevo productor (aprobaciones, límite de producto, etc.)

```java
SgNotificacion notif = new SgNotificacion();
notif.setEmpresaId(empresaId);
notif.setSucursalId(sucursalId);
notif.setModulo("APROBACIONES");         // módulo nuevo
notif.setTipo("APROBACION_PENDIENTE");   // tipo nuevo
notif.setTitulo("...");
notif.setDescripcion("...");
notif.setReferenciaKey("ordenId:" + id); // clave única para dedup
notif.setPayload(Map.of(...));
notif.setMenuUrlOrigen("/url-del-menu"); // URL de sg_menu.url; null = global
notif.setEstadoId("ACT");
notif.setFechaReg(LocalDateTime.now());
notif.setUsuarioReg(username);
notificacionRepository.save(notif);
sseService.push(empresaId, sucursalId);
```

---

## SSE — cómo funciona

- `InAlertaSseService` mantiene un `ConcurrentHashMap<String, List<SseEmitter>>` con clave `"empresaId-sucursalId"`
- Al crear notificación → `sseService.push()` escribe `{"nuevaAlerta":true}` a todos los emitters del tenant
- Timeout de emitter: 25 minutos (fuerza reconexión antes del proxy timeout)
- El `JwtAuthenticationFilter` acepta token también via query param `?token=` (necesario para `EventSource`)

### SSE vs fallback poll — dos mecanismos distintos en `HomeView.tsx`

**SSE (principal, tiempo real):**
```typescript
const eventSource = new EventSource(`/api/v1/notificaciones/stream?token=...`);
eventSource.addEventListener("nueva-alerta", () => {
    getContadorNoVistas(); // badge se actualiza al instante
});
```

**Fallback poll (seguridad, cada 5 min):**
```typescript
setInterval(() => {
    getContadorNoVistas(); // por si el EventSource se cayó
}, 5 * 60 * 1000);
```

El poll existe porque SSE es una conexión HTTP larga que puede cortarse (proxy timeout, red inestable). Si el `EventSource` se desconecta silenciosamente, el poll garantiza que el badge se sincroniza como máximo cada 5 minutos. En condiciones normales el usuario solo usa SSE y el poll no aporta nada nuevo.

### Insertar desde trigger/stored procedure

Si una notificación nace desde un trigger de DB o stored procedure (sin pasar por Java), `sseService.push()` **nunca se llama**. El `EventSource` del frontend no recibe el evento y el badge solo se actualiza en el siguiente poll de 5 minutos. Para notificaciones no urgentes esto es aceptable.

Opciones si se necesita tiempo real desde DB:
1. Mover la lógica al service Java para usar el flujo de eventos existente (recomendado).
2. Usar `PERFORM pg_notify(...)` en el SP + un listener Java sobre JDBC dedicado que llame a `sseService.push()`.

### Escalabilidad

| Usuarios concurrentes | Diseño actual |
|---|---|
| < 1,000 | Sin problema. Monitorear heap JVM (512 MB–1 GB es suficiente). |
| 1,000 – 5,000 | Monitorear memoria y sockets abiertos. |
| > 5,000 o múltiples pods | Requiere Redis Pub/Sub: cada instancia suscribe su canal y reenvía a sus emitters locales. El diseño actual no funciona correctamente en escala horizontal porque los emitters viven en memoria de una sola JVM. |

---

## Frontend

```
apis/
  SgNotificacionController.tsx   ← getNotificaciones, getContadorNoVistas, marcarVisto, cerrarNotificacion,
                                    getNotificacionesLogin, getTodosTipos, getTiposConSuscripcion, saveSuscripciones
components/notificaciones/
  NotificacionesView.tsx         ← tabla con filtros por módulo, "marcar todas vistas", visto/cerrar por fila
  NotificacionLoginModal.tsx     ← wizard bloqueante al login (disableEscapeKeyDown, dots de navegación, barra de progreso)
components/seguridad/
  NotificacionTipoConfigView.tsx ← admin de tipos en /seguridad/config-avisos (toggles paraLogin, activo)
```

### `HomeView.tsx` — badge en top bar
- Abre `EventSource` al autenticarse → escucha evento `"nueva-alerta"` → llama `getContadorNoVistas()`
- Clic en campana → `Popover` con las 5 notificaciones más recientes + botón "Ver todas"
- Fallback poll cada **5 minutos** por si la conexión SSE se pierde
- Ruta `/alertas` → `NotificacionesView`
- `useEffect([user?.isAuthenticated])` → llama `getNotificacionesLogin()` → si `length > 0` abre `NotificacionLoginModal`
- **Cuidado:** el `.catch(() => {})` traga errores 401 silenciosamente si el token JWT no está listo al disparar el efecto

### `NotificacionLoginModal.tsx` — wizard al login
- Modal bloqueante (`disableEscapeKeyDown`): el usuario debe confirmar cada aviso antes de continuar
- Wizard paginado con dots de navegación, barra de progreso LinearProgress, chip `X / total`
- Botón "Entendido" llama `POST /{id}/visto` → avanza automáticamente al siguiente
- "Todos leídos — Continuar" se habilita solo cuando `confirmados.size === total`
- Estado interno: `Set<number>` con IDs confirmados. Usar `Array.from(prev).concat(id)` al actualizar (no `[...prev]` — falla con `--downlevelIteration` desactivado)

---

## Segregación por permisos de menú

Las alertas se filtran automáticamente según los menús a los que tiene acceso el usuario autenticado. El mecanismo aprovecha el sistema de permisos existente (`sg_permiso` → `sg_menu`).

### Cómo funciona

- `SgNotificacion.menuUrlOrigen` contiene la URL del menú (`sg_menu.url`) al que pertenece la alerta.
- `NULL` = alerta global, la ve cualquier usuario del tenant.
- Al leer (listado, contador, badge), el service llama `SgPermisoRepository.findMenuUrlsPermitidas()` para obtener las URLs donde el usuario tiene `puedeLeer = true`, y filtra con:
  ```sql
  AND (menu_url_origen IS NULL OR menu_url_origen IN :urlsPermitidas)
  ```
- El SSE sigue empujando a todos en la sucursal (solo es un ping). El badge se actualiza llamando al contador, que ya aplica el filtro.

### Mapa de alertas y menús

| Tipo | `menuUrlOrigen` | Quién la ve |
|---|---|---|
| `VENCIMIENTO` | `/lotes` | Usuarios con acceso al menú Lotes |
| `STOCK_BAJO` | `/almacenes` | Usuarios con acceso al menú Almacenes. Payload: `{ productoId, productoNombre, almacenId, almacenNombre, cantidadActual, limite }` |
| `REQUISICION_PENDIENTE` | `/transferencias` | Usuarios con acceso al menú Transferencias |
| *(global)* | `null` | Todos los usuarios del tenant |

### Regla para nuevos productores

Siempre establecer `menuUrlOrigen` usando la constante `MENU_URL` al inicio de la clase productora:
```java
private static final String MENU_URL = "/url-del-menu"; // debe existir en sg_menu
```
Si la alerta es realmente para todos, no llamar `setMenuUrlOrigen()` (queda `null`).

---

## Modal login — cómo insertar una notificación general (todos la ven)

El `modulo` de la notificación es solo una etiqueta visual. El acceso al modal se controla únicamente por `acceso_restringido` en el tipo.

```sql
-- 1. Tipo catálogo (una sola vez por tipo nuevo)
INSERT INTO seguridad.sg_notificacion_tipo_config
    (tipo_id, nombre, descripcion, modulo, para_login, acceso_restringido, activo, fecha_reg, usuario_reg)
VALUES ('RECORDATORIO', 'Recordatorio general', 'Avisos para todos los usuarios',
        'GENERAL', TRUE, FALSE, TRUE, NOW(), 'Master')
ON CONFLICT (tipo_id) DO NOTHING;

-- 2. La notificación (una por aviso que quieras enviar)
INSERT INTO general.sg_notificacion
    (empresa_id, sucursal_id, modulo, tipo, titulo, descripcion,
     referencia_key, menu_url_origen, para_login, estado_id, fecha_reg, usuario_reg)
VALUES (2, NULL, 'GENERAL', 'RECORDATORIO',
        'Título del aviso', 'Texto completo.',
        'recordatorio:1',  -- clave única, cambiar sufijo por cada aviso
        NULL, TRUE, 'ACT', NOW(), 'Master');
```

## Modal login — diagnóstico cuando no aparece

Simula exactamente `findLoginPendientes()` del backend:

```sql
SELECT n.id, n.tipo, n.titulo, n.empresa_id
FROM general.sg_notificacion n
WHERE n.empresa_id = :empresaId
  AND n.estado_id = 'ACT'
  AND n.para_login = TRUE
  AND n.tipo IN (
      SELECT t.tipo_id FROM seguridad.sg_notificacion_tipo_config t
      WHERE t.activo = TRUE AND t.acceso_restringido = FALSE AND t.para_login = TRUE
  )
  AND NOT EXISTS (
      SELECT 1 FROM general.sg_notificacion_visto v
      WHERE v.notificacion_id = n.id AND v.username = :username
  );
```

| Causa | Fix |
|---|---|
| Tipo no existe en `sg_notificacion_tipo_config` | Ejecutar el INSERT del paso 1 |
| Tipo con `activo=false`, `para_login=false` o `acceso_restringido=true` | `UPDATE seguridad.sg_notificacion_tipo_config SET activo=TRUE, para_login=TRUE, acceso_restringido=FALSE WHERE tipo_id='RECORDATORIO'` |
| Notificación con `para_login=FALSE` | `UPDATE general.sg_notificacion SET para_login=TRUE WHERE tipo='RECORDATORIO'` |
| `empresa_id` no coincide con el del usuario | Verificar con el query de diagnóstico |
| Usuario ya la vio antes | `DELETE FROM general.sg_notificacion_visto WHERE username = :username AND notificacion_id = :id` |

---

## Notas importantes

- **El insert directo a DB no dispara el SSE** — el push lo hace el código Java, no la DB. El fallback de 5 min cubre este caso.
- **Deduplicación**: antes de crear una notificación, verificar `existsByModuloAndTipoAndReferenciaKeyAndEmpresaIdAndEstadoId`. La native query del scheduler incluye `NOT EXISTS` para mayor eficiencia.
- **`visto` es por usuario, independiente**: un usuario puede marcar como vista sin afectar a los demás. Cerrar (`CER`) sí la quita para todos.
- **`menu_url_origen` solo filtra badge/campana**, no el modal login. Para el modal, el filtro es `acceso_restringido` en el tipo.
- **`repetir_login=TRUE` + `fecha_expiracion`**: la notificación reaparece en cada login; el "Entendido" no la oculta. Se detiene sola al pasar la fecha.
- **Destinatarios vs acceso_restringido**: son mutuamente excluyentes en la práctica. Si hay destinatarios, el tipo es irrelevante para el acceso al login.
- **Particionamiento futuro**: cuando la tabla crezca, particionar por `fecha_reg` mensual en PostgreSQL. La tabla `sg_notificacion_visto` se puede limpiar en cascada.

---

## API para management

> Esta sección está pensada para una **app de management externa** que se conecte a eFacturador para crear y gestionar recordatorios/avisos al login para los usuarios de cada empresa.

### Autenticación

Todas las llamadas deben incluir el JWT del usuario administrador:
```
Authorization: Bearer <token>
```
El token determina el `empresa_id` automáticamente (via `TenantContext`). La app de management debe autenticarse como un usuario admin de la empresa objetivo.

### Base URL
```
POST   /api/v1/auth/login   →  { token, empresaId, sucursalId, username }
```
Luego usar ese token en todas las llamadas a `/api/v1/notificaciones`.

---

### Modelo de datos — Notificación

```json
{
  "id": 42,
  "empresaId": 2,
  "sucursalId": null,
  "modulo": "GENERAL",
  "tipo": "RECORDATORIO",
  "titulo": "Actualización de política de contraseñas",
  "descripcion": "A partir del 1 de julio todas las contraseñas deben tener mínimo 12 caracteres.",
  "paraLogin": true,
  "repetirLogin": true,
  "fechaExpiracion": "2026-07-01T00:00:00",
  "estadoId": "ACT",
  "fechaReg": "2026-06-09T10:00:00",
  "usuarioReg": "admin",
  "destinatarios": ["juan.perez", "maria.garcia"],
  "visto": false
}
```

| Campo | Requerido al crear | Descripción |
|---|---|---|
| `modulo` | Sí | Etiqueta de categoría. Usar `"GENERAL"` para recordatorios |
| `tipo` | Sí | Debe existir en `sg_notificacion_tipo_config`. Usar `"RECORDATORIO"` para avisos generales |
| `titulo` | Sí | Texto del encabezado en el wizard |
| `descripcion` | No | Cuerpo del aviso |
| `repetirLogin` | No (default `false`) | `true` = reaparece en cada login hasta `fechaExpiracion` |
| `fechaExpiracion` | No | ISO 8601. Si `repetirLogin=true` y esto es `null`, aparece indefinidamente |
| `destinatarios` | No | Array de usernames. Si vacío/null → todos los del tipo reciben el aviso |

---

### Endpoints disponibles para management

#### Crear notificación
```
POST /api/v1/notificaciones
Content-Type: application/json

{
  "modulo": "GENERAL",
  "tipo": "RECORDATORIO",
  "titulo": "Título del aviso",
  "descripcion": "Texto completo aquí.",
  "repetirLogin": true,
  "fechaExpiracion": "2026-07-31T23:59:59",
  "destinatarios": ["usuario1", "usuario2"]   // omitir para enviar a todos
}

→ 201 Created — body: notificación creada con id
```

#### Cerrar/archivar una notificación
```
PUT /api/v1/notificaciones/{id}/cerrar
→ 204 No Content
```

#### Ver destinatarios de una notificación
```
GET /api/v1/notificaciones/{id}/destinatarios
→ 200 ["usuario1", "usuario2"]
```

#### Agregar destinatario
```
POST /api/v1/notificaciones/{id}/destinatarios
{ "username": "nuevo.usuario" }
→ 204 No Content
```

#### Eliminar destinatario
```
DELETE /api/v1/notificaciones/{id}/destinatarios/{username}
→ 204 No Content
```

#### Listar todas las activas del tenant
```
GET /api/v1/notificaciones
→ 200 [ { ...notificacion }, ... ]
```

---

### Casos de uso — ejemplos de payload

**Recordatorio general a todos, expira el 30 de junio:**
```json
{
  "modulo": "GENERAL", "tipo": "RECORDATORIO",
  "titulo": "Cierre de mes",
  "descripcion": "Recuerde completar sus reportes antes del 30 de junio.",
  "repetirLogin": true,
  "fechaExpiracion": "2026-06-30T23:59:59"
}
```

**Aviso puntual — el usuario lo confirma una sola vez:**
```json
{
  "modulo": "GENERAL", "tipo": "RECORDATORIO",
  "titulo": "Nueva política de uso",
  "descripcion": "Lea y acepte la política antes de continuar.",
  "repetirLogin": false
}
```

**Aviso personalizado solo para dos usuarios, sin expiración:**
```json
{
  "modulo": "GENERAL", "tipo": "RECORDATORIO",
  "titulo": "Capacitación obligatoria",
  "descripcion": "Debe completar el módulo de capacitación esta semana.",
  "repetirLogin": true,
  "destinatarios": ["juan.perez", "carlos.diaz"]
}
```

---

### Prerequisito — tipo `RECORDATORIO` en catálogo

Antes de crear notificaciones de tipo `RECORDATORIO`, verificar que el tipo exista:

```sql
INSERT INTO seguridad.sg_notificacion_tipo_config
    (tipo_id, nombre, descripcion, modulo, para_login, acceso_restringido, activo, fecha_reg, usuario_reg)
VALUES ('RECORDATORIO', 'Recordatorio general', 'Avisos manuales desde management',
        'GENERAL', TRUE, FALSE, TRUE, NOW(), 'system')
ON CONFLICT (tipo_id) DO NOTHING;
```

---

### Lógica de visibilidad en el login — resumen para la app de management

```
Al hacer login el usuario:
  1. ¿La notificación tiene destinatarios?
     SÍ → ¿está el username en la lista? → mostrar / no mostrar
     NO → ¿el tipo tiene acceso_restringido=FALSE? → mostrar a todos
           → acceso_restringido=TRUE → ¿el usuario se suscribió? → mostrar / no mostrar

  2. ¿repetirLogin=TRUE?
     SÍ → mostrar siempre (ignorar si ya hizo "Entendido" antes)
     NO → ¿ya hizo "Entendido"? → no mostrar

  3. ¿fechaExpiracion pasó?
     SÍ → no mostrar (aunque se cumplan los pasos anteriores)
```
