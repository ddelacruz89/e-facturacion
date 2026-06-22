# Accesos de Soporte — Contexto de integración

> Documento de referencia para el **sistema de management** que gestiona los grants de acceso de soporte hacia eFacturador.

---

## Resumen del modelo

El equipo de soporte puede acceder al sistema de un cliente en **modo solo lectura** sin ser usuario del tenant. El flujo tiene tres actores:

| Actor | Responsabilidad |
|---|---|
| **eFacturador** | Lee los grants, emite el JWT soporte, enforce solo-lectura |
| **Sistema de management** | Crea/revoca usuarios soporte y sus grants |
| **Usuario soporte** | Inicia sesión en eFacturador con su cuenta propia |

---

## Esquema de base de datos

La base de datos es **compartida** entre eFacturador y el sistema de management (PostgreSQL, schema `seguridad`).

### Tabla `seguridad.sg_usuario`

Campo nuevo relevante:

```sql
es_soporte  BOOLEAN NOT NULL DEFAULT FALSE
```

- Los usuarios con `es_soporte = TRUE` son cuentas del equipo de soporte.
- Deben vivir en `empresa_id = 1` (el tenant SaaS admin de eFacturador).
- Tienen `username` y `login_email` únicos globalmente como cualquier usuario.
- El sistema de management es el encargado de crearlos con `es_soporte = TRUE`.

**Campos obligatorios al insertar un usuario soporte:**

| Campo | Tipo | Notas |
|---|---|---|
| `username` | VARCHAR(20) | Único, sin espacios |
| `login_email` | VARCHAR(100) | Único, email válido |
| `password` | VARCHAR | BCrypt del password |
| `nombre` | VARCHAR(200) | Nombre completo |
| `empresa_id` | INTEGER | Debe ser `1` |
| `sucursal_id` | INTEGER | ID de la sucursal principal de empresa 1 |
| `es_soporte` | BOOLEAN | Debe ser `TRUE` |
| `estado_id` | VARCHAR | `'ACT'` para activo |
| `fecha_reg` | TIMESTAMP | `NOW()` |
| `usuario_reg` | VARCHAR | Username del operador en management |

**Ejemplo de INSERT:**
```sql
INSERT INTO seguridad.sg_usuario
  (username, login_email, password, nombre, empresa_id, sucursal_id,
   es_soporte, estado_id, fecha_reg, usuario_reg)
VALUES
  ('soporte01', 'soporte01@braintech.do',
   '$2a$10$...bcrypt...', 'Aner Santana', 1, 1,
   TRUE, 'ACT', NOW(), 'management-system');
```

### Tabla `seguridad.sg_acceso_soporte`

```sql
CREATE TABLE seguridad.sg_acceso_soporte (
  id                SERIAL       PRIMARY KEY,
  empresa_id        INTEGER      NOT NULL,   -- tenant destino
  username_soporte  VARCHAR(20)  NOT NULL    -- FK a sg_usuario
                    REFERENCES seguridad.sg_usuario(username),
  otorgado_por      VARCHAR(100) NOT NULL,   -- identificador en management
  fecha_expiracion  TIMESTAMP    NOT NULL,
  activo            BOOLEAN      NOT NULL DEFAULT TRUE,
  observaciones     VARCHAR(500),
  fecha_reg         TIMESTAMP    NOT NULL DEFAULT NOW(),
  usuario_reg       VARCHAR(100) NOT NULL
);

-- Constraint: un solo grant activo por par (soporte + empresa)
CREATE UNIQUE INDEX uq_acceso_soporte_activo
  ON seguridad.sg_acceso_soporte (empresa_id, username_soporte)
  WHERE activo = TRUE;
```

---

## Operaciones del sistema de management

### 1. Crear usuario soporte

**Dónde:** INSERT directo en `seguridad.sg_usuario` con `es_soporte = TRUE`.

El password debe ser hasheado con BCrypt (cost 10), igual que los demás usuarios de eFacturador.

### 2. Otorgar acceso de soporte a un tenant

```sql
INSERT INTO seguridad.sg_acceso_soporte
  (empresa_id, username_soporte, otorgado_por, fecha_expiracion,
   activo, observaciones, fecha_reg, usuario_reg)
VALUES
  (:empresaId, :usernameSoporte, :otorgadoPor, :fechaExpiracion,
   TRUE, :observaciones, NOW(), :usuarioReg);
```

- Si ya existe un grant activo para ese par `(empresa_id, username_soporte)`, el índice UNIQUE lanzará un error. Primero revocar el anterior.
- `fecha_expiracion` recomendada: máximo 30 días desde `NOW()`.
- `otorgado_por`: identificador del operador en el management system (puede ser email, username o ID).

### 3. Revocar acceso (soft delete)

```sql
UPDATE seguridad.sg_acceso_soporte
SET activo = FALSE
WHERE empresa_id = :empresaId
  AND username_soporte = :usernameSoporte
  AND activo = TRUE;
```

