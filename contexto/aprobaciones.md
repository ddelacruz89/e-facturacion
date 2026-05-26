# Módulo de Aprobaciones — Referencia de implementación

## Resumen

Sistema genérico de aprobaciones multi-documento y multi-aprobador. Cualquier módulo
(requisiciones, órdenes de compra, transferencias, etc.) puede delegar su flujo de
aprobación a este módulo. El manager del solicitante puede ser aprobador automático,
y se pueden agregar aprobadores adicionales por tipo de documento.

---

## Modos de aprobación (`modoAprobacion`)

| Valor | Comportamiento |
|-------|---------------|
| `SECUENCIAL` | Los aprobadores responden en orden (nivel 1 → 2 → 3). El nivel N+1 solo se activa cuando el N aprueba. Cualquier rechazo → `REC`. |
| `SIN_ORDEN` | Todos deben aprobar, en cualquier orden. Cualquier rechazo → `REC`. Todos aprueban → `APR`. |
| `AL_MENOS_UNO` | El documento se aprueba en cuanto uno aprueba. Solo rechaza si todos rechazan. |

---

## Esquema de base de datos

Script completo: `db-migrations/create_sg_aprobaciones.sql`

```sql
-- ── 1. Campo manager en sg_usuario ───────────────────────────────────────────
ALTER TABLE seguridad.sg_usuario
    ADD COLUMN IF NOT EXISTS manager_username VARCHAR(20)
        REFERENCES seguridad.sg_usuario(username);

-- ── 2. Configuración de aprobación ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seguridad.sg_config_aprobacion (
    id              SERIAL          PRIMARY KEY,
    empresa_id      INTEGER         NOT NULL,
    secuencia       INTEGER,
    tipo_documento  VARCHAR(50)     NOT NULL,
    nombre          VARCHAR(200)    NOT NULL,
    modo_aprobacion VARCHAR(20)     NOT NULL DEFAULT 'SECUENCIAL',
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    usuario_reg     VARCHAR(20)     NOT NULL,
    fecha_reg       TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Un solo tipo de documento activo por empresa
CREATE UNIQUE INDEX IF NOT EXISTS uq_config_apr_tipo_empresa
    ON seguridad.sg_config_aprobacion(empresa_id, tipo_documento)
    WHERE activo = TRUE;

-- ── 3. Niveles / aprobadores de cada configuración ───────────────────────────
CREATE TABLE IF NOT EXISTS seguridad.sg_config_aprobacion_nivel (
    id                  SERIAL      PRIMARY KEY,
    config_id           INTEGER     NOT NULL
        REFERENCES seguridad.sg_config_aprobacion(id) ON DELETE CASCADE,
    empresa_id          INTEGER     NOT NULL,
    nivel               INTEGER     NOT NULL DEFAULT 1,
    aprobador_username  VARCHAR(20)
        REFERENCES seguridad.sg_usuario(username),
    usa_manager         BOOLEAN     NOT NULL DEFAULT FALSE,
    usuario_reg         VARCHAR(20),
    fecha_reg           TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_nivel_aprobador CHECK (aprobador_username IS NOT NULL OR usa_manager = TRUE)
);

-- ── 4. Solicitud de aprobación (runtime) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS seguridad.sg_aprobacion (
    id                   SERIAL      PRIMARY KEY,
    empresa_id           INTEGER     NOT NULL,
    sucursal_id          INTEGER     REFERENCES general.sg_sucursal(id),
    tipo_documento       VARCHAR(50) NOT NULL,
    documento_id         INTEGER     NOT NULL,
    config_id            INTEGER     NOT NULL
        REFERENCES seguridad.sg_config_aprobacion(id),
    solicitante_username VARCHAR(20) NOT NULL
        REFERENCES seguridad.sg_usuario(username),
    modo_aprobacion      VARCHAR(20) NOT NULL,
    estado_id            VARCHAR(20) NOT NULL DEFAULT 'PEN',
    comentario_final     TEXT,
    fecha_solicitud      TIMESTAMP   NOT NULL DEFAULT NOW(),
    fecha_resolucion     TIMESTAMP,
    usuario_reg          VARCHAR(20) NOT NULL,
    fecha_reg            TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aprobacion_doc
    ON seguridad.sg_aprobacion(empresa_id, tipo_documento, documento_id);

CREATE INDEX IF NOT EXISTS idx_aprobacion_estado
    ON seguridad.sg_aprobacion(empresa_id, estado_id);

-- ── 5. Detalle de aprobación (un registro por aprobador) ─────────────────────
CREATE TABLE IF NOT EXISTS seguridad.sg_aprobacion_detalle (
    id                  SERIAL      PRIMARY KEY,
    aprobacion_id       INTEGER     NOT NULL
        REFERENCES seguridad.sg_aprobacion(id) ON DELETE CASCADE,
    empresa_id          INTEGER     NOT NULL,
    nivel               INTEGER     NOT NULL DEFAULT 1,
    aprobador_username  VARCHAR(20) NOT NULL
        REFERENCES seguridad.sg_usuario(username),
    es_manager          BOOLEAN     NOT NULL DEFAULT FALSE,
    estado_id           VARCHAR(20) NOT NULL DEFAULT 'PEN',
    comentario          TEXT,
    fecha_respuesta     TIMESTAMP,
    usuario_reg         VARCHAR(20),
    fecha_reg           TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ── 6. Entradas de menú ───────────────────────────────────────────────────────
INSERT INTO seguridad.sg_menu (modulo_id, menu, url, activo, orden, empresa_id, fecha_reg, usuario_reg)
VALUES
    ('SEG', 'Config. Aprobaciones', '/aprobaciones-config',  TRUE, 61, 1, NOW(), 'admin'),
    ('SEG', 'Bandeja Aprobaciones', '/aprobaciones-bandeja', TRUE, 62, 1, NOW(), 'admin')
ON CONFLICT DO NOTHING;

-- ── 7. Permisos del rol administrador ────────────────────────────────────────
DO $$
DECLARE
    menu_config_id  INTEGER;
    menu_bandeja_id INTEGER;
    rol_admin_id    INTEGER := 1;  -- ← ajustar al id real del rol admin
    emp_id          INTEGER := 1;  -- ← ajustar al id real de la empresa
BEGIN
    SELECT id INTO menu_config_id  FROM seguridad.sg_menu WHERE url = '/aprobaciones-config'  LIMIT 1;
    SELECT id INTO menu_bandeja_id FROM seguridad.sg_menu WHERE url = '/aprobaciones-bandeja' LIMIT 1;
    IF menu_config_id IS NOT NULL THEN
        INSERT INTO seguridad.sg_permiso
            (empresa_id, rol_id, menu_id, puede_leer, puede_escribir, puede_eliminar, puede_imprimir, fecha_reg, usuario_reg)
        VALUES
            (emp_id, rol_admin_id, menu_config_id,  TRUE, TRUE, TRUE,  FALSE, NOW(), 'admin'),
            (emp_id, rol_admin_id, menu_bandeja_id, TRUE, TRUE, FALSE, FALSE, NOW(), 'admin')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
```

