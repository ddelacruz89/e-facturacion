# Módulo de Login — Flujo de autenticación

## Endpoint principal

`POST /api/auth/login` — **público** (sin JWT).

**Archivos clave:**
- `seguridad/AuthController.java` → método `login()`
- `seguridad/model/LoginRequest.java`
- `seguridad/model/LoginResponse.java`
- `e-facturador-web/src/services/authService.ts` → `AuthService.login()`
- `e-facturador-web/src/contexts/AuthContext.tsx` → `login()`

---

## Flujo de decisión en el backend

```
POST /api/auth/login
  ├─ Usuario no existe o contraseña incorrecta → 401  body: null
  ├─ Usuario es_soporte = true                → loginSoporte()
  │      ├─ Sin grants activos               → 403  body: null
  │      ├─ 1 grant activo                   → 200  { token, empresaId, sucursalId, esSoporte:true }
  │      └─ N grants activos                 → 200  { preAuthToken, requiresEmpresaSoporteSelection:true, empresasSoporteDisponibles:[...] }
  ├─ Sin sucursales activas asignadas         → 403  body: { message: "Usuario sin sucursales activas asignadas" }
  ├─ 1 sucursal disponible                   → 200  { token, empresaId, sucursalId, empresaNombre, sucursalNombre }
  └─ N sucursales disponibles                → 200  { preAuthToken, requiresSucursalSelection:true, sucursalesDisponibles:[...] }
```

---

## Respuestas y mensajes de error

| Situación | HTTP | Body |
|---|---|---|
| Credenciales inválidas | `401` | `null` |
| Usuario válido sin sucursales activas | `403` | `{ "message": "Usuario sin sucursales activas asignadas" }` |
| Usuario soporte sin grants activos | `403` | `null` |
| Token preAuth inválido o expirado | `401` | sin body |
| Sucursal no permitida en `select-sucursal` | `403` | sin body |
| Grant soporte inválido en `select-empresa-soporte` | `403` | sin body |

**Cómo el frontend lee los errores** (`authService.ts` línea 44-46):
```typescript
const message = error.response.data?.message || 'Credenciales inválidas';
throw new Error(message);
```
El fallback `'Credenciales inválidas'` aparece cuando el body es `null` o no tiene campo `message`.

---

## Modelo `LoginResponse`

```java
String token;
String username;
Integer empresaId;
Integer sucursalId;
String sucursalNombre;
String empresaNombre;
String message;                          // mensaje de error (solo en respuestas de error)
Boolean requiresSucursalSelection;
String preAuthToken;
List<SucursalOpcionDTO> sucursalesDisponibles;
Boolean esSoporte;
Boolean requiresEmpresaSoporteSelection;
List<EmpresaSoporteOpcionDTO> empresasSoporteDisponibles;
```

Constructores:
- `LoginResponse()` — vacío, para construcción manual.
- `LoginResponse(String message)` — para respuestas de error con cuerpo explicativo.

---

## Flujo multi-sucursal

1. Backend detecta N > 1 sucursales → emite `preAuthToken` (JWT de corta vida con claim `preAuth:true`).
2. Frontend muestra selector de sucursal.
3. Usuario elige → `POST /api/auth/select-sucursal { preAuthToken, sucursalId }`.
4. Backend valida preAuthToken, verifica que la sucursal pertenezca al usuario → emite JWT final.

## Flujo soporte multi-empresa

Idéntico al multi-sucursal pero con `requiresEmpresaSoporteSelection` y `POST /api/auth/select-empresa-soporte { preAuthToken, empresaIdDestino }`.

---

## Consulta de sucursales disponibles

```java
// SgUsuarioRolRepository
List<SgSucursal> findSucursalesActivasByUsername(String username)
```

Devuelve sucursales donde el usuario tiene al menos un rol activo. Si la lista es vacía → el usuario no tiene acceso configurado.

---

## Token JWT

Generado por `JwtUtil`:
- Claims: `empresaId`, `sucursalId`, `empresaNombre`, `sucursalNombre` (y `esSoporte:true` para usuarios soporte).
- Validado en cada request por el filtro de Spring Security.
- Leído en el service vía `TenantContext`.

### `GET /api/auth/validate`

Valida el JWT actual y devuelve los datos del usuario. Usado por el frontend al recargar la página para restaurar la sesión sin re-login.

---

## Otros endpoints de auth

| Endpoint | Público | Descripción |
|---|---|---|
| `POST /api/auth/login` | Sí | Login principal |
| `POST /api/auth/select-sucursal` | Sí (preAuthToken) | Segundo paso multi-sucursal |
| `POST /api/auth/select-empresa-soporte` | Sí (preAuthToken) | Segundo paso soporte multi-empresa |
| `GET /api/auth/validate` | No (JWT) | Validar token y restaurar sesión |
| `POST /api/auth/cambiar-password` | No (JWT) | Cambiar contraseña autenticado |
| `POST /api/auth/recuperar-password/solicitar` | Sí | Solicitar código de recuperación |
| `POST /api/auth/recuperar-password/verificar` | Sí | Verificar código y resetear contraseña |

Ver detalles de recuperación de contraseña en `contexto/usuario.md`.
