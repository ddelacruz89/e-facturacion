# Módulo de Factura Suplidor — Contexto técnico

## Propósito

Registra las facturas emitidas por los suplidores (proveedores) de la empresa. Soporta comprobantes fiscales electrónicos (e-CF / NCF), retenciones de ITBIS e ISR por renglón, descuentos por monto o porcentaje, y múltiples formas de pago. Se integra con la DGII para envío y validación de facturas electrónicas.

Flujo de estados: `PEN → ACT → PAG / ANU`

---

## Base de datos (PostgreSQL, schema `facturacion`)

### `facturacion.mf_factura_suplidor`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | Clave interna |
| `empresa_id` | INTEGER | Tenant |
| `sucursal_id` | INTEGER FK → `seguridad.sg_sucursales(id)` | Sucursal del tenant |
| `secuencia` | INTEGER | Número visible por empresa (1, 2, 3 … por tenant) |
| `suplidor_id` | INTEGER FK → `inventario.in_suplidores(id)` | Proveedor |
| `numero_factura` | VARCHAR | Número de la factura del suplidor |
| `ncf` | VARCHAR | NCF electrónico: "E" + tipoComprobante + 10 dígitos |
| `tipo_comprobante_id` | VARCHAR | Tipo de comprobante DGII |
| `tipo_factura_id` | INTEGER FK → `mg_tipo_factura(id)` | Tipo de factura |
| `razon_social` | VARCHAR | Razón social del suplidor |
| `rnc` | VARCHAR | RNC del suplidor |
| `fecha_emision` | DATE | Fecha de emisión de la factura del suplidor |
| `fecha_limite_pago` | DATE | Fecha de vencimiento / límite de pago |
| `fecha_pago` | TIMESTAMP | Fecha en que se realizó el pago |
| `sub_total` | NUMERIC(16,2) | Subtotal sin ITBIS |
| `itbis` | NUMERIC(16,2) | ITBIS total |
| `descuento` | NUMERIC(16,2) | Descuento total |
| `total` | NUMERIC(16,2) | Total de la factura |
| `pago` | NUMERIC(16,2) | Monto pagado acumulado |
| `monto_anulado` | NUMERIC(16,2) | Monto registrado al anular |
| `monto_retencion_itbis` | NUMERIC(16,2) | ITBIS retenido a nivel de header |
| `retencion_isr_id` | INTEGER FK → `mg_retenciones_itbis(id)` | Tabla de % ISR aplicable |
| `monto_retencion_isr` | NUMERIC(16,2) | Monto retenido de ISR |
| `retencion_itbis_id` | INTEGER FK → `mg_retenciones_itbis(id)` | Tabla de % ITBIS aplicable |
| `monto_retencion_itbis_pct` | NUMERIC(16,2) | % de retención ITBIS |
| `contable_id` | INTEGER FK → `mc_catalogo_cuentas(id)` | Cuenta contable de costo |
| `cxp_id` | INTEGER FK → `mc_catalogo_cuentas(id)` | Cuenta por pagar |
| `orden_entrada_id` | INTEGER | ID de la orden de entrada relacionada (opcional) |
| `tipo_ingreso` | INTEGER | Tipo de ingreso |
| `tiene_mora` | BOOLEAN | ¿Tiene mora calculada? |
| `mora_porciento` | INTEGER | % de mora |
| `fecha_mora` | TIMESTAMP | Fecha en que se aplicó la mora |
| `es_facturado_electronicamente` | BOOLEAN | ¿Es e-CF? |
| `aprobada` | BOOLEAN | Estado de aprobación en DGII (se verifica via QR) |
| `qr_url` | VARCHAR | URL del QR de validación DGII |
| `fecha_firma` | VARCHAR | Fecha de firma del e-CF |
| `security_code` | VARCHAR | Código de seguridad DGII |
| `track_id` | VARCHAR | Track ID DGII |
| `fecha_anulado` | TIMESTAMP | Fecha de anulación |
| `usuario_anulacion` | VARCHAR | Usuario que anuló |
| `estado_id` | VARCHAR | `PEN` \| `ACT` \| `PAG` \| `ANU` |
| `usuario_reg` | VARCHAR | Usuario que registró |
| `fecha_reg` | TIMESTAMP | Fecha de registro |

