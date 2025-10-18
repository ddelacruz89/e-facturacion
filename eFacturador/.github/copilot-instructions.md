# GitHub Copilot Instructions for eFacturador

## Project Overview
This is a multi-tenant Spring Boot application for electronic invoicing (e-Facturación) in Dominican Republic.

## Architecture Principles

### Multi-Tenancy
- Use `TenantContext` utility to extract `empresaId`, `sucursalId`, and `username` from JWT
- **CRITICAL**: Entities have different filtering requirements based on their base class:
  - **Entities extending BaseEntity**: No empresa/sucursal reference → No multi-tenant filtering (system-wide data), never filter by null values
  - **Entities extending BaseEntityEmpresa**: Have `empresaId` (Integer) only → Filter by `empresaId` only never filter by null values
  - **Entities extending BaseSucursal**: Have both `empresaId` (Integer) and `sucursalId` (SgSucursal) → Filter by `empresaId` AND `sucursalId`, never filter by null values
- **Before writing a query, check the entity's base class to determine correct filtering**
- Never use `findAll()` or `findById()` on BaseEntityEmpresa or BaseSucursal entities without multi-tenant filtering

### Entity Base Classes

**BaseEntity**: Contains `usuarioReg`, `fechaReg`, `activo` fields (NO empresa/sucursal)
- Use for system-wide data (no multi-tenant filtering)
- Examples: System configurations, global catalogs
- No filtering required

**BaseEntityEmpresa**: Contains `usuarioReg`, `fechaReg`, `activo`, and `empresaId` (Integer) fields
- Use for company-level catalog/configuration entities
- Filter queries: `WHERE e.empresaId = :empresaId`

**BaseSucursal**: Contains `usuarioReg`, `fechaReg`, `estadoId`, `empresaId` (Integer), and `sucursalId` (SgSucursal relationship)
- Use for transactional entities tied to specific branch/sucursal
- Filter queries: `WHERE e.empresaId = :empresaId AND e.sucursalId.id = :sucursalId`

### Repository Pattern
Repositories must include appropriate query methods based on the entity's base class:

For filtering, for find single records, if not found return exception RecordNotFoundException witch spanish message: Record no encontrado.

**For BaseEntity entities (system-wide, no filtering):**
```java
// Use standard JpaRepository methods - no filtering needed
List<Entity> findAll();
Optional<Entity> findById(Type id);
```

**For BaseEntityEmpresa entities (filter by empresaId only):**
```java
@Query("SELECT e FROM Entity e WHERE e.empresaId = :empresaId")
List<Entity> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

@Query("SELECT e FROM Entity e WHERE e.id = :id AND e.empresaId = :empresaId")
Optional<Entity> findByIdAndEmpresaId(@Param("id") Type id, @Param("empresaId") Integer empresaId);
```

**For BaseSucursal entities (filter by empresaId AND sucursalId):**
```java
@Query("SELECT e FROM Entity e WHERE e.empresaId = :empresaId")
List<Entity> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

@Query("SELECT e FROM Entity e WHERE e.empresaId = :empresaId AND e.sucursalId.id = :sucursalId")
List<Entity> findAllByEmpresaIdAndSucursalId(@Param("empresaId") Integer empresaId, @Param("sucursalId") Integer sucursalId);

@Query("SELECT e FROM Entity e WHERE e.id = :id AND e.empresaId = :empresaId")
Optional<Entity> findByIdAndEmpresaId(@Param("id") Type id, @Param("empresaId") Integer empresaId);

@Query("SELECT e FROM Entity e WHERE e.id = :id AND e.empresaId = :empresaId AND e.sucursalId.id = :sucursalId")
Optional<Entity> findByIdAndEmpresaIdAndSucursalId(@Param("id") Type id, @Param("empresaId") Integer empresaId, @Param("sucursalId") Integer sucursalId);
```

### Service Pattern
Service implementations must follow these patterns based on the entity's base class:

**For BaseEntity entities (no filtering):**
```java
@Service
public class EntityServiceImpl implements EntityService {
    @Autowired private EntityRepository repository;

    @Override
    public List<Entity> getAll() {
        return repository.findAll();
    }
fica}
```