---

## Entidades JPA

### `SgConfigAprobacion.java`

Extiende `BaseEntity` (provee `id`, `empresaId`, `secuencia`, `activo`, `usuarioReg`, `fechaReg`).

```java
@Entity
@Table(
    name = "sg_config_aprobacion", schema = "seguridad",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_config_apr_tipo",
        columnNames = {"empresa_id", "tipo_documento"}))
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Getter @Setter @NoArgsConstructor
public class SgConfigAprobacion extends BaseEntity implements Serializable {

    @Column(name = "tipo_documento", nullable = false, length = 50)
    private String tipoDocumento;  // "REQUISICION", "ORDEN_COMPRA", etc.

    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;

    @Column(name = "modo_aprobacion", nullable = false, length = 20)
    private String modoAprobacion = "SECUENCIAL";

    @OneToMany(mappedBy = "config", cascade = CascadeType.ALL,
               fetch = FetchType.EAGER, orphanRemoval = true)
    @JsonIgnoreProperties("config")
    private List<SgConfigAprobacionNivel> niveles = new ArrayList<>();
}
```

### `SgConfigAprobacionNivel.java`

Entidad simple, sin clase base. El campo `aprobador` es **FetchType.EAGER** (necesario para evitar errores de proxy Hibernate al serializar).

