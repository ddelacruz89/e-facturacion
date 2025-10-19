# Multi-Tenant DAO Filtering Summary

## DAOs Updated with Correct Filtering Patterns

### Entities Extending BaseEntity (Filter by `empresaId` column)
These entities have a direct `empresaId` column and use: `WHERE e.empresaId = :empresaId`

| DAO | Entity | Base Class | Filtering Pattern |
|-----|--------|------------|-------------------|
| `EmpresaDao` | `SgEmpresa` | `BaseEntity` | `e.id = :empresaId` (empresa filters by its own id) |
| `SgSucursalRepository` | `SgSucursal` | `BaseEntity` | `s.empresa.id = :empresaId` |
| `ModuloDao` | `SgModulo` | `BaseEntity` | `m.empresaId = :empresaId` |
| `MgCategoriaRepository` | `MgCategoria` | `BaseEntity` | `c.empresaId = :empresaId` |
| `TipoComprobanteDao` | `MgTipoComprobante` | `BaseEntity` | `t.empresaId = :empresaId` |
| `TipoFacturaDao` | `MgTipoFactura` | `BaseEntity` | `t.empresaId = :empresaId` |
| `TipoItbisDao` | `MgItbis` | `BaseEntity` | `i.empresaId = :empresaId` |
| `FacturaDao` | `MfFactura` | `BaseDgII → BaseEntity` | `f.empresaId = :empresaId` |

### Entities Extending BaseSucursal (Filter by `sucursalId.empresa.id`)
These entities have a `sucursalId` relationship and filter through: `WHERE e.sucursalId.empresa.id = :empresaId`

| DAO | Entity | Base Class | Filtering Pattern |
|-----|--------|------------|-------------------|
| `SgUsuarioDao` | `SgUsuario` | `BaseSucursal` | `s.sucursalId.empresa.id = :empresaId` |
| `SgUsuarioRepository` | `SgUsuario` | `BaseSucursal` | `u.sucursalId.empresa.id = :empresaId` |
| `InAlmacenDao` | `InAlmacen` | `BaseSucursal` | `a.sucursalId.empresa.id = :empresaId` |
| `InLoteDao` | `InLote` | `BaseSucursal` | `l.sucursalId.empresa.id = :empresaId` |
| `InOrdenEntradaDao` | `InOrdenEntrada` | `BaseSucursal` | `o.sucursalId.empresa.id = :empresaId` |

## Standard Methods Added to All DAOs

All DAOs now implement these two standard methods for multi-tenant filtering:

**For BaseEntity entities:**
```java
// Get all entities for the current empresa
@Query("SELECT e FROM Entity e WHERE e.empresaId = :empresaId")
List<Entity> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

// Get a single entity by ID for the current empresa
@Query("SELECT e FROM Entity e WHERE e.id = :id AND e.empresaId = :empresaId")
Optional<Entity> findByIdAndEmpresaId(@Param("id") Type id, @Param("empresaId") Integer empresaId);
```

**For BaseSucursal entities:**
```java
// Get all entities for the current empresa
@Query("SELECT e FROM Entity e WHERE e.sucursalId.empresa.id = :empresaId")
List<Entity> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

// Get a single entity by ID for the current empresa
@Query("SELECT e FROM Entity e WHERE e.id = :id AND e.sucursalId.empresa.id = :empresaId")
Optional<Entity> findByIdAndEmpresaId(@Param("id") Type id, @Param("empresaId") Integer empresaId);
```

## Key Points

1. **BaseEntity entities**: Use direct `empresaId` column filtering
2. **BaseSucursal entities**: Navigate through `sucursalId.empresa.id` relationship
3. **All queries**: Must filter by empresaId from JWT token via `TenantContext`
4. **No shared data**: Each company only sees their own data - complete data isolation

## Usage in Services

Services extract `empresaId` from JWT token using `TenantContext`:

```java
@Service
public class SomeServiceImpl {
    @Autowired private SomeDao dao;
    @Autowired private TenantContext tenantContext;
    
    public List<Entity> getAll() {
        Integer empresaId = tenantContext.getCurrentEmpresaId();
        return dao.findAllByEmpresaId(empresaId);
    }
}
```

This ensures complete data isolation between companies in the multi-tenant system.