### `facturacion.mf_factura_suplidor_detalle`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `factura_suplidor_id` | INTEGER FK → `mf_factura_suplidor(id)` | Header |
| `cantidad` | NUMERIC | Cantidad |
| `precio_unitario` | NUMERIC(16,2) | Precio por unidad |
| `monto_item` | NUMERIC(16,2) | Precio × cantidad (antes descuento) |
| `concepto` | VARCHAR | Descripción del renglón |
| `sub_total` | NUMERIC(16,2) | Subtotal del renglón |
| `retencion` | NUMERIC(16,2) | Monto de retención ISR del renglón |
| `retencion_porciento` | NUMERIC | % de retención ISR |
| `monto_descuento` | NUMERIC(16,2) | Descuento total del renglón |
| `monto_recargo` | NUMERIC(16,2) | Recargo adicional |
| `itbis` | NUMERIC(16,2) | ITBIS del renglón |
| `monto_itbis_retenido` | NUMERIC(16,2) | ITBIS retenido del renglón |
| `itbis_id` | INTEGER FK → `mg_itbis(id)` | Tabla de % ITBIS |
| `itbis_porciento` | NUMERIC | % ITBIS aplicado |
| `total` | NUMERIC(16,2) | Total del renglón |
| `indicador_bien_servicio` | INTEGER | `1`=Bien, `2`=Servicio |
| `forma_pago_id` | INTEGER | ID de forma de pago (sin entidad JPA, solo ID) |
| `estado` | VARCHAR | Estado del renglón (ACT, etc.) |

### `facturacion.mf_factura_suplidor_detalle_descuento`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `detalle_id` | INTEGER FK → `mf_factura_suplidor_detalle(id)` ON DELETE CASCADE | |
| `tipo` | VARCHAR(1) CHECK `'$'` o `'%'` | Tipo de descuento |
| `valor` | NUMERIC(16,4) | % ingresado o monto $ingresado |
| `monto` | NUMERIC(16,2) | RD$ calculado resultante |
| `empresa_id` | INTEGER | |

### `facturacion.mf_factura_suplidor_pagos_header`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | |
| `factura_suplidor_id` | INTEGER FK | Header de factura |
| `monto` | NUMERIC(16,2) | Monto del pago |
| `pagado` | NUMERIC(16,2) | Monto efectivamente pagado |
| `fecha_pago` | TIMESTAMP | |
| `usuario_reg` | VARCHAR | |
| `fecha_anulado` | TIMESTAMP | |
| `usuario_anulacion` | VARCHAR | |
| `estado_id` | VARCHAR | |
| `contable_id` | INTEGER | |

### `facturacion.mf_factura_suplidor_pagos_detalle`

Renglones de pago: `numero_referencia`, `forma_pago_id`, `monto_pagado`, `fecha_pago`, `concepto`, `tipo_pago`, `estado`.

---

## Estructura de herencia JPA

```
BaseEntityPk
  └─ BaseDgII          ← campos DGII: ncf, securityCode, trackId, qrUrl,
  │                       fechaFirma, aprobada, razonSocial, rnc, tipoComprobanteId
  └─ BaseEntitySucursal
       └─ MfFacturaSuplidor
```

`BaseDgII` extiende `BaseEntitySucursal` que extiende `BaseEntityPk` (id, empresaId, sucursalId, usuarioReg, fechaReg, estadoId).

---

## Backend Java

### Paquetes

