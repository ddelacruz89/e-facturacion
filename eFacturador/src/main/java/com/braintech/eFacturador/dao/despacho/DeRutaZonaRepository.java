package com.braintech.eFacturador.dao.despacho;

import com.braintech.eFacturador.jpa.despacho.DeRutaZona;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeRutaZonaRepository extends JpaRepository<DeRutaZona, Integer> {

  List<DeRutaZona> findByRutaId(Integer rutaId);

  void deleteByRutaId(Integer rutaId);
}
