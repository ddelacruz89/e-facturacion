package com.braintech.eFacturador.dao.despacho;

import com.braintech.eFacturador.dto.despacho.DePrecioEnvioDTO;
import com.braintech.eFacturador.jpa.despacho.DePrecioEnvio;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DePrecioEnvioRepository extends JpaRepository<DePrecioEnvio, Integer> {

  Optional<DePrecioEnvio> findByEmpresaIdAndBarrioIdAndSubBarrioIdIsNull(
      Integer empresaId, Integer barrioId);

  Optional<DePrecioEnvio> findByEmpresaIdAndSubBarrioId(Integer empresaId, Integer subBarrioId);

  @Query(
      """
      SELECT new com.braintech.eFacturador.dto.despacho.DePrecioEnvioDTO(
          p.id, p.barrioId,
          (SELECT b.nombre FROM MgBarrioParaje b WHERE b.id = p.barrioId),
          p.subBarrioId,
          (SELECT s.nombre FROM MgSubBarrio s WHERE s.id = p.subBarrioId),
          p.precio)
      FROM DePrecioEnvio p
      WHERE p.empresaId = :empresaId AND p.barrioId IN :barrioIds
      ORDER BY p.barrioId ASC, p.subBarrioId ASC NULLS FIRST
      """)
  List<DePrecioEnvioDTO> findDTOsByEmpresaIdAndBarrioIdIn(
      @Param("empresaId") Integer empresaId, @Param("barrioIds") Collection<Integer> barrioIds);

  @Query(
      """
      SELECT new com.braintech.eFacturador.dto.despacho.DePrecioEnvioDTO(
          p.id, p.barrioId,
          (SELECT b.nombre FROM MgBarrioParaje b WHERE b.id = p.barrioId),
          p.subBarrioId,
          (SELECT s.nombre FROM MgSubBarrio s WHERE s.id = p.subBarrioId),
          p.precio)
      FROM DePrecioEnvio p
      WHERE p.empresaId = :empresaId AND p.barrioId = :barrioId
      ORDER BY p.subBarrioId ASC NULLS FIRST
      """)
  List<DePrecioEnvioDTO> findDTOsByEmpresaIdAndBarrioId(
      @Param("empresaId") Integer empresaId, @Param("barrioId") Integer barrioId);
}
