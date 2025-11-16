package com.braintech.eFacturador.services.producto.impl;

import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dao.producto.MgProductoRepository;
import com.braintech.eFacturador.dto.producto.MgProductoResumenDTO;
import com.braintech.eFacturador.dto.producto.MgProductoSearchCriteria;
import com.braintech.eFacturador.exceptions.ApplicationException;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.producto.MgProductoUnidadSuplidor;
import com.braintech.eFacturador.services.producto.MgProductoService;
import com.braintech.eFacturador.util.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class MgProductoServiceImpl implements MgProductoService {

  private final MgProductoRepository productoRepository;
  private final SecuenciasDao secuenciasDao;
  private final TenantContext tenantContext;
  @PersistenceContext private EntityManager entityManager;

  @Override
  public List<MgProducto> getAll() {
    return productoRepository.findAll();
  }

  @Override
  public MgProducto getById(Integer id) {
    return productoRepository
        .findById(id)
        .orElseThrow(() -> new RecordNotFoundException("Producto no encontrado"));
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

    producto.setEmpresaId(empresaId);
    producto.setUsuarioReg(username);
    producto.setFechaReg(LocalDateTime.now());
    producto.setActivo(true);

    // Set audit fields for unidad fracciones (MgProductoUnidadSuplidor)
    for (MgProductoUnidadSuplidor unidadSuplidor : producto.getUnidadProductorSuplidor()) {
      unidadSuplidor.setProductoId(producto);
      unidadSuplidor.setEmpresaId(empresaId);
      unidadSuplidor.setUsuarioReg(username);
      unidadSuplidor.setFechaReg(LocalDateTime.now());
      unidadSuplidor.setActivo(true);

      // Set audit fields for productosSuplidores within each unidadSuplidor
      if (unidadSuplidor.getProductosSuplidores() != null) {
        unidadSuplidor
            .getProductosSuplidores()
            .forEach(
                suplidor -> {
                  suplidor.setEmpresaId(empresaId);
                  suplidor.setUsuarioReg(username);
                  suplidor.setFechaReg(LocalDateTime.now());
                  suplidor.setActivo(true);
                });
      }

      // Set audit fields for almacen limites within each unidadSuplidor
      if (unidadSuplidor.getProductosAlmacenesLimites() != null) {
        unidadSuplidor
            .getProductosAlmacenesLimites()
            .forEach(
                limite -> {
                  limite.setEmpresaId(empresaId);
                  limite.setUsuarioReg(username);
                  limite.setFechaReg(LocalDateTime.now());
                  limite.setActivo(true);
                });
      }
    }

    // Set audit fields for producto modulos
    if (producto.getProductosModulos() != null) {
      producto
          .getProductosModulos()
          .forEach(
              modulo -> {
                modulo.setEmpresaId(empresaId);
                modulo.setUsuarioReg(username);
                modulo.setFechaReg(LocalDateTime.now());
                modulo.setActivo(true);
              });
    }

    // Set audit fields for tags
    if (producto.getTags() != null) {
      producto
          .getTags()
          .forEach(
              tag -> {
                tag.setProducto(producto);
                tag.setEmpresaId(empresaId);
                tag.setUsuarioReg(username);
                tag.setFechaReg(LocalDateTime.now());
                tag.setActivo(true);
              });
    }

    // Guardar el producto primero
    MgProducto prod = productoRepository.save(producto);

    // Si la secuencia no fue proporcionada o es 0, generar y actualizar
    if (prod.getSecuencia() == null || prod.getSecuencia() == 0) {
      Integer nuevaSecuencia =
          secuenciasDao.getNextSecuencia(
              empresaId, MgProducto.class.getSimpleName().toUpperCase(Locale.ROOT));
      productoRepository.updateSecuencia(prod.getId(), nuevaSecuencia);
      prod.setSecuencia(nuevaSecuencia);
    }

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

    if (!predicates.isEmpty()) {
      query.where(cb.and(predicates.toArray(new Predicate[0])));
    }
    query.orderBy(cb.asc(product.get("nombreProducto")));
    return entityManager.createQuery(query).getResultList();
  }

  @Override
  public List<MgProductoResumenDTO> searchAdvanced(MgProductoSearchCriteria criteria) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
    CriteriaQuery<MgProductoResumenDTO> query = cb.createQuery(MgProductoResumenDTO.class);
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

    if (!predicates.isEmpty()) {
      query.where(cb.and(predicates.toArray(new Predicate[0])));
    }
    query.select(
        cb.construct(MgProductoResumenDTO.class, product.get("id"), product.get("nombreProducto")));
    query.orderBy(cb.asc(product.get("nombreProducto")));
    return entityManager.createQuery(query).getResultList();
  }
}
