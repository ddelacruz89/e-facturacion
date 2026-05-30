package com.braintech.eFacturador.interfaces.despacho;

import com.braintech.eFacturador.jpa.despacho.DeTipoVehiculo;
import java.util.List;

public interface DeTipoVehiculoService {
  DeTipoVehiculo save(DeTipoVehiculo tipo);

  DeTipoVehiculo findById(Integer id);

  List<DeTipoVehiculo> findAll();

  List<DeTipoVehiculo> findAllActivos();

  void disableById(Integer id);
}
