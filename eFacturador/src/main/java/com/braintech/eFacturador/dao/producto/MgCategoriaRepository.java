package com.braintech.eFacturador.dao.producto;

import com.braintech.eFacturador.jpa.producto.MgCategoria;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MgCategoriaRepository extends JpaRepository<MgCategoria, String> {
  // MgCategoria extends BaseEntityEmpresa - filter by empresaId only

  @Query("SELECT c FROM MgCategoria c WHERE c.empresaId = :empresaId")
  List<MgCategoria> findAllByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT c FROM MgCategoria c WHERE c.empresaId = :empresaId AND c.activo = true")
  List<MgCategoria> findAllActiveByEmpresaId(@Param("empresaId") Integer empresaId);

  @Query("SELECT c FROM MgCategoria c WHERE c.id = :id AND c.empresaId = :empresaId")
  Optional<MgCategoria> findByIdAndEmpresaId(
      @Param("id") String id, @Param("empresaId") Integer empresaId);
}