```java
@Entity
@Table(name = "sg_config_aprobacion_nivel", schema = "seguridad")
@Getter @Setter @NoArgsConstructor
public class SgConfigAprobacionNivel implements Serializable {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "config_id", nullable = false)
    @JsonIgnoreProperties("niveles")
    private SgConfigAprobacion config;

    @Column(name = "empresa_id", nullable = false)
    private Integer empresaId;

    @Column(name = "nivel", nullable = false)
    private Integer nivel = 1;

    /**
     * Aprobador fijo. Null cuando usaManager = true.
     * EAGER: se necesita siempre al devolver la config completa.
     * @JsonIgnoreProperties incluye "sucursalId" para evitar ciclos adicionales.
     */
    @ManyToOne(fetch = FetchType.EAGER, optional = true)
    @JoinColumn(name = "aprobador_username", nullable = true)
    @JsonIgnoreProperties({"sucursalesAsignadas", "password", "manager", "sucursalId"})
    private SgUsuario aprobador;

    @Column(name = "usa_manager", nullable = false)
    private Boolean usaManager = false;

    @Column(name = "usuario_reg")
    private String usuarioReg;

    @Column(name = "fecha_reg")
    private LocalDateTime fechaReg;
}
```

### `SgAprobacion.java`

Extiende `BaseSucursal` (provee `empresaId`, `sucursalId`, `estadoId`, `usuarioReg`, `fechaReg`).

```java
@Entity
@Table(name = "sg_aprobacion", schema = "seguridad")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Getter @Setter @NoArgsConstructor
public class SgAprobacion extends BaseSucursal implements Serializable {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "tipo_documento", nullable = false, length = 50)
    private String tipoDocumento;

    @Column(name = "documento_id", nullable = false)
    private Integer documentoId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "config_id", nullable = false)
    @JsonIgnoreProperties("niveles")
    private SgConfigAprobacion config;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitante_username", nullable = false)
    @JsonIgnoreProperties({"sucursalesAsignadas", "password", "manager"})
    private SgUsuario solicitante;

    // modoAprobacion copiado de config al crear, para que cambios futuros en
    // la config no afecten solicitudes en curso
    @Column(name = "modo_aprobacion", nullable = false, length = 20)
    private String modoAprobacion;

    @Column(name = "comentario_final", columnDefinition = "TEXT")
    private String comentarioFinal;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    // estadoId heredado de BaseSucursal: PEN | APR | REC | CAN

    @OneToMany(mappedBy = "aprobacion", cascade = CascadeType.ALL,
               fetch = FetchType.EAGER, orphanRemoval = true)
    @JsonIgnoreProperties("aprobacion")
    private List<SgAprobacionDetalle> detalle = new ArrayList<>();
}
```

### `SgAprobacionDetalle.java`

Entidad simple, sin clase base.

