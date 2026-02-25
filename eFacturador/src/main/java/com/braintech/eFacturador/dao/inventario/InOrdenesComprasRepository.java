package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InOrdenesComprasSimpleDTO;
import com.braintech.eFacturador.jpa.inventario.InOrdenesCompras;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InOrdenesComprasRepository extends JpaRepository<InOrdenesCompras, Integer> {

  @Query("SELECT o FROM InOrdenesCompras o WHERE o.suplidorId.empresaId = :empresaId")
  List<InOrdenesCompras> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query(
      "SELECT o FROM InOrdenesCompras o WHERE o.suplidorId.empresaId = :empresaId AND o.estadoId <> 'INA'")
  List<InOrdenesCompras> findAllActiveByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query(
      "SELECT o FROM InOrdenesCompras o WHERE o.id = :id AND o.suplidorId.empresaId = :empresaId")
  Optional<InOrdenesCompras> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);

  @Query(
      "SELECT new com.braintech.eFacturador.dto.inventario.InOrdenesComprasSimpleDTO("
          + "o.id, o.suplidorId.nombre, o.total, o.estadoId, o.fechaReg) "
          + "FROM InOrdenesCompras o WHERE o.suplidorId.empresaId = :empresaId AND o.estadoId <> 'INA'")
  List<InOrdenesComprasSimpleDTO> findAllActiveSimpleByEmpresaId(
      @Param("empresaId") Integer empresaId);
}
