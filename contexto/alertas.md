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
- Llama `sseService.push(empresaId, sucursalId)` por cada notificación creada

### `InAlertaInventarioListener` — `@Async("alertasExecutor")` + `@EventListener(InStockBajoEvent)`
- Crea notificación `STOCK_BAJO` si `cantidadActual < limite`
- Actualiza el payload si ya existe una activa
- Cierra la notificación si el stock se recupera
- `referenciaKey = "productoId:almacenId"`
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

## Notas importantes

- **El insert directo a DB no dispara el SSE** — el push lo hace el código Java, no la DB. El fallback de 5 min cubre este caso.
- **Deduplicación**: antes de crear una notificación, verificar `existsByModuloAndTipoAndReferenciaKeyAndEmpresaIdAndEstadoId`. La native query del scheduler incluye `NOT EXISTS` para mayor eficiencia.
- **`visto` es por usuario, independiente**: un usuario puede marcar como vista sin afectar a los demás. Cerrar (`CER`) sí la quita para todos.
- **Particionamiento futuro**: cuando la tabla crezca, particionar por `fecha_reg` mensual en PostgreSQL. La tabla `sg_notificacion_visto` se puede limpiar en cascada.