```java
@Entity
@Table(name = "sg_aprobacion_detalle", schema = "seguridad")
@Getter @Setter @NoArgsConstructor
public class SgAprobacionDetalle implements Serializable {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aprobacion_id", nullable = false)
    @JsonIgnoreProperties("detalle")
    private SgAprobacion aprobacion;

    @Column(name = "empresa_id", nullable = false)
    private Integer empresaId;

    @Column(name = "nivel", nullable = false)
    private Integer nivel = 1;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aprobador_username", nullable = false)
    @JsonIgnoreProperties({"sucursalesAsignadas", "password", "manager"})
    private SgUsuario aprobador;

    @Column(name = "es_manager")
    private Boolean esManager = false;

    @Column(name = "estado_id", nullable = false, length = 20)
    private String estadoId = "PEN";   // PEN | APR | REC

    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    @Column(name = "usuario_reg")
    private String usuarioReg;

    @Column(name = "fecha_reg")
    private LocalDateTime fechaReg;
}
```

---

## Campo manager en SgUsuario

Relación self-referencial opcional. Preparada para que `usaManager=true` en la config resuelva al manager del solicitante en runtime.

```java
// En SgUsuario.java
@ManyToOne(fetch = FetchType.LAZY, optional = true)
@JoinColumn(name = "manager_username", nullable = true)
@JsonIgnoreProperties({"sucursalesAsignadas", "password", "manager"})
private SgUsuario manager;
```

**Importante:** `SgUsuario` debe tener `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` a nivel de clase para evitar errores de serialización con proxies Hibernate.

---

## Repositories

### `SgConfigAprobacionRepository`

```java
// Busca config activa para un tipo de documento y empresa
Optional<SgConfigAprobacion> findActivaByTipoYEmpresa(
    @Param("tipoDocumento") String tipoDocumento,
    @Param("empresaId") Integer empresaId);

// Búsqueda con proyección resumen
// IMPORTANTE: usar CAST(:param AS String) IS NULL — no bare :param IS NULL
// en Hibernate 6 los parámetros null con IS NULL no funcionan directamente
List<SgConfigAprobacionResumenDTO> buscar(
    @Param("empresaId") Integer empresaId,
    @Param("desde") LocalDateTime desde,
    @Param("hasta") LocalDateTime hasta,
    @Param("tipoDocumento") String tipoDocumento,
    @Param("activo") Boolean activo);

Optional<SgConfigAprobacion> findByIdAndEmpresaId(
    @Param("id") Integer id,
    @Param("empresaId") Integer empresaId);
```

### `SgAprobacionRepository`

```java
Optional<SgAprobacion> findByIdAndEmpresaId(Integer id, Integer empresaId);

// Historial de aprobaciones de un documento concreto
List<SgAprobacion> findByDocumento(Integer empresaId, String tipoDocumento, Integer documentoId);

// Búsqueda con resumen. aprobador != null filtra por aprobador con detalle PEN
// Usa CAST(:x AS String) IS NULL para todos los filtros opcionales tipo String
List<SgAprobacionResumenDTO> buscar(Integer empresaId, LocalDateTime desde, LocalDateTime hasta,
    String tipoDocumento, String estadoId, String solicitante, String aprobador);
```

---

## Service — lógica clave

### Crear solicitud

```java
// SgAprobacionServiceImpl.crearSolicitud(tipoDocumento, documentoId, solicitanteUsername)

SgConfigAprobacion config = configRepo
    .findActivaByTipoYEmpresa(tipoDocumento, empresaId)
    .orElseThrow(...);

// Iterar niveles de la config y resolver aprobador en runtime
for (SgConfigAprobacionNivel nivelConfig : config.getNiveles()) {
    SgUsuario aprobador;
    boolean esManager = false;

    if (Boolean.TRUE.equals(nivelConfig.getUsaManager())) {
        aprobador = solicitante.getManager();
        if (aprobador == null) throw new IllegalStateException("Sin manager asignado");
        esManager = true;
    } else {
        aprobador = nivelConfig.getAprobador();
    }

    SgAprobacionDetalle det = new SgAprobacionDetalle();
    det.setNivel(nivelConfig.getNivel());
    det.setAprobador(aprobador);
    det.setEsManager(esManager);
    det.setEstadoId("PEN");
    // ... auditoría
    aprobacion.getDetalle().add(det);
}
return aprobacionRepo.save(aprobacion);
```