| Artefacto | Ruta relativa a `src/main/java/com/braintech/eFacturador/` |
|---|---|
| Entidad header | `jpa/facturacion/MfFacturaSuplidor.java` |
| Entidad detalle | `jpa/facturacion/MfFacturaSuplidorDetalle.java` |
| Entidad descuento | `jpa/facturacion/MfFacturaSuplidorDetalleDescuento.java` |
| Entidad pago header | `jpa/facturacion/MfFacturaSuplidorPagosHeader.java` |
| Entidad pago detalle | `jpa/facturacion/MfFacturaSuplidorPagosDetalle.java` |
| Entidad forma de pago | `jpa/facturacion/MfFacturaSuplidorFormaPago.java` |
| DTO resumen | `dto/facturacion/MfFacturaSuplidorResumenDTO.java` |
| DTO request | `dto/facturacion/MfFacturaSuplidorRequestDTO.java` |
| DTO detalle request | `dto/facturacion/MfFacturaSuplidorDetalleRequestDTO.java` |
| DTO descuento request | `dto/facturacion/MfFacturaSuplidorDetalleDescuentoRequestDTO.java` |
| DTO criteria | `dto/facturacion/MfFacturaSuplidorSearchCriteria.java` |
| DAO interface | `dao/facturacion/MfFacturaSuplidorDao.java` |
| DAO impl | `dao/facturacion/MfFacturaSuplidorDaoImpl.java` |
| Repository | `dao/facturacion/MfFacturaSuplidorRepository.java` |
| Service interface | `services/facturacion/MfFacturaSuplidorService.java` |
| Service impl | `services/facturacion/impl/MfFacturaSuplidorServiceImpl.java` |
| Controller | `controllers/facturacion/MfFacturaSuplidorController.java` |

### Entidad `MfFacturaSuplidor`

- `@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")` en el header.
- `suplidor` → `@ManyToOne(fetch = LAZY)` a `InSuplidor`.
- `tipoFactura` → `@ManyToOne` a `MgTipoFactura`.
- `retencionIsr`, `retencionItbis` → `@ManyToOne` a `MgRetencionItbis`.
- `contable`, `cxp` → `@ManyToOne` a `McCatalogoCuenta`.
- `detalles` → `@OneToMany(cascade = ALL, orphanRemoval = true, mappedBy = "facturaSuplidor", fetch = EAGER)`.

### Entidad `MfFacturaSuplidorDetalle`

- `@JsonIgnoreProperties({"header"})` en el lado `@ManyToOne` hacia el header.
- `itbisObj` → `@ManyToOne` a `MgItbis` (para obtener el % en el objeto).
- `descuentos` → `@OneToMany(cascade = ALL, orphanRemoval = true)` a `MfFacturaSuplidorDetalleDescuento`.
- `formaPagoId` es `Integer` plano (no entidad), se guarda solo el ID.

### DAO — query de búsqueda JPQL

```java
SELECT new com.braintech.eFacturador.dto.facturacion.MfFacturaSuplidorResumenDTO(
    f.id, f.secuencia, f.fechaReg,
    (SELECT s.nombre FROM InSuplidor s WHERE s.id = f.suplidor.id),
    f.numeroFactura, f.ncf, f.total, f.estadoId, f.usuarioReg
)
FROM MfFacturaSuplidor f
WHERE f.empresaId = :empresaId
  [AND f.sucursalId.id = :sucursalId]          -- si criteria.sucursalId != null
  [AND f.suplidor.id = :suplidorId]            -- si criteria.suplidorId != null
  [AND LOWER(f.numeroFactura) LIKE :nroFact]   -- si criteria.numeroFactura != null
  [AND f.estadoId = :estadoId]                 -- si criteria.estadoId != null
  [AND f.fechaReg >= :desde]                   -- fechaInicio.atStartOfDay()
  [AND f.fechaReg <= :hasta]                   -- fechaFin.atTime(LocalTime.MAX)
ORDER BY f.fechaReg DESC
```

### Service — puntos clave

**Creación (`save`)**
1. Leer `empresaId`, `sucursalId`, `username` de `TenantContext`.
2. Mapear DTO → entidad con `mapHeader()` (usa proxies JPA por ID, no consultas extra).
3. Mapear detalles con `mapDetalles()` — incluyendo lista de descuentos por renglón.
4. Sobreescribir `fechaReg`, `usuarioReg`, `estadoId` inicial desde contexto.
5. Generar NCF: `"E" + tipoComprobante + String.format("%010d", secuencia)`.
6. Primer `repository.save(entity)` para obtener el `id` autoincremental.
7. Llamar `secuenciasDao.getNextSecuencia(empresaId, "MFFACTURASUPLIDOR")`.
8. Asignar secuencia y hacer segundo `repository.save(saved)`.
9. Llamar `ecfServices.senderEcfTerceros(saved)` para envío a DGII.

