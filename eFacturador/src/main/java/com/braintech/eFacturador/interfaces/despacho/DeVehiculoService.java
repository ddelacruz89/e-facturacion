package com.braintech.eFacturador.interfaces.despacho;

import com.braintech.eFacturador.jpa.despacho.DeVehiculo;
import java.util.List;

public interface DeVehiculoService {
  DeVehiculo save(DeVehiculo vehiculo);

  DeVehiculo findById(Integer id);

  List<DeVehiculo> findAll();

  List<DeVehiculo> findAllActivos();

  void disableById(Integer id);
}