**For BaseEntityEmpresa entities (filter by empresaId):**
```java
@Service
public class EntityServiceImpl implements EntityService {
    @Autowired private EntityRepository repository;
    @Autowired private TenantContext tenantContext;

    @Override
    public List<Entity> getAll() {
        Integer empresaId = tenantContext.getCurrentEmpresaId();
        return repository.findAllByEmpresaId(empresaId);
    }

    @Override
    public Entity create(Entity entity) {
        Integer empresaId = tenantContext.getCurrentEmpresaId();
        String username = tenantContext.getCurrentUsername();
        
        entity.setEmpresaId(empresaId);
        entity.setUsuarioReg(username);
        entity.setFechaReg(LocalDateTime.now());
        
        return repository.save(entity);
    }
    
    @Override
    public Entity update(Type id, Entity entity) {
        Integer empresaId = tenantContext.getCurrentEmpresaId();
```java
@Service
public class EntityServiceImpl implements EntityService {
    @Autowired private EntityRepository repository;
    @Autowired private TenantContext tenantContext;

    @Override
    public List<Entity> getAll() {
        Integer empresaId = tenantContext.getCurrentEmpresaId();
        Integer sucursalId = tenantContext.getCurrentSucursalId();
        return repository.findAllByEmpresaIdAndSucursalId(empresaId, sucursalId);
    }
    
    @Override
    public Entity getById(Type id) {
        Integer empresaId = tenantContext.getCurrentEmpresaId();
        Integer sucursalId = tenantContext.getCurrentSucursalId();
        return repository.findByIdAndEmpresaIdAndSucursalId(id, empresaId, sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));
    }

    @Override
    public Entity create(Entity entity) {
        Integer empresaId = tenantContext.getCurrentEmpresaId();
        Integer sucursalId = tenantContext.getCurrentSucursalId();
    }
    
    @Override
    public Entity update(Type id, Entity entity) {
        Integer empresaId = tenantContext.getCurrentEmpresaId();
        Integer sucursalId = tenantContext.getCurrentSucursalId();
        Entity existing = repository.findByIdAndEmpresaIdAndSucursalId(id, empresaId, sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Registro no encontrado"));
        
        // Update fields
        entity.setId(id);
        entity.setEmpresaId(empresaId);
        entity.setSucursalId(sucursalId);
        
        return repository.save(entity);
    }
}
```

### Exception Handling
- **For find operations**: If record is not found, throw `RecordNotFoundException` with Spanish message: "Registro no encontrado"
- **Never return null**: Use `.orElseThrow()` instead of `.orElse(null)` for single record queries
- **Validate tenant access**: Always verify empresaId (and sucursalId for BaseSucursal) before operations

### Controller Pattern
Controllers must follow these patterns based on the entity type:

**For BaseEntity entities (system-wide, no filtering):**
```java
@RestController
@RequestMapping("/api/v1/[schema]/[resource]")
public class EntityController {
    @Autowired private EntityService service;
    