**Actualización (`update`)**
1. Buscar entidad existente por `id` y `empresaId` (lanza excepción si no existe).
2. Mapear nuevamente header y detalles desde el DTO.
3. `orphanRemoval = true` limpia automáticamente los detalles y descuentos anteriores.
4. Persistir con `repository.save()`.

**Validación QR (`checkAndUpdateAprobadaFromQrUrl`)**
1. Cargar factura por ID.
2. Obtener `qrUrl` del campo guardado.
3. Consultar URL con `RestTemplate`.
4. Parsear HTML buscando `"Estado"` y `"Aceptado"`.
5. Actualizar campo `aprobada` (Boolean) en BD.
6. Retornar `1` si aprobada, `0` si rechazada / pendiente.

### Controller REST

**Base URL:** `/api/v1/facturacion/facturas-suplidor`

| Método | Ruta | Descripción | Permiso |
|---|---|---|---|
| `POST` | `/buscar` | Búsqueda paginada con filtros (devuelve ResumenDTO) | Ninguno |
| `GET` | `/{id}` | Obtener factura completa por ID interno | Ninguno |
| `GET` | `/by-secuencia/{secuencia}` | Obtener por número visible del usuario | Ninguno |
| `POST` | `/` | Crear factura | `@RequierePermiso ESCRIBIR` |
| `PUT` | `/{id}` | Actualizar factura | `@RequierePermiso ESCRIBIR` |
| `GET` | `/{id}/validar-qr` | Validar contra DGII y actualizar `aprobada` | Ninguno |

Respuesta de `validar-qr`: `{ "aprobada": 0 | 1 }`.

---

## Frontend (React / TypeScript)

### Archivos clave

| Artefacto | Ruta |
|---|---|
| Modelos TS | `src/models/facturacion/MfFacturaSuplidor.tsx` |
| Modelos pagos | `src/models/facturacion/MfFacturaSuplidorPagos.tsx` |
| API controller | `src/apis/FacturaSuplidorController.tsx` |
| API pagos | `src/apis/FacturaSuplidorPagosController.tsx` |
| Componente view | `src/components/facturacion/FacturaSuplidorView.tsx` |
| Componente pagos | `src/components/facturacion/FacturaSuplidorPagosView.tsx` |
| Config búsqueda | `src/types/modalSearchTypes.ts` → clave `FACTURA_SUPLIDOR` |

### Modelos TypeScript principales

```typescript
MfFacturaSuplidorResumen          // para tabla de búsqueda / modal
MfFacturaSuplidorSearchCriteria   // filtros del modal
MfFacturaSuplidorDetalleDescuentoRequest  // tipo '$' | '%', valor, monto
MfFacturaSuplidorDetalleRequest   // renglón con descuentos[]
MfFacturaSuplidorRequest          // header + detalles[] para POST/PUT
MfFacturaSuplidor                 // respuesta completa GET /{id}
```

### Funciones del API controller

```typescript
buscarFacturasSuplidor(criteria)          // POST /buscar → MfFacturaSuplidorResumen[]
getFacturaSuplidorById(id)               // GET /{id}   → MfFacturaSuplidor
getFacturaSuplidorBySecuencia(secuencia) // GET /by-secuencia/{n}
saveFacturaSuplidor(dto)                 // POST /
updateFacturaSuplidor(id, dto)           // PUT /{id}
validarQrFacturaSuplidor(id)             // GET /{id}/validar-qr → number (0|1)
```

`normalizePayload()` — helper que extrae el ID numérico de `suplidorId` si llega como objeto (protección contra el combobox que puede devolver el objeto completo en lugar del ID).

### Config modal de búsqueda (`FACTURA_SUPLIDOR`)

