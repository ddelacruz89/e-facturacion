package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.dto.seguridad.SgRolResumenDTO;
import com.braintech.eFacturador.jpa.seguridad.SgRol;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SgRolRepository extends JpaRepository<SgRol, Integer> {

  @Query(
      """
      SELECT new com.braintech.eFacturador.dto.seguridad.SgRolResumenDTO(
          r.id, r.fechaReg, r.nombre, r.descripcion,
          (SELECT COUNT(p) FROM SgPermiso p WHERE p.rol = r AND p.activo = true
             AND (p.puedeLeer = true OR p.puedeEscribir = true
                  OR p.puedeEliminar = true OR p.puedeImprimir = true)),
          (SELECT COUNT(u) FROM SgUsuarioRol u WHERE u.rol = r AND u.activo = true),
          r.usuarioReg, r.activo)
      FROM SgRol r
      WHERE r.empresaId = :empresaId
        AND (CAST(:nombre AS String) IS NULL OR LOWER(r.nombre) LIKE LOWER(CONCAT('%', CAST(:nombre AS String), '%')))
      ORDER BY r.nombre ASC
      """)
  List<SgRolResumenDTO> buscar(
      @Param("empresaId") Integer empresaId, @Param("nombre") String nombre);

  Optional<SgRol> findByIdAndEmpresaId(Integer id, Integer empresaId);
}
