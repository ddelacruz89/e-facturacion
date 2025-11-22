package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.dto.seguridad.SgMenuResumenDTO;
import com.braintech.eFacturador.jpa.seguridad.SgMenu;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SgMenuRepository extends JpaRepository<SgMenu, Integer> {
  // SgMenu extends BaseEntity - no multi-tenant filtering required (system-wide data)

  @Query("SELECT m FROM SgMenu m WHERE m.activo = true ORDER BY m.orden")
  List<SgMenu> findAllActive();

  @Query("SELECT m FROM SgMenu m WHERE m.id = :id")
  Optional<SgMenu> findById(@Param("id") Integer id);

  @Query(
      "SELECT m FROM SgMenu m WHERE m.moduloId.id = :moduloId AND m.activo = true ORDER BY m.orden")
  List<SgMenu> findByModuloIdAndActive(@Param("moduloId") String moduloId);

  @Query(
      "SELECT m FROM SgMenu m WHERE m.tipoMenuId.id = :tipoMenuId AND m.activo = true ORDER BY m.orden")
  List<SgMenu> findByTipoMenuIdAndActive(@Param("tipoMenuId") Integer tipoMenuId);

  @Query(
      "SELECT new com.braintech.eFacturador.dto.seguridad.SgMenuResumenDTO(m.id, m.menu) "
          + "FROM SgMenu m WHERE m.productoAsignable = true AND m.activo = true ORDER BY m.orden")
  List<SgMenuResumenDTO> findMenusAsignablesAProductos();
}