```typescript
{
    title: "Buscar Factura Suplidor",
    endpoint: "/api/v1/facturacion/facturas-suplidor/buscar",
    method: "POST",
    keyField: "id",
    searchOnLoad: true,
    pagination: { enabled: true, pageSize: 10 },
    defaultParams: { fechaInicio: hace30Dias, fechaFin: hoy },
    fields: [
        { key: "fechaInicio", type: "date", label: "Fecha Inicio" },
        { key: "fechaFin",    type: "date", label: "Fecha Fin" },
        { key: "numeroFactura", type: "text", label: "No. Factura" },
        { key: "suplidorId",  type: "number", label: "Suplidor ID" },
        { key: "estadoId",    type: "select", options: ["", "ACT", "PEN", "PAG", "ANU"] },
    ],
    displayColumns: [
        { key: "secuencia",     label: "No.",        width: "7%"  },
        { key: "fechaReg",      label: "Fecha",      width: "18%" },
        { key: "suplidorNombre",label: "Suplidor",   width: "22%" },
        { key: "numeroFactura", label: "No. Factura",width: "13%" },
        { key: "ncf",           label: "NCF",        width: "13%" },
        { key: "total",         label: "Total",      width: "13%" },
        { key: "estadoId",      label: "Estado",     width: "8%"  },
        { key: "usuarioReg",    label: "Usuario",    width: "6%"  },
    ]
}
```

### Componente `FacturaSuplidorView`

- React Hook Form para validación del formulario.
- Array dinámico de renglones; cada renglón tiene su propio array de descuentos gestionado en diálogo aparte.
- Cálculo automático al cambiar cantidad, precio, ITBIS o descuentos: subtotal → descuento → ITBIS → retención → total renglón → totales del header.
- Zona horaria República Dominicana (UTC-4) para formateo de fechas.
- Colores: `navDark`, `tableHead`, `accentTeal`, `totalsRow` (paleta oficial del app).
- Integración con combobox de suplidor, ITBIS, retenciones ISR, retenciones ITBIS.
- Botón "Validar QR" llama a `validarQrFacturaSuplidor(id)` y muestra el resultado en la UI.

---

## Flujo de negocio

### Estados

| Estado | Descripción |
|---|---|
| `PEN` | Pendiente — registrada pero no confirmada |
| `ACT` | Activa — vigente sin pagar |
| `PAG` | Pagada — completamente pagada |
| `ANU` | Anulada |

### Cálculos por renglón

```
montoItem  = cantidad × precioUnitario
descuento  = valor ($) o montoItem × valor% (%)   ← suma de todos los descuentos del renglón
subTotal   = montoItem - descuento
ITBIS      = subTotal × itbisPorciento
retencion  = subTotal × retencionPorciento         ← ISR o ITBIS retenido
total      = subTotal + ITBIS - retencion
```

### Totales del header

```
subTotal  = SUM(detalle.subTotal)
itbis     = SUM(detalle.itbis)
descuento = SUM(detalle.montoDescuento)
total     = SUM(detalle.total)
```

### Flujo e-CF (factura electrónica)

1. Al crear, el service genera el NCF: `"E" + tipoComprobanteId + String.format("%010d", secuencia)`.
2. Llama `ecfServices.senderEcfTerceros(factura)` para envío a DGII.
3. DGII responde con `trackId`, `securityCode`, `qrUrl`, `fechaFirma`.
4. Esos campos se almacenan en la entidad (campos de `BaseDgII`).
5. El usuario puede luego presionar "Validar QR" para confirmar que DGII aprobó la factura.

### Relación con Orden de Entrada

- `ordenEntradaId` (Integer) puede apuntar a una `InOrdenEntrada`.
- Es opcional; no tiene FK JPA tipada, solo el ID guardado.
- Se usa para trazar la cadena: Requisición → Orden de Entrada → Factura Suplidor.

---

## Relaciones con otros módulos

| Módulo | Relación |
|---|---|
| `InSuplidor` | `@ManyToOne` — el proveedor que emite la factura |
| `MgItbis` | `@ManyToOne` en el detalle — % de ITBIS por renglón |
| `MgRetencionItbis` | `@ManyToOne` en header — tabla de retenciones ISR e ITBIS |
| `MgTipoFactura` | `@ManyToOne` en header — tipo de factura |
| `McCatalogoCuenta` | `@ManyToOne` en header — cuentas contables (costo y CxP) |
| `MfFacturaSuplidorPagosHeader` | `@OneToMany` — pagos aplicados a la factura |
| `InOrdenEntrada` | Referencia por `ordenEntradaId` (Integer) — sin FK tipada |
| `ecfServices` | Servicio de envío de e-CF a DGII |
| `SecuenciasDao` | Generación de secuencia visible por empresa |