### Responder (aprobar/rechazar)

```java
// El aprobador actual viene de TenantContext, no del request body
String aprobadorUsername = tenantContext.getCurrentUsername();

// Buscar el detalle PEN del aprobador actual
SgAprobacionDetalle miDetalle = aprobacion.getDetalle().stream()
    .filter(d -> aprobadorUsername.equals(d.getAprobador().getUsername())
              && "PEN".equals(d.getEstadoId()))
    .findFirst()
    .orElseThrow(() -> new AccesoDenegadoException("No tienes pendiente en esta solicitud."));

// Validar turno en SECUENCIAL
if ("SECUENCIAL".equals(aprobacion.getModoAprobacion())) {
    int nivelMinPendiente = aprobacion.getDetalle().stream()
        .filter(d -> "PEN".equals(d.getEstadoId()))
        .mapToInt(SgAprobacionDetalle::getNivel)
        .min().orElse(Integer.MAX_VALUE);
    if (miDetalle.getNivel() != nivelMinPendiente)
        throw new IllegalStateException("Debes esperar tu turno.");
}

miDetalle.setEstadoId(decision);  // "APR" | "REC"
miDetalle.setComentario(comentario);
miDetalle.setFechaRespuesta(LocalDateTime.now());

evaluarEstadoGlobal(aprobacion);
return aprobacionRepo.save(aprobacion);
```

### Evaluar estado global

```java
private void evaluarEstadoGlobal(SgAprobacion aprobacion) {
    long aprobados  = detalles.stream().filter(d -> "APR".equals(d.getEstadoId())).count();
    long rechazados = detalles.stream().filter(d -> "REC".equals(d.getEstadoId())).count();
    long total      = detalles.size();

    switch (aprobacion.getModoAprobacion()) {
        case "SECUENCIAL", "SIN_ORDEN" -> {
            if (rechazados > 0)          aprobacion.setEstadoId("REC");
            else if (aprobados == total) aprobacion.setEstadoId("APR");
        }
        case "AL_MENOS_UNO" -> {
            if (aprobados > 0)           aprobacion.setEstadoId("APR");
            else if (rechazados == total) aprobacion.setEstadoId("REC");
        }
    }

    if (!"PEN".equals(aprobacion.getEstadoId()))
        aprobacion.setFechaResolucion(LocalDateTime.now());
}
```

---

## Endpoints del controller

Base: `api/v1/seguridad/aprobaciones`

### Configuración (admin)

```
POST   /config/buscar          → buscarConfig(criteria)               sin permiso
GET    /config/{id}            → getConfigById(id)                    sin permiso
POST   /config                 → saveConfig(config)      @RequierePermiso(/aprobaciones-config, ESCRIBIR)
PUT    /config/{id}            → updateConfig(id, config) @RequierePermiso(/aprobaciones-config, ESCRIBIR)
DELETE /config/{id}            → desactivarConfig(id)    @RequierePermiso(/aprobaciones-config, ELIMINAR)
```

### Solicitudes (bandeja)

```
GET    /pendientes             → getMisPendientes()                    sin permiso
GET    /{id}                   → getById(id)                          sin permiso
POST   /buscar                 → buscar(criteria)                     sin permiso
POST   /{id}/aprobar           → responder(id, "APR", comentario)    @RequierePermiso(/aprobaciones-bandeja, ESCRIBIR)
POST   /{id}/rechazar          → responder(id, "REC", comentario)    @RequierePermiso(/aprobaciones-bandeja, ESCRIBIR)
```

Body de aprobar/rechazar: `{ "comentario": "..." }` (opcional en aprobar, recomendado en rechazar).

---

## Integración desde un módulo externo

