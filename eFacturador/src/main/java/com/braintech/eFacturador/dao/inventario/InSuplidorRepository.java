package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.jpa.inventario.InSuplidor;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InSuplidorRepository extends JpaRepository<InSuplidor, Integer> {

  @Query("SELECT s FROM InSuplidor s WHERE s.empresaId = :empresaId")
  List<InSuplidor> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT s FROM InSuplidor s WHERE s.empresaId = :empresaId AND s.activo = true")
  List<InSuplidor> findAllActiveByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT s FROM InSuplidor s WHERE s.id = :id AND s.empresaId = :empresaId")
  Optional<InSuplidor> findByIdAndEmpresaId(
      @Param("id") Integer id, @Param("empresaId") Integer empresaId);

  @Query("SELECT s FROM InSuplidor s WHERE s.rnc = :rnc AND s.empresaId = :empresaId")
  Optional<InSuplidor> findByRncAndEmpresaId(
      @Param("rnc") String rnc, @Param("empresaId") Integer empresaId);
}
