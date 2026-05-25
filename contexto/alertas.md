# Módulo de Notificaciones — Resumen técnico

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
| `menu_url_origen` | VARCHAR(200) | NULL = global (todos la ven). Con valor = solo usuarios con `puedeLeer=true` en ese menú (`sg_menu.url`) |
| `estado_id` | VARCHAR(10) | `ACT` \| `CER` |
| `fecha_reg` | TIMESTAMPTZ | |
| `usuario_reg` | VARCHAR(45) | |
| `fecha_cierre` | TIMESTAMPTZ | |
| `usuario_cierre` | VARCHAR(45) | |

**Índices:**
- `idx_notif_tenant_estado` → `(empresa_id, sucursal_id, estado_id, fecha_reg)`
- `idx_notif_dedup` → `(modulo, tipo, referencia_key, empresa_id, estado_id)`

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
  SgNotificacion.java          ← entidad principal
  SgNotificacionVisto.java     ← junction por usuario
dao/notificacion/
  SgNotificacionRepository.java      ← findActivasByTenant, contarNoVistas, dedup
  SgNotificacionVistoRepository.java ← existsByNotificacionIdAndUsername
dto/notificacion/
  SgNotificacionDTO.java       ← flat DTO + campo "visto: boolean"
interfaces/notificacion/
  SgNotificacionService.java   ← findActivas, findActivasByModulo, contarNoVistas, marcarVisto, cerrar
services/notificacion/
  SgNotificacionServiceImpl.java
controllers/notificacion/
  SgNotificacionController.java   ← /api/v1/notificaciones
sse/
  InAlertaSseService.java      ← gestiona emitters SSE por tenant (empresaId-sucursalId)
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

---

## Productores de notificaciones

### `InLoteVencimientoScheduler` — cron `0 0 6 * * *` (6am diario)
- Native query sobre `inventario.in_lote` buscando lotes por vencer
- Deduplication via `NOT EXISTS` en `sg_notificacion`
- `referenciaKey = "lote:productoId"`
- `menuUrlOrigen = "/lotes"` — solo la ven usuarios con acceso al menú Lotes
- Llama `sseService.push(empresaId, sucursalId)` por cada notificación creada

### `InAlertaInventarioListener` — `@Async("alertasExecutor")` + `@EventListener(InStockBajoEvent)`
- Crea notificación `STOCK_BAJO` si `cantidadActual < limite`
- Actualiza el payload si ya existe una activa
- Cierra la notificación si el stock se recupera
- `referenciaKey = "productoId:almacenId"`
- `menuUrlOrigen = "/almacenes"` — solo la ven usuarios con acceso al menú Almacenes
- Llama `sseService.push(empresaId, sucursalId)` al crear

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
  SgNotificacionController.tsx   ← getNotificaciones, getContadorNoVistas, marcarVisto, cerrarNotificacion
components/notificaciones/
  NotificacionesView.tsx         ← tabla con filtros por módulo, "marcar todas vistas", visto/cerrar por fila
```

### `HomeView.tsx` — badge en top bar
- Abre `EventSource` al autenticarse → escucha evento `"nueva-alerta"` → llama `getContadorNoVistas()`
- Clic en campana → `Popover` con las 5 notificaciones más recientes + botón "Ver todas"
- Fallback poll cada **5 minutos** por si la conexión SSE se pierde
- Ruta `/alertas` → `NotificacionesView`

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
| `STOCK_BAJO` | `/almacenes` | Usuarios con acceso al menú Almacenes |
| `REQUISICION_PENDIENTE` | `/transferencias` | Usuarios con acceso al menú Transferencias |
| *(global)* | `null` | Todos los usuarios del tenant |

### Regla para nuevos productores

Siempre establecer `menuUrlOrigen` usando la constante `MENU_URL` al inicio de la clase productora:
```java
private static final String MENU_URL = "/url-del-menu"; // debe existir en sg_menu
```
Si la alerta es realmente para todos, no llamar `setMenuUrlOrigen()` (queda `null`).

---

## Notas importantes

- **El insert directo a DB no dispara el SSE** — el push lo hace el código Java, no la DB. El fallback de 5 min cubre este caso.
- **Deduplicación**: antes de crear una notificación, verificar `existsByModuloAndTipoAndReferenciaKeyAndEmpresaIdAndEstadoId`. La native query del scheduler incluye `NOT EXISTS` para mayor eficiencia.
- **`visto` es por usuario, independiente**: un usuario puede marcar como vista sin afectar a los demás. Cerrar (`CER`) sí la quita para todos.
- **Particionamiento futuro**: cuando la tabla crezca, particionar por `fecha_reg` mensual en PostgreSQL. La tabla `sg_notificacion_visto` se puede limpiar en cascada.