```java
// En el service del documento (ej. InRequisicionServiceImpl):

@Autowired
private SgAprobacionService aprobacionService;

// Al enviar a aprobación:
public InRequisicion enviarAprobacion(Integer id) {
    InRequisicion req = repository.findByIdAndEmpresaId(id, empresaId).orElseThrow(...);

    // 1. Verificar si existe configuración activa para este tipo
    if (!aprobacionService.existeConfigActiva("REQUISICION")) {
        // Sin config activa: aprobar directo
        req.setEstadoId("APR");
        return repository.save(req);
    }

    // 2. Cambiar estado del documento
    req.setEstadoId("PEN_APR");
    repository.save(req);

    // 3. Crear la solicitud de aprobación
    aprobacionService.crearSolicitud("REQUISICION", req.getId(), username);

    return req;
}
```

**Nota:** El módulo externo es responsable de consultar el estado de `SgAprobacion` (vía `findByDocumento`) para actualizar su propio estado cuando la aprobación se resuelva. No hay callback automático — el diseño actual es pull, no push.

---

## Rutas del frontend

```
/aprobaciones-config   → AprobacionConfigView    (admin: crear/editar configuraciones)
/aprobaciones-bandeja  → AprobacionBandejaView   (aprobadores: ver y responder pendientes)
```

Ambas rutas están en `App.tsx` como `<Route>` hijas de la ruta protegida.

---

## Modelos TypeScript (`src/models/seguridad/SgAprobacion.tsx`)

```typescript
export type ModoAprobacion = "SECUENCIAL" | "SIN_ORDEN" | "AL_MENOS_UNO";
export type EstadoAprobacion = "PEN" | "APR" | "REC" | "CAN";

export interface SgConfigAprobacionNivel {
    id?: number;
    nivel: number;
    aprobador?: { username: string; nombre: string } | null;
    usaManager: boolean;
}

export interface SgConfigAprobacion {
    id?: number;
    tipoDocumento: string;
    nombre: string;
    modoAprobacion: ModoAprobacion;
    activo?: boolean;
    niveles: SgConfigAprobacionNivel[];
}

export interface SgAprobacionDetalle {
    id?: number;
    nivel: number;
    aprobador: { username: string; nombre: string };
    esManager: boolean;
    estadoId: EstadoAprobacion;
    comentario?: string;
    fechaRespuesta?: string;
}

export interface SgAprobacion {
    id?: number;
    tipoDocumento: string;
    documentoId: number;
    solicitante: { username: string; nombre: string };
    modoAprobacion: ModoAprobacion;
    estadoId: EstadoAprobacion;  // viene de BaseSucursal
    comentarioFinal?: string;
    fechaSolicitud: string;
    fechaResolucion?: string;
    detalle: SgAprobacionDetalle[];
}

export interface SgAprobacionResumenDTO {
    id: number;
    tipoDocumento: string;
    documentoId: number;
    solicitanteUsername: string;
    solicitanteNombre: string;
    modoAprobacion: ModoAprobacion;
    estadoId: EstadoAprobacion;
    fechaSolicitud: string;
    fechaResolucion?: string;
    totalAprobadores: number;
    pendientes: number;
}

// Helpers UI
export const MODOS_APROBACION: { value: ModoAprobacion; label: string; descripcion: string }[]
export const TIPOS_DOCUMENTO:  { value: string; label: string }[]
export const ESTADO_APROBACION_LABEL: Record<EstadoAprobacion, string>
export const ESTADO_APROBACION_COLOR: Record<EstadoAprobacion, "default"|"warning"|"success"|"error">
```

---

## API client (`src/apis/AprobacionController.tsx`)

