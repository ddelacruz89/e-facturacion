# Ejemplos de Uso - API Órdenes de Compra

## 1. Crear Orden de Compra

**Endpoint:** `POST /api/v1/inventario/ordenes-compras`

**Request Body:**
```json
{
  "subTotal": 500,
  "itbis": 90,
  "total": 590,
  "descuento": 0,
  "suplidorId": 4,
  "estadoId": "P",
  "detalles": [
    {
      "productoId": 11,
      "cantidad": 1,
      "precioUnitario": 500,
      "itbisProducto": 18,
      "descuentoPorciento": 0,
      "descuentoCantidad": 0,
      "subTotal": 500,
      "itbis": 90,
      "total": 590
    }
  ]
}
```

## 2. Buscar Órdenes de Compra (con paginación)

**Endpoint:** `POST /api/v1/inventario/ordenes-compras/buscar`

### Ejemplo 1: Buscar todas las órdenes del mes actual
```json
{
  "fechaInicio": "2026-02-01",
  "fechaFin": "2026-02-28",
  "page": 0,
  "size": 10
}
```

### Ejemplo 2: Buscar órdenes de un suplidor específico
```json
{
  "fechaInicio": "2026-01-01",
  "fechaFin": "2026-02-28",
  "suplidorId": 4,
  "page": 0,
  "size": 20
}
```

### Ejemplo 3: Buscar órdenes con estado específico
```json
{
  "fechaInicio": "2026-02-01",
  "fechaFin": "2026-02-28",
  "estadoId": "ACT",
  "page": 0,
  "size": 10
}
```

### Ejemplo 4: Buscar una orden específica por ID
```json
{
  "fechaInicio": "2026-01-01",
  "fechaFin": "2026-12-31",
  "id": 15,
  "page": 0,
  "size": 10
}
```

### Ejemplo 5: Búsqueda completa con todos los filtros
```json
{
  "fechaInicio": "2026-02-01",
  "fechaFin": "2026-02-28",
  "suplidorId": 4,
  "estadoId": "P",
  "page": 0,
  "size": 10
}
```

### Ejemplo 6: Si no se envían fechas (usa mes actual por defecto)
```json
{
  "suplidorId": 4,
  "page": 0,
  "size": 10
}
```

## 3. Response de Búsqueda (Paginado)

```json
{
  "status": "OK",
  "content": {
    "content": [
      {
        "id": 1,
        "subTotal": 500.00,
        "itbis": 90.00,
        "total": 590.00,
        "descuento": 0.00,
        "usuarioReg": "admin",
        "fechaReg": "23/02/2026 09:30 AM",
        "suplidorId": {
          "id": 4,
          "nombre": "BRAINTECH SRL",
          "rnc": "123456789"
        },
        "estadoId": "P",
        "cotizacionId": null,
        "inOrdenesComprasDetallesList": [
          {
            "id": 1,
            "cantidad": 1,
            "precioUnitario": 500.00,
            "itbisProducto": 18.00,
            "subTotal": 500.00,
            "itbis": 90.00,
            "total": 590.00,
            "productoId": {
              "id": 11,
              "nombreProducto": "Producto X"
            },
            "unidadNombre": "Unidad",
            "unidadCantidad": 1,
            "descuentoPorciento": 0.0,
            "descuentoCantidad": 0.0,
            "estadoId": "ACT"
          }
        ]
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "offset": 0,
      "paged": true,
      "unpaged": false
    },
    "totalPages": 1,
    "totalElements": 1,
    "last": true,
    "size": 10,
    "number": 0,
    "numberOfElements": 1,
    "first": true,
    "empty": false
  }
}
```

## 4. Obtener Resumen (Listado Simple)

**Endpoint:** `GET /api/v1/inventario/ordenes-compras/resumen`

**Response:**
```json
{
  "status": "OK",
  "content": [
    {
      "id": 1,
      "suplidorNombre": "BRAINTECH SRL",
      "total": 590.00,
      "estadoId": "P",
      "fechaReg": "23/02/2026 09:30 AM"
    },
    {
      "id": 2,
      "suplidorNombre": "OTRO SUPLIDOR",
      "total": 1200.00,
      "estadoId": "ACT",
      "fechaReg": "22/02/2026 10:15 AM"
    }
  ]
}
```

## 5. Obtener Orden Específica

**Endpoint:** `GET /api/v1/inventario/ordenes-compras/{id}`

**Ejemplo:** `GET /api/v1/inventario/ordenes-compras/1`

## 6. Actualizar Orden

**Endpoint:** `PUT /api/v1/inventario/ordenes-compras/{id}`

**Request Body:** (Entidad completa `InOrdenesCompras`)

## 7. Deshabilitar Orden

**Endpoint:** `DELETE /api/v1/inventario/ordenes-compras/{id}`

**Response:**
```json
{
  "status": "OK",
  "content": {
    "id": 1,
    "estadoId": "INA"
  }
}
```

## Notas Importantes

1. **Fechas son mandatorias** en la búsqueda. Si no se envían, se usa el mes actual por defecto.
2. **Multi-tenant**: Todas las búsquedas se filtran automáticamente por `empresaId` del contexto.
3. **Paginación por defecto**: Si no se especifica, usa `page=0` y `size=10`.
4. **Estado único**: El filtro `estadoId` permite buscar por un solo estado. Estados comunes: "ACT" (Activo), "P" (Pendiente), "INA" (Inactivo), "COMP" (Completado), etc.
5. **Ordenamiento**: Los resultados siempre se ordenan por `fechaReg` descendente (más recientes primero).



