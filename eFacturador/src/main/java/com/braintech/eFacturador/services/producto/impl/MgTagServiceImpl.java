package com.braintech.eFacturador.services.producto.impl;

import com.braintech.eFacturador.dao.producto.MgProductoRepository;
import com.braintech.eFacturador.dao.producto.MgProductoTagRepository;
import com.braintech.eFacturador.dao.producto.MgTagRepository;
import com.braintech.eFacturador.dto.TagResumeDto;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.producto.MgProductoTag;
import com.braintech.eFacturador.jpa.producto.MgTag;
import com.braintech.eFacturador.services.producto.MgTagService;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MgTagServiceImpl implements MgTagService {

  @Autowired private MgTagRepository tagRepository;

  @Autowired private MgProductoTagRepository productoTagRepository;

  @Autowired private MgProductoRepository productoRepository;

  @Autowired private TenantContext tenantContext;

  @Override
  public List<MgTag> getAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return tagRepository.findAllByEmpresaId(empresaId);
  }

  @Override
  public List<TagResumeDto> getTagResumes() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return tagRepository.findResumeByEmpresaId(empresaId);
  }

  @Override
  public List<MgTag> getAllActive() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return tagRepository.findAllActiveByEmpresaId(empresaId);
  }

  @Override
  public MgTag getById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return tagRepository
        .findByIdAndEmpresaId(id, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Etiqueta no encontrada"));
  }

  @Override
  public MgTag getByNombre(String nombre) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return tagRepository
        .findByNombreAndEmpresaId(nombre, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Etiqueta no encontrada"));
  }

  @Override
  @Transactional
  public MgTag create(MgTag tag) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    tag.setEmpresaId(empresaId);
    tag.setUsuarioReg(username);
    tag.setFechaReg(LocalDateTime.now());
    tag.setActivo(true);

    return tagRepository.save(tag);
  }

  @Override
  @Transactional
  public MgTag update(Integer id, MgTag tag) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    MgTag existing =
        tagRepository
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Etiqueta no encontrada"));

    // Update fields
    tag.setId(id);
    tag.setEmpresaId(empresaId);
    tag.setUsuarioReg(existing.getUsuarioReg());
    tag.setFechaReg(existing.getFechaReg());

    return tagRepository.save(tag);
  }

  @Override
  @Transactional
  public void delete(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    MgTag existing =
        tagRepository
            .findByIdAndEmpresaId(id, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Etiqueta no encontrada"));

    // Soft delete - set activo to false
    existing.setActivo(false);
    tagRepository.save(existing);
  }

  @Override
  @Transactional
  public void addTagToProduct(Integer productoId, Integer tagId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();

    // Check if already exists
    if (productoTagRepository.existsByProductoIdAndTagIdAndEmpresaId(
        productoId, tagId, empresaId)) {
      throw new IllegalStateException("La etiqueta ya está asociada a este producto");
    }

    // Verify producto exists
    MgProducto producto =
        productoRepository
            .findById(productoId)
            .orElseThrow(() -> new RecordNotFoundException("Producto no encontrado"));

    // Verify tag exists
    MgTag tag =
        tagRepository
            .findByIdAndEmpresaId(tagId, empresaId)
            .orElseThrow(() -> new RecordNotFoundException("Etiqueta no encontrada"));

    // Create association
    MgProductoTag productoTag = new MgProductoTag();
    productoTag.setProducto(producto);
    productoTag.setTag(tag);
    productoTag.setEmpresaId(empresaId);
    productoTag.setUsuarioReg(username);
    productoTag.setFechaReg(LocalDateTime.now());
    productoTag.setActivo(true);

    productoTagRepository.save(productoTag);
  }

  @Override
  @Transactional
  public void removeTagFromProduct(Integer productoId, Integer tagId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    List<MgProductoTag> productoTags =
        productoTagRepository.findByProductoIdAndEmpresaId(productoId, empresaId);

    MgProductoTag productoTag =
        productoTags.stream()
            .filter(pt -> pt.getTag().getId().equals(tagId))
            .findFirst()
            .orElseThrow(
                () -> new RecordNotFoundException("Asociación producto-etiqueta no encontrada"));

    // Soft delete
    productoTag.setActivo(false);
    productoTagRepository.save(productoTag);
  }

  @Override
  public List<MgTag> getTagsByProducto(Integer productoId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    List<MgProductoTag> productoTags =
        productoTagRepository.findByProductoIdAndEmpresaId(productoId, empresaId);

    return productoTags.stream().map(MgProductoTag::getTag).collect(Collectors.toList());
  }
}
