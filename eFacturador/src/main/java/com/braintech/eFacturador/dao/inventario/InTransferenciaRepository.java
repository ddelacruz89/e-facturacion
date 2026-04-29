package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.jpa.inventario.InTransferencia;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InTransferenciaRepository extends JpaRepository<InTransferencia, Integer> {

  @Query("SELECT t FROM InTransferencia t WHERE t.empresaId = :empresaId")
  List<InTransferencia> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT t FROM InTransferencia t WHERE t.empresaId = :empresaId AND t.estadoId <> 'INA'")
  List<InTransferencia> findAllActiveByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT t FROM InTransferencia t WHERE t.id = :id AND t.empresaId = :empresaId")
  Optional<InTransferencia> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);
}
