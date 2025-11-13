package com.braintech.eFacturador.services.producto.impl;

import com.braintech.eFacturador.dao.producto.MgProductoRepository;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.producto.MgProductoUnidadSuplidor;
import com.braintech.eFacturador.services.producto.MgProductoService;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MgProductoServiceImpl implements MgProductoService {

  @Autowired private MgProductoRepository productoRepository;

  @Autowired private TenantContext tenantContext;

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

    return productoRepository.save(producto);
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
}
