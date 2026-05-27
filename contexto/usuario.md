# Módulo de Usuario — Gestión de Contraseña

## Cambiar contraseña (usuario autenticado)

### Backend

**Endpoint:** `POST /api/auth/cambiar-password` — requiere JWT válido.

**DTO:** `CambiarPasswordRequest`
```java
String passwordActual;
String passwordNueva;
```

**Flujo:**
1. Lee el `username` desde `TenantContext`.
2. Busca el usuario con `SgUsuarioRepository.findByUsername(username)`.
3. Verifica la contraseña actual con `BCryptPasswordEncoder.matches(...)`.
   - Si no coincide → `400 "La contraseña actual es incorrecta"`.
4. Codifica y guarda la nueva contraseña → `200 OK`.

**Archivos clave:**
- `seguridad/AuthController.java` → método `cambiarPassword`
- `seguridad/model/CambiarPasswordRequest.java`

---

### Frontend

**Acceso:** menú desplegable del ícono de usuario (esquina superior derecha de `HomeView`).

**Componente:** modal inline en `HomeView.tsx`.

**Estados relevantes:**
| Estado | Descripción |
|--------|-------------|
| `cambioPasswordOpen` | controla apertura del Dialog |
| `cpActual / cpNueva / cpConfirm` | valores de los campos |
| `cpError / cpExito` | feedback al usuario |
| `cpCargando` | deshabilita botón durante la llamada |
| `mostrarActual / mostrarNueva / mostrarConfirm` | toggle visibilidad de cada campo |

**Validaciones en cliente:**
- Todos los campos obligatorios.
- `cpNueva === cpConfirm`.
- Mínimo 6 caracteres en la nueva contraseña.

**Llamada API:** `AuthService.cambiarPassword(passwordActual, passwordNueva)` → `POST /api/auth/cambiar-password` con header `Authorization: Bearer <token>`.

---

## Recuperar contraseña (usuario no autenticado)

### Tabla de tokens

**Entidad:** `SgRecuperacionToken` — tabla `seguridad.sg_recuperacion_token`.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Long (autogenerado) | PK |
| `loginEmail` | String | Email del solicitante |
| `codigo` | String (6 chars) | Código numérico generado |
| `expiracion` | LocalDateTime | 15 minutos desde la solicitud |
| `usado` | Boolean | `true` tras verificar o al solicitar uno nuevo |
| `fechaReg` | LocalDateTime | Momento de creación |

**Repository:** `SgRecuperacionTokenRepository`
- `findTokenValido(email, codigo)` — busca token no usado y no expirado.
- `invalidarTokensDeEmail(email)` — marca todos los tokens del email como usados (se llama antes de generar uno nuevo y al verificar exitosamente).

---

### Backend

#### Paso 1 — Solicitar código

**Endpoint:** `POST /api/auth/recuperar-password/solicitar` — **público** (sin JWT).

**DTO:** `SolicitarRecuperacionRequest { String email }`

**Flujo:**
1. Busca el usuario por `loginEmail`. Si no existe → responde `200 OK` igualmente (no revelar si el email está registrado).
2. Invalida tokens previos de ese email.
3. Genera código de 6 dígitos con `SecureRandom`.
4. Guarda `SgRecuperacionToken` con `expiracion = now() + 15 min`.
5. Llama `EmailService.enviarCodigoRecuperacion(email, codigo)` de forma **async**.

#### Paso 2 — Verificar código y resetear contraseña

**Endpoint:** `POST /api/auth/recuperar-password/verificar` — **público** (sin JWT).

**DTO:** `VerificarRecuperacionRequest { String email, String codigo, String passwordNueva }`

**Flujo:**
1. Valida que `passwordNueva` tenga al menos 6 caracteres → `400` si no.
2. Busca token válido (no usado, no expirado). Si no existe → `400 "Código inválido o expirado"`.
3. Busca usuario por `loginEmail`.
4. Codifica y guarda la nueva contraseña.
5. Invalida todos los tokens del email.

**Seguridad en `SecurityConfig`:** ambos endpoints están en la lista `permitAll()`.

**Archivos clave:**
- `seguridad/AuthController.java` → `solicitarRecuperacion`, `verificarRecuperacion`
- `seguridad/model/SolicitarRecuperacionRequest.java`
- `seguridad/model/VerificarRecuperacionRequest.java`
- `jpa/seguridad/SgRecuperacionToken.java`
- `dao/seguridad/SgRecuperacionTokenRepository.java`

---

### Email — Brevo API REST

**Servicio:** `EmailService` (Spring `@Service`, método `@Async`).

**Llamada:** `POST https://api.brevo.com/v3/smtp/email`

**Header:** `api-key: <BREVO_API_KEY>`

**Propiedades de configuración:**
```properties
brevo.api.key=${BREVO_API_KEY}
brevo.from.email=${BREVO_FROM_EMAIL}
brevo.from.name=eFacturador
```
Obtener API Key en: **app.brevo.com → SMTP & API → API Keys**.
El `from.email` debe ser un dominio o dirección verificada en Brevo.

---

### Frontend — flujo de 3 pasos en LoginView

**Acceso:** botón "Recuperar contraseña" debajo del formulario de login.

El modal (MUI `Dialog`) tiene tres pasos controlados por `rpPaso` (0 = cerrado):

#### Paso 1 — Email (`rpPaso === 1`)
- Usuario ingresa su correo electrónico.
- `AuthService.solicitarRecuperacion(email)` → `POST /api/auth/recuperar-password/solicitar`.
- Avanza al paso 2 al recibir `200`.

#### Paso 2 — Código + nueva contraseña (`rpPaso === 2`)
- **Contador regresivo de 15 minutos** visible en el título del dialog.
  - Implementado con `useEffect` + `setInterval` que decrementa `rpSegundos` (inicia en `900`).
  - Color: gris normal → naranja al quedar ≤ 60 s → rojo con texto "Código expirado" al llegar a 0.
- Al expirar: campos deshabilitados, botón "Cambiar contraseña" bloqueado, texto del link cambia a "Solicitar nuevo código".
- Campo de código: solo dígitos, máximo 6, estilo espaciado visual.
- `AuthService.verificarRecuperacion(email, codigo, passwordNueva)` → `POST /api/auth/recuperar-password/verificar`.

#### Paso 3 — Éxito (`rpPaso === 3`)
- Ícono de check verde + mensaje de confirmación.
- Botón "Ir al inicio de sesión" cierra el modal.

**Estados relevantes:**
| Estado | Descripción |
|--------|-------------|
| `rpPaso` | paso activo (0–3) |
| `rpEmail / rpCodigo / rpNueva / rpConfirm` | valores de campos |
| `rpSegundos` | segundos restantes del contador |
| `rpExpirado` | `rpPaso === 2 && rpSegundos === 0` |
| `rpError / rpCargando` | feedback y control de UI |

**Llamadas API en `authService.ts`:**
```typescript
AuthService.solicitarRecuperacion(email: string): Promise<void>
AuthService.verificarRecuperacion(email: string, codigo: string, passwordNueva: string): Promise<void>
AuthService.cambiarPassword(passwordActual: string, passwordNueva: string): Promise<void>
```
