---
name: project-notificacion-suscripcion
description: Sistema de suscripciones a avisos con modal al login — catálogo de tipos, checkboxes en usuarios, modal bloqueante al iniciar sesión
metadata:
  type: project
---

## Feature: Avisos al login por suscripción de usuario

Agregado en sesión 2026-06-07.

### Modelo de datos (BD)
- `ALTER TABLE general.sg_notificacion ADD COLUMN para_login BOOLEAN DEFAULT FALSE` — marca si aparece al login
- `seguridad.sg_notificacion_tipo_config` — catálogo global de tipos de aviso (tipoId PK, nombre, modulo, para_login, activo)
- `seguridad.sg_usuario_notif_suscripcion` — suscripciones por usuario (empresa_id, username, tipo_id, UNIQUE)
- Migración: `db-migrations/add_notificacion_suscripcion.sql`
- Menú: `db-migrations/insert_menu_config_avisos.sql` → `/seguridad/config-avisos` módulo SEG

### Tipos sembrados (seed)
`COBRO_VENCIDO`, `STOCK_BAJO`, `VENCIMIENTO`, `REQUISICION_PENDIENTE`, `APROBACION_PENDIENTE`

### Backend
- `SgNotificacionTipoConfig.java` + `SgUsuarioNotifSuscripcion.java` — nuevas entidades
- `SgNotificacionTipoConfigRepository` + `SgUsuarioNotifSuscripcionRepository` — nuevos repos
- `SgNotificacion` — nuevo campo `paraLogin`
- `SgNotificacionRepository.findLoginPendientes(empresaId, username, tiposSuscritos)` — query para modal login
- Nuevos endpoints en `SgNotificacionController`:
  - `GET /api/v1/notificaciones/login` — notifs pendientes al login (para el usuario autenticado)
  - `GET /api/v1/notificaciones/tipos` — catálogo sin suscripción
  - `GET /api/v1/notificaciones/tipos/{username}` — catálogo con flag suscrito
  - `PUT /api/v1/notificaciones/tipos/{username}/suscripciones` — guarda suscripciones (reemplaza)
  - `PATCH /api/v1/notificaciones/tipos/{tipoId}` — actualiza paraLogin/activo (admin)

### Frontend
- `NotificacionLoginModal.tsx` — modal bloqueante (`disableEscapeKeyDown`) que muestra avisos pendientes al login. Al hacer click "Entendido" marca todos como vistos vía `POST /{id}/visto`
- `HomeView.tsx` — `useEffect` al autenticarse: llama `getNotificacionesLogin()`, si hay avisos abre modal
- `UsuarioView.tsx` — panel de checkboxes "Avisos al iniciar sesión" con los tipos del catálogo. Se guarda con el usuario
- `NotificacionTipoConfigView.tsx` — vista admin en `/seguridad/config-avisos` con toggles de paraLogin y activo por tipo
- Nuevas funciones en `SgNotificacionController.tsx`: `getNotificacionesLogin`, `getTodosTipos`, `getTiposConSuscripcion`, `saveSuscripciones`

### Flujo completo
1. Admin configura tipos en `/seguridad/config-avisos` (paraLogin=true por defecto)
2. Admin marca suscripciones en `UsuarioView` (checkboxes)
3. Productor Java crea `SgNotificacion` con `paraLogin=true` y `tipo` = uno de los tipos del catálogo
4. Al login: `GET /notificaciones/login` devuelve avisos activos, no vistos, del tipo suscrito
5. Modal se abre → usuario hace click "Entendido" → marca todos como vistos → modal no vuelve a aparecer

### Para agregar un productor con para_login=true
```java
notif.setParaLogin(true);
notif.setTipo("COBRO_VENCIDO"); // debe existir en sg_notificacion_tipo_config con activo=true
```

**Why:** El usuario quería que solo ciertos usuarios recibieran alertas específicas (ej. pagos vencidos) como aviso bloqueante al iniciar sesión, no como simple campana.
**How to apply:** Para nuevos tipos de aviso al login: 1) seed en SQL, 2) productor Java con paraLogin=true, 3) el usuario configura sus suscripciones.
