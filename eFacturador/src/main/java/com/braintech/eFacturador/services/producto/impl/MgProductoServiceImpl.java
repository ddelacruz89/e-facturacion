package com.braintech.eFacturador.services.producto.impl;

import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dao.inventario.InInventarioRepository;
import com.braintech.eFacturador.dao.producto.MgProductoRepository;
import com.braintech.eFacturador.dto.producto.MgProductoCompraDTO;
import com.braintech.eFacturador.dto.producto.MgProductoResumenDTO;
import com.braintech.eFacturador.dto.producto.MgProductoSearchCriteria;
import com.braintech.eFacturador.dto.producto.MgProductoSuplidorCompraDTO;
import com.braintech.eFacturador.dto.producto.MgProductoUnidadSuplidorCompraDTO;
import com.braintech.eFacturador.exceptions.ApplicationException;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.producto.MgProductoUnidadSuplidor;
import com.braintech.eFacturador.jpa.producto.MgProductoUnidadSuplidorLimiteAlmacen;
import com.braintech.eFacturador.jpa.producto.ProductoResumen;
import com.braintech.eFacturador.services.producto.MgProductoService;
import com.braintech.eFacturador.util.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class MgProductoServiceImpl implements MgProductoService {

  private final MgProductoRepository productoRepository;
  private final SecuenciasDao secuenciasDao;
  private final TenantContext tenantContext;
  private final InInventarioRepository inventarioRepository;
  @PersistenceContext private EntityManager entityManager;

  @Override
  public List<MgProducto> getAll() {
    return productoRepository.findAll();
  }

  @Override
  public MgProducto getById(Integer id) {
    MgProducto producto =
        productoRepository
            .findById(id)
            .orElseThrow(() -> new RecordNotFoundException("Producto no encontrado"));
    populateLimitesAlmacen(producto);
    return producto;
  }

  /**
   * Los límites viven en MgProductoUnidadSuplidor.limiteAlmacenes (FK correcto hacia
   * mg_producto_unidad_suplidor). Los aplanamos en producto.productosAlmacenesLimites (@Transient)
   * para que el frontend los reciba/envíe a nivel de producto como antes.
   */
  private void populateLimitesAlmacen(MgProducto producto) {
    if (producto.getUnidadProductorSuplidor() == null) return;
    List<MgProductoUnidadSuplidorLimiteAlmacen> todos =
        producto.getUnidadProductorSuplidor().stream()
            .filter(u -> u.getLimiteAlmacenes() != null)
            .flatMap(u -> u.getLimiteAlmacenes().stream())
            .collect(Collectors.toList());
    producto.setProductosAlmacenesLimites(todos);
  }

  @Override
  public MgProducto getByCodigoBarra(String codigoBarra) {
    return productoRepository
        .findByCodigoBarra(codigoBarra)
        .orElseThrow(() -> new RecordNotFoundException("Producto no encontrado"));
  }

  @Override
  public List<MgProducto> searchByNombre(String nombre) {
    return productoRepository.findByNombreContaining(nombre);
  }

  @Override
  public List<MgProducto> getByCategoria(Integer categoriaId) {
    return productoRepository.findByCategoriaId(categoriaId);
  }

  @Override
  public List<MgProducto> getAllAvailableForSale() {
    return productoRepository.findAllAvailableForSale();
  }

  @Override
  public List<MgProducto> getAllWorkerProducts() {
    return productoRepository.findAllWorkerProducts();
  }

  @Override
  @Transactional
  public MgProducto create(MgProducto producto) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();
    boolean isUpdate = producto.getId() != null && producto.getId() > 0;

    // Si es actualización, verificar que el producto existe y preservar datos de auditoría
    if (isUpdate) {
      MgProducto existing =
          productoRepository
              .findById(producto.getId())
              .orElseThrow(() -> new RecordNotFoundException("Producto no encontrado"));

      // Mantener datos de registro original
      producto.setEmpresaId(existing.getEmpresaId());
      producto.setUsuarioReg(existing.getUsuarioReg());
      producto.setFechaReg(existing.getFechaReg());
      producto.setSecuencia(existing.getSecuencia());
    } else {
      // Es creación nueva
      producto.setEmpresaId(empresaId);
      producto.setUsuarioReg(username);
      producto.setFechaReg(LocalDateTime.now());
      // Solo establecer activo si no viene del frontend
      if (producto.getActivo() == null) {
        producto.setActivo(true);
      }
    }

    // Extraer límites (@Transient) antes de guardar y asignarlos al primer
    // MgProductoUnidadSuplidor, que es el propietario real del FK en DB.
    List<MgProductoUnidadSuplidorLimiteAlmacen> limitesPendientes =
        producto.getProductosAlmacenesLimites() != null
            ? new ArrayList<>(producto.getProductosAlmacenesLimites())
            : new ArrayList<>();
    // El campo @Transient ya no necesita ir al repo; se persiste vía cascade de UnidadSuplidor
    producto.setProductosAlmacenesLimites(null);

    // Set audit fields for unidad fracciones (MgProductoUnidadSuplidor)
    boolean primeraUnidad = true;
    for (MgProductoUnidadSuplidor unidadSuplidor : producto.getUnidadProductorSuplidor()) {
      unidadSuplidor.setProductoId(producto);

      if (unidadSuplidor.getId() == null || unidadSuplidor.getId() == 0) {
        unidadSuplidor.setEmpresaId(empresaId);
        unidadSuplidor.setUsuarioReg(username);
        unidadSuplidor.setFechaReg(LocalDateTime.now());
        if (unidadSuplidor.getActivo() == null) {
          unidadSuplidor.setActivo(true);
        }
      }

      // Set audit fields for productosSuplidores within each unidadSuplidor
      if (unidadSuplidor.getProductosSuplidores() != null) {
        unidadSuplidor
            .getProductosSuplidores()
            .forEach(
                suplidor -> {
                  if (suplidor.getId() == null || suplidor.getId() == 0) {
                    suplidor.setEmpresaId(empresaId);
                    suplidor.setUsuarioReg(username);
                    suplidor.setFechaReg(LocalDateTime.now());
                    if (suplidor.getActivo() == null) {
                      suplidor.setActivo(true);
                    }
                  }
                });
      }

      // Los límites de almacén se asocian al primer UnidadSuplidor (FK real en DB).
      // La alerta usa LIMIT 1 por producto+almacen, así que el índice no importa.
      if (primeraUnidad && !limitesPendientes.isEmpty()) {
        limitesPendientes.forEach(
            limite -> {
              if (limite.getId() == null || limite.getId() == 0) {
                limite.setEmpresaId(empresaId);
                limite.setUsuarioReg(username);
                limite.setFechaReg(LocalDateTime.now());
                if (limite.getActivo() == null) {
                  limite.setActivo(true);
                }
              }
            });
        unidadSuplidor.setLimiteAlmacenes(limitesPendientes);
        primeraUnidad = false;
      }
    }

    // Set audit fields for producto modulos
    if (producto.getProductosModulos() != null) {
      producto
          .getProductosModulos()
          .forEach(
              modulo -> {
                if (modulo.getId() == null || modulo.getId() == 0) {
                  modulo.setEmpresaId(empresaId);
                  modulo.setUsuarioReg(username);
                  modulo.setFechaReg(LocalDateTime.now());
                  // Solo establecer activo si no viene del frontend
                  if (modulo.getActivo() == null) {
                    modulo.setActivo(true);
                  }
                }
              });
    }

    // Set audit fields for tags
    if (producto.getTags() != null) {
      producto
          .getTags()
          .forEach(
              tag -> {
                tag.setProducto(producto);
                if (tag.getId() == null || tag.getId() == 0) {
                  tag.setEmpresaId(empresaId);
                  tag.setUsuarioReg(username);
                  tag.setFechaReg(LocalDateTime.now());
                  // Solo establecer activo si no viene del frontend
                  if (tag.getActivo() == null) {
                    tag.setActivo(true);
                  }
                }
              });
    }

    // Los inventarios son read-only desde el producto; se gestionan por in_movimientos
    producto.setInventarios(null);

    // Guardar el producto
    MgProducto prod = productoRepository.save(producto);

    // Si es creación nueva y la secuencia no fue proporcionada o es 0, generar y actualizar
    if (!isUpdate && (prod.getSecuencia() == null || prod.getSecuencia() == 0)) {
      Integer nuevaSecuencia =
          secuenciasDao.getNextSecuencia(
              empresaId, MgProducto.class.getSimpleName().toUpperCase(Locale.ROOT));
      productoRepository.updateSecuencia(prod.getId(), nuevaSecuencia);
      prod.setSecuencia(nuevaSecuencia);
    }

    // Aplanar límites al nivel de producto para que el frontend los reciba correctamente
    populateLimitesAlmacen(prod);
    return prod;
  }

  @Override
  @Transactional
  public void delete(Integer id) {
    MgProducto existing =
        productoRepository
            .findById(id)
            .orElseThrow(() -> new RecordNotFoundException("Producto no encontrado"));

    // Hard delete (puede cambiar a soft delete si es necesario)
    productoRepository.delete(existing);
  }

  @Override
  public List<MgProducto> searchAdvancedResumen(MgProductoSearchCriteria criteria) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
    CriteriaQuery<MgProducto> query = cb.createQuery(MgProducto.class);
    Root<MgProducto> product = query.from(MgProducto.class);
    List<Predicate> predicates = new ArrayList<>();

    Integer empresaId = tenantContext.getCurrentEmpresaId();
    if (empresaId != null) {
      predicates.add(cb.equal(product.get("empresaId"), empresaId));
    } else throw new ApplicationException("Empresa no encontrada");

    if (criteria.getNombreProducto() != null && !criteria.getNombreProducto().trim().isEmpty()) {
      predicates.add(
          cb.like(
              cb.lower(product.get("nombreProducto")),
              "%" + criteria.getNombreProducto().toLowerCase(Locale.ROOT) + "%"));
    }
    if (criteria.getCodigoBarra() != null && !criteria.getCodigoBarra().trim().isEmpty()) {
      predicates.add(cb.equal(product.get("codigoBarra"), criteria.getCodigoBarra()));
    }
    if (criteria.getDescripcion() != null && !criteria.getDescripcion().trim().isEmpty()) {
      predicates.add(
          cb.like(
              cb.lower(product.get("descripcion")),
              "%" + criteria.getDescripcion().toLowerCase(Locale.ROOT) + "%"));
    }

    query.where(cb.and(predicates.toArray(new Predicate[0])));
    query.orderBy(cb.asc(product.get("nombreProducto")));
    return entityManager.createQuery(query).getResultList();
  }

  @Override
  public Page<MgProductoResumenDTO> searchAdvanced(MgProductoSearchCriteria criteria) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    if (empresaId == null) throw new ApplicationException("Empresa no encontrada");

    int page = criteria.getPage() != null ? criteria.getPage() : 0;
    int size = criteria.getSize() != null ? criteria.getSize() : 30;

    // Count
    CriteriaQuery<Long> countQ = cb.createQuery(Long.class);
    Root<MgProducto> cr = countQ.from(MgProducto.class);
    countQ
        .select(cb.count(cr))
        .where(cb.and(productoPredicates(cb, cr, criteria, empresaId).toArray(new Predicate[0])));
    long total = entityManager.createQuery(countQ).getSingleResult();

    // Data
    CriteriaQuery<MgProductoResumenDTO> q = cb.createQuery(MgProductoResumenDTO.class);
    Root<MgProducto> r = q.from(MgProducto.class);
    q.where(cb.and(productoPredicates(cb, r, criteria, empresaId).toArray(new Predicate[0])));
    q.select(
        cb.construct(
            MgProductoResumenDTO.class, r.get("id"), r.get("nombreProducto"), r.get("precio")));
    q.orderBy(cb.asc(r.get("nombreProducto")));

    List<MgProductoResumenDTO> results =
        entityManager
            .createQuery(q)
            .setFirstResult(page * size)
            .setMaxResults(size)
            .getResultList();

    return new PageImpl<>(results, PageRequest.of(page, size), total);
  }

  private List<Predicate> productoPredicates(
      CriteriaBuilder cb,
      Root<MgProducto> root,
      MgProductoSearchCriteria criteria,
      Integer empresaId) {
    List<Predicate> p = new ArrayList<>();
    p.add(cb.equal(root.get("empresaId"), empresaId));
    if (criteria.getNombreProducto() != null && !criteria.getNombreProducto().isBlank())
      p.add(
          cb.like(
              cb.lower(root.get("nombreProducto")),
              "%" + criteria.getNombreProducto().toLowerCase(Locale.ROOT) + "%"));
    if (criteria.getCodigoBarra() != null && !criteria.getCodigoBarra().isBlank())
      p.add(cb.equal(root.get("codigoBarra"), criteria.getCodigoBarra()));
    if (criteria.getDescripcion() != null && !criteria.getDescripcion().isBlank())
      p.add(
          cb.like(
              cb.lower(root.get("descripcion")),
              "%" + criteria.getDescripcion().toLowerCase(Locale.ROOT) + "%"));
    if (criteria.getCategoriaId() != null)
      p.add(cb.equal(root.get("categoriaId").get("id"), criteria.getCategoriaId()));
    return p;
  }

  @Override
  public Page<MgProductoResumenDTO> searchAdvancedCompra(MgProductoSearchCriteria criteria) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    if (empresaId == null) throw new ApplicationException("Empresa no encontrada");

    int page = criteria.getPage() != null ? criteria.getPage() : 0;
    int size = criteria.getSize() != null ? criteria.getSize() : 30;

    // Count
    CriteriaQuery<Long> countQ = cb.createQuery(Long.class);
    Root<MgProducto> cr = countQ.from(MgProducto.class);
    countQ
        .select(cb.count(cr))
        .where(
            cb.and(
                compraPredicates(cb, cr, countQ, criteria, empresaId).toArray(new Predicate[0])));
    long total = entityManager.createQuery(countQ).getSingleResult();

    // Data
    CriteriaQuery<MgProductoResumenDTO> q = cb.createQuery(MgProductoResumenDTO.class);
    Root<MgProducto> r = q.from(MgProducto.class);
    q.where(cb.and(compraPredicates(cb, r, q, criteria, empresaId).toArray(new Predicate[0])));
    q.select(
        cb.construct(
            MgProductoResumenDTO.class,
            r.get("id"),
            r.get("nombreProducto"),
            r.get("precioVenta")));
    q.orderBy(cb.asc(r.get("nombreProducto")));

    List<MgProductoResumenDTO> results =
        entityManager
            .createQuery(q)
            .setFirstResult(page * size)
            .setMaxResults(size)
            .getResultList();

    return new PageImpl<>(results, PageRequest.of(page, size), total);
  }

  private <T> List<Predicate> compraPredicates(
      CriteriaBuilder cb,
      Root<MgProducto> root,
      CriteriaQuery<T> query,
      MgProductoSearchCriteria criteria,
      Integer empresaId) {
    List<Predicate> p = new ArrayList<>();
    p.add(cb.equal(root.get("empresaId"), empresaId));
    Subquery<Integer> subq = query.subquery(Integer.class);
    Root<MgProductoUnidadSuplidor> uRoot = subq.from(MgProductoUnidadSuplidor.class);
    subq.select(cb.literal(1))
        .where(
            cb.and(
                cb.equal(uRoot.get("productoId"), root),
                cb.equal(uRoot.get("disponibleEnCompra"), true)));
    p.add(cb.exists(subq));
    if (criteria.getNombreProducto() != null && !criteria.getNombreProducto().isBlank())
      p.add(
          cb.like(
              cb.lower(root.get("nombreProducto")),
              "%" + criteria.getNombreProducto().toLowerCase(Locale.ROOT) + "%"));
    if (criteria.getCodigoBarra() != null && !criteria.getCodigoBarra().isBlank())
      p.add(cb.equal(root.get("codigoBarra"), criteria.getCodigoBarra()));
    if (criteria.getId() != null) p.add(cb.equal(root.get("id"), criteria.getId()));
    return p;
  }

  @Override
  public List<MgProductoResumenDTO> getProductosDisponiblesCompraResumen(Integer suplidorId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return productoRepository.findResumenDisponiblesCompraBySuplidorAndEmpresa(
        suplidorId, empresaId);
  }

  @Override
  public MgProductoCompraDTO getProductoCompraDetalle(Integer productoId, Integer suplidorId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    MgProducto p =
        productoRepository
            .findProductoCompraById(productoId, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Producto no encontrado"));

    List<MgProductoUnidadSuplidorCompraDTO> unidades =
        p.getUnidadProductorSuplidor() == null
            ? List.of()
            : p.getUnidadProductorSuplidor().stream()
                .filter(
                    u ->
                        Boolean.TRUE.equals(u.getDisponibleEnCompra())
                            && u.getProductosSuplidores() != null)
                .flatMap(
                    u ->
                        u.getProductosSuplidores().stream()
                            .filter(
                                s ->
                                    s.getSuplidorId() != null
                                        && suplidorId.equals(s.getSuplidorId().getId())
                                        && !"INA".equals(s.getEstadoId()))
                            .map(
                                s ->
                                    new MgProductoUnidadSuplidorCompraDTO(
                                        u.getId(),
                                        u.getUnidadId() != null
                                            ? u.getUnidadId().getNombre()
                                            : null,
                                        u.getUnidadId() != null ? u.getUnidadId().getSigla() : null,
                                        u.getUnidadFraccionId() != null
                                            ? u.getUnidadFraccionId().getNombre()
                                            : null,
                                        u.getUnidadFraccionId() != null
                                            ? u.getUnidadFraccionId().getSigla()
                                            : null,
                                        u.getCantidad(),
                                        new MgProductoSuplidorCompraDTO(
                                            s.getId(),
                                            s.getPrecio(),
                                            s.getItbisDefault(),
                                            s.getEstadoId()))))
                .toList();

    if (unidades.isEmpty()) {
      throw new RecordNotFoundException("Suplidor no asociado a este producto");
    }

    BigDecimal itbis = p.getItbisId() != null ? p.getItbisId().getItbis() : BigDecimal.ZERO;

    return new MgProductoCompraDTO(
        p.getId(), p.getNombreProducto(), p.getPrecio(), itbis, unidades);
  }

  @Override
  public List<MgProductoResumenDTO> searchByAlmacen(Integer almacenId, String nombre) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String nombreParam = (nombre != null && !nombre.trim().isEmpty()) ? nombre.trim() : null;
    return inventarioRepository.findProductosActivosByAlmacen(
        almacenId, empresaId, sucursalId, nombreParam);
  }

  @Override
  public Optional<ProductoResumen> getProductoResumenById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return productoRepository.getResumenProducto(id, empresaId);
  }
}
