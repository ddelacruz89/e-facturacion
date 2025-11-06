package com.braintech.eFacturador.services.producto;

import com.braintech.eFacturador.jpa.producto.MgTag;
import java.util.List;

public interface MgTagService {
  List<MgTag> getAll();

  List<MgTag> getAllActive();

  MgTag getById(Integer id);

  MgTag getByNombre(String nombre);

  MgTag create(MgTag tag);

  MgTag update(Integer id, MgTag tag);

  void delete(Integer id);

  // Tag management for products
  void addTagToProduct(Integer productoId, Integer tagId);

  void removeTagFromProduct(Integer productoId, Integer tagId);

  List<MgTag> getTagsByProducto(Integer productoId);
}