Tras la revocación, si el usuario soporte tiene un JWT activo en esa empresa, el token sigue siendo válido hasta que expire (24h). **No hay invalidación inmediata de JWT** — si se necesita expulsión inmediata, reducir la `fecha_expiracion` a `NOW() - 1 second`:

```sql
UPDATE seguridad.sg_acceso_soporte
SET activo = FALSE,
    fecha_expiracion = NOW() - INTERVAL '1 second'
WHERE empresa_id = :empresaId
  AND username_soporte = :usernameSoporte;
```

> Nota: en eFacturador, `select-empresa-soporte` verifica `fecha_expiracion > NOW()` en cada selección, pero el JWT emitido no se revalida en cada request. El siguiente login ya denegará el acceso.

### 4. Listar accesos activos de un usuario soporte

```sql
SELECT a.*, e.empresa AS empresa_nombre
FROM seguridad.sg_acceso_soporte a
JOIN seguridad.sg_empresa e ON e.id = a.empresa_id
WHERE a.username_soporte = :username
  AND a.activo = TRUE
  AND a.fecha_expiracion > NOW()
ORDER BY a.fecha_expiracion ASC;
```

### 5. Listar todos los accesos activos por empresa (para auditoría)

```sql
SELECT a.*, u.nombre AS nombre_soporte
FROM seguridad.sg_acceso_soporte a
JOIN seguridad.sg_usuario u ON u.username = a.username_soporte
WHERE a.empresa_id = :empresaId
  AND a.activo = TRUE
ORDER BY a.fecha_reg DESC;
```

---

## Flujo de login del usuario soporte en eFacturador

```
POST /api/auth/login  { username, password }
        │
        ├─ sg_usuario.es_soporte = TRUE
        │
        ├─ Query sg_acceso_soporte WHERE username_soporte = X AND activo = TRUE AND fecha_expiracion > NOW()
        │
        ├─ 0 grants → 403
        │
        ├─ 1 grant → JWT soporte emitido directamente (auto-selección)
        │             response: { token, empresaId, sucursalId, esSoporte: true }
        │
        └─ N grants → response: {
                        requiresEmpresaSoporteSelection: true,
                        preAuthToken: "...",        ← válido 5 min
                        empresasSoporteDisponibles: [
                          { empresaId, empresaNombre, fechaExpiracion },
                          ...
                        ]
                      }

                      Frontend llama:
                      POST /api/auth/select-empresa-soporte
                        { preAuthToken, empresaIdDestino }
                      → Valida grant activo → JWT soporte emitido
```

---

## JWT soporte

Claims del JWT emitido para sesión soporte:

```json
{
  "sub": "soporte01",
  "empresaId": 7,
  "sucursalId": 12,
  "empresaNombre": "Empresa del Cliente S.R.L.",
  "sucursalNombre": "Sucursal Principal",
  "esSoporte": true,
  "iat": 1718302800,
  "exp": 1718389200
}
```

- `empresaId` y `sucursalId` son del **tenant destino**, no del SaaS admin (empresa_id=1).
- `esSoporte: true` es el claim que activa el modo solo-lectura en eFacturador.
- Duración: 24 horas (igual que el JWT normal).

---

## Comportamiento en eFacturador con sesión soporte

| Acción | Resultado |
|---|---|
| Consultar cualquier listado (GET, POST /buscar) | ✅ Permitido |
| Ver detalle de cualquier registro | ✅ Permitido |
| Crear / editar / eliminar / imprimir | ❌ HTTP 403 "solo lectura" |
| Ver módulos del menú | ✅ Todos los módulos licenciados del tenant |
| Aparecer en selectores de usuario | ❌ Nunca (vive en empresa_id=1) |
| Cambiar contraseña del tenant | ❌ No tiene acceso (no es usuario del tenant) |

---

## Consideraciones de seguridad

1. **El JWT soporte no tiene poder de escritura** — el enforce está en el backend (`PermisoAspect`), no en el frontend.
2. **Los grants tienen expiración obligatoria** — el índice UNIQUE previene grants dobles activos.
3. **Auditoría**: `sg_acceso_soporte.otorgado_por` y `fecha_reg` trazan quién otorgó y cuándo.
4. **El usuario soporte no puede ver** datos de tenants para los que no tiene grant activo, aunque tenga el JWT del pre-auth.
5. **Revocación no invalida JWT activos** — ver sección 3 para mitigación.
6. **El password del usuario soporte** se almacena en BCrypt en `sg_usuario` (el mismo sistema de auth de eFacturador).

---

## Checklist de integración para el management system

- [ ] Crear usuario soporte con `es_soporte=TRUE` y `empresa_id=1`
- [ ] Hashear password con BCrypt antes de insertar
- [ ] UI para otorgar grant con fecha de expiración configurable
- [ ] UI para listar grants activos por usuario soporte / por empresa
- [ ] UI para revocar grant (UPDATE activo=FALSE)
- [ ] Mostrar alerta cuando un grant está próximo a expirar (ej. < 24h)
- [ ] Log de auditoría en el management system con cada grant otorgado/revocado