```typescript
const BASE = "/api/v1/seguridad/aprobaciones";

// Config
buscarConfig(criteria)          → POST /config/buscar
getConfig(id)                   → GET  /config/{id}
saveConfig(config)              → POST /config
updateConfig(id, config)        → PUT  /config/{id}
desactivarConfig(id)            → DELETE /config/{id}

// Solicitudes
getMisPendientes()              → GET  /pendientes
getAprobacion(id)               → GET  /{id}
buscarAprobaciones(criteria)    → POST /buscar
aprobar(id, comentario?)        → POST /{id}/aprobar  { comentario }
rechazar(id, comentario)        → POST /{id}/rechazar { comentario }
```

---

## Config de búsqueda modal (`src/types/modalSearchTypes.ts`)

```typescript
APROBACION: {
    title: "Buscar Aprobaciones",
    endpoint: "/api/v1/seguridad/aprobaciones/buscar",
    method: "POST",
    keyField: "id",
    searchOnLoad: true,
    pagination: { enabled: true, pageSize: 10 },
    defaultParams: { /* últimos 30 días */ },
    fields: [
        { key: "tipoDocumento", label: "Tipo",        type: "text"   },
        { key: "solicitante",   label: "Solicitante", type: "text"   },
        { key: "estadoId",      label: "Estado",      type: "select",
          options: [
              { value: "",    label: "Todos" },
              { value: "PEN", label: "Pendiente" },
              { value: "APR", label: "Aprobado" },
              { value: "REC", label: "Rechazado" },
          ]},
    ],
    displayColumns: [
        { key: "id",                label: "ID",          width: "6%" },
        { key: "tipoDocumento",     label: "Tipo",        width: "16%" },
        { key: "documentoId",       label: "Doc.",        width: "8%" },
        { key: "solicitanteNombre", label: "Solicitante", width: "20%" },
        { key: "modoAprobacion",    label: "Modo",        width: "14%" },
        { key: "pendientes",        label: "Pendientes",  width: "10%" },
        { key: "fechaSolicitud",    label: "Fecha",       width: "16%",
          render: (v) => formatDateTimeForUi(v) },
        { key: "estadoId",          label: "Estado",      width: "10%" },
    ],
} as SearchConfig
```

---

## Gotchas / problemas conocidos

### 1. Proxy Hibernate en SgUsuario
`SgUsuario` debe tener `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` a nivel de clase.
Sin esto, cualquier `SgUsuario` cargado con `FetchType.LAZY` que no esté inicializado lanza:
```
InvalidDefinitionException: No serializer found for ByteBuddyInterceptor
```

### 2. FetchType.EAGER en `aprobador` de `SgConfigAprobacionNivel`
`aprobador` debe ser `FetchType.EAGER`. Al devolver la config completa, si es LAZY el proxy
no se inicializa antes de la serialización JSON → mismo error que arriba.

### 3. JPQL null-check con Hibernate 6
El patrón `:param IS NULL` no funciona con Hibernate 6 para parámetros `null`.
Usar siempre:
```java
AND (CAST(:tipoDocumento AS String) IS NULL OR ...)
AND (CAST(:activo AS Boolean) IS NULL OR ...)
```

### 4. `@RequierePermiso` menuUrl
Los `menuUrl` deben coincidir exactamente con `sg_menu.url`:
- Configuración de aprobaciones: `"/aprobaciones-config"`
- Bandeja de aprobaciones: `"/aprobaciones-bandeja"`

### 5. `@JsonIgnoreProperties("sucursalId")` en aprobador del nivel
Sin ignorar `sucursalId`, Jackson intenta serializar la FK `SgSucursal` de `SgUsuario`
(herencia de `BaseSucursal`) generando referencias circulares adicionales.

---

## Estados

| Código | `sg_aprobacion.estado_id` | `sg_aprobacion_detalle.estado_id` |
|--------|--------------------------|-----------------------------------|
| `PEN`  | Pendiente                | Pendiente (aún no respondió)       |
| `APR`  | Aprobado                 | Aprobó                            |
| `REC`  | Rechazado                | Rechazó                           |
| `CAN`  | Cancelado (cabecera)     | —                                 |
