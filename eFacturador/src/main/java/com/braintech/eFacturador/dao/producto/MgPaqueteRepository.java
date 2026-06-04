package com.braintech.eFacturador.dao.producto;

import com.braintech.eFacturador.dto.producto.MgPaqueteResumenDTO;
import com.braintech.eFacturador.jpa.producto.MgPaquete;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MgPaqueteRepository extends JpaRepository<MgPaquete, Integer> {

  @Query("SELECT p FROM MgPaquete p WHERE p.id = :id AND p.empresaId = :empresaId")
  Optional<MgPaquete> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);

  /**
   * Búsqueda con filtros opcionales. Devuelve resumen liviano para la tabla del modal.
   * cantidadItems cuenta solo los ítems activos.
   */
  @Query(
      """
            SELECT new com.braintech.eFacturador.dto.producto.MgPaqueteResumenDTO(
                p.id,
                p.fechaReg,
                p.nombre,
                p.precioVenta,
                (SELECT COUNT(i) FROM MgPaqueteItem i WHERE i.paqueteId = p AND i.activo = true),
                p.usuarioReg,
                p.activo
            )
            FROM MgPaquete p
            WHERE p.empresaId = :empresaId
              AND (:nombre = '' OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
            ORDER BY p.nombre ASC
            """)
  List<MgPaqueteResumenDTO> buscar(
      @Param("empresaId") Integer empresaId, @Param("nombre") String nombre);
}