    @GetMapping
    public List<Entity> getAll() {
        return service.getAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Entity> getById(@PathVariable Type id) {
        Entity entity = service.getById(id);
        return ResponseEntity.ok(entity);
    }
    
    @PostMapping
    public ResponseEntity<Entity> create(@RequestBody Entity entity) {
        Entity saved = service.create(entity);
        return ResponseEntity.ok(saved);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Entity> update(@PathVariable Type id, @RequestBody Entity entity) {
        Entity updated = service.update(id, entity);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Type id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

**For BaseEntityEmpresa entities (catalog, filter by empresaId):**
```java
@RestController
@RequestMapping("/api/v1/[schema]/[resource]")
public class EntityController {
    @Autowired private EntityService service;
    
    @GetMapping
    public List<Entity> getAll() {
        return service.getAll(); // Filters by empresaId from JWT
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Entity> getById(@PathVariable Type id) {
        Entity entity = service.getById(id);
        return ResponseEntity.ok(entity);
    }
    
    @PostMapping
    public ResponseEntity<Entity> create(@RequestBody Entity entity) {
        Entity saved = service.create(entity);
        return ResponseEntity.ok(saved);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Entity> update(@PathVariable Type id, @RequestBody Entity entity) {
        Entity updated = service.update(id, entity);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Type id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

**For BaseSucursal entities (transactional, filter by empresaId AND sucursalId):**
```java
@RestController
@RequestMapping("/api/v1/[schema]/[resource]")
public class EntityController {
    @Autowired private EntityService service;
    
    // Get all active records (estadoId = 'ACT')
    @GetMapping
    public List<Entity> getAll() {
        return service.getAllActive(); // Filters by empresaId, sucursalId and estadoId = 'ACT'
    }
    
    // Get all records including inactive
    @GetMapping("/all")
    public List<Entity> getAllIncludingInactive() {
        return service.getAll(); // Filters by empresaId and sucursalId only
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Entity> getById(@PathVariable Type id) {
        Entity entity = service.getById(id);
        return ResponseEntity.ok(entity);
    }
    
    @PostMapping
    public ResponseEntity<Entity> create(@RequestBody Entity entity) {
        Entity saved = service.create(entity);
        return ResponseEntity.ok(saved);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Entity> update(@PathVariable Type id, @RequestBody Entity entity) {
        Entity updated = service.update(id, entity);
        return ResponseEntity.ok(updated);
    }
    
    // Soft delete - changes estadoId to 'INA'
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> disable(@PathVariable Type id) {
        service.disable(id); // Sets estadoId = 'INA'
        return ResponseEntity.noContent().build();
    }
}
```

### Controller Rules
1. **Never accept empresaId or sucursalId as parameters** - They come from JWT via TenantContext
2. **Use proper HTTP methods**: GET (query), POST (create), PUT (update), DELETE (disable for transactional)
3. **Return appropriate status codes**:
   - 200 OK - Successful GET, PUT
   - 204 No Content - Successful DELETE
   - 404 Not Found - Handled automatically by RecordNotFoundException
4. **For transactional entities (BaseSucursal)**: 
   - Default `GET /` returns only active records (estadoId = 'ACT')
   - `GET /all` returns all records including inactive
   - `DELETE /{id}` performs soft delete (estadoId = 'INA')
   - Never implement hard delete endpoints

### Soft Delete Pattern
├── services/[schema]/impl/  # Service implementations
├── dao/               # Data Access Objects (repositories)
│   └── [schema]/
├── jpa/               # JPA Entities
│   ├── SuperClass/    # Base entities
│   ├── inventario/
│   ├── producto/
│   ├── facturacion/
│   └── seguridad/
├── seguridad/         # Security (JWT, Auth)
└── util/              # Utilities (TenantContext, JwtUtil)
```

- `contabilidad`: Accounting

### Naming Conventions
- Entities: Use schema prefix (e.g., `InAlmacen`, `MgCategoria`, `SgUsuario`, `MfFactura`)
  - `In`: Inventario
  - `Mg`: Maestro/General (catalog)
  - `Sg`: Seguridad
  - `Mf`: Facturación
  - `Mc`: Contabilidad
- Tables: Snake case with schema prefix (e.g., `in_almacenes`, `mg_categoria`, `sg_usuario`)
- Columns: Snake case (e.g., `empresa_id`, `usuario_reg`, `fecha_reg`)

### JWT Token Structure
```json
{
  "sub": "username",
  "empresaId": 1,
  "sucursalId": 3,
  "iat": 1760790910,
  "exp": 1760877310
}
```

### Security Configuration
- JWT-based authentication
- Token secret in `application.properties`: `jwt.secret`
- CORS enabled for frontend (localhost:3000)
- Most endpoints require authentication except `/api/auth/**`

### Code Quality
- Use Lombok annotations: `@Data`, `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`
- Add `@EqualsAndHashCode(callSuper=false)` when extending base classes
- Add `serialVersionUID` to all entities
- Use `@Transactional` for write operations
- Use SpotBugs exclusions when necessary

### Response Pattern
Services should return data directly or use a `Response<T>` wrapper:
```java
public class Response<T> {
    private String status;
    private T content;
    private String error;
}
```

### Important Rules
1. **ALWAYS filter by empresaId for BaseEntityEmpresa** - Data isolation is critical
2. **ALWAYS filter by empresaId AND sucursalId for BaseSucursal** - Branch-level isolation
3. **Never use hard deletes** - Use soft delete with `estadoId = "INA"`
4. **Always set audit fields** - `usuarioReg`, `fechaReg`, `empresaId` (and `sucursalId` for BaseSucursal)
5. **Use TenantContext** - Don't pass empresaId/sucursalId as controller parameters
6. **Validate tenant access** - Ensure users only access their empresa/sucursal data

### Common Mistakes to Avoid
- ❌ Using `repository.findAll()` on BaseEntityEmpresa or BaseSucursal entities without filtering
- ❌ Filtering by `usuarioReg` instead of `empresaId`
- ❌ Not injecting `TenantContext` in services for BaseEntityEmpresa or BaseSucursal entities
- ❌ Hard deleting transactional records
- ❌ Missing `empresaId` validation in queries for BaseEntityEmpresa entities
- ❌ Missing `empresaId` AND `sucursalId` validation in queries for BaseSucursal entities
- ❌ Exposing `empresaId` or `sucursalId` as URL parameters (should come from JWT)
- ❌ Confusing which base class an entity extends when writing queries

### Testing
- **BaseEntity entities**: Test that data is accessible to all users (system-wide)
- **BaseEntityEmpresa entities**: 
  - Test with different empresaId values
  - Verify data isolation between companies
- **BaseSucursal entities**: 
  - Test with different empresaId and sucursalId combinations
  - Verify data isolation between companies AND branches
  - Ensure users can only access data from their assigned sucursal
