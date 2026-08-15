package com.braintech.eFacturador.interfaces.contabilidad;

import com.braintech.eFacturador.dto.contabilidad.McCatalogoCuentaNodoDTO;
import com.braintech.eFacturador.dto.contabilidad.McCatalogoCuentaRequestDTO;
import com.braintech.eFacturador.dto.contabilidad.McCatalogoCuentaSugerenciaDTO;
import com.braintech.eFacturador.jpa.contabilidad.McCatalogoCuenta;
import java.util.List;
import org.springframework.data.domain.Page;

public interface McCatalogoCuentaService {

  Page<McCatalogoCuentaNodoDTO> buscarRaices(int page, int size);

  List<McCatalogoCuentaNodoDTO> buscarHijos(Integer padreId);

  /** Sugiere el código de la próxima sub-cuenta a crear bajo {@code padreId}. */
  McCatalogoCuentaSugerenciaDTO sugerirSubcuenta(Integer padreId);

  McCatalogoCuenta getById(Integer id);

  McCatalogoCuenta create(McCatalogoCuentaRequestDTO request);

  McCatalogoCuenta update(Integer id, McCatalogoCuentaRequestDTO request);

  void disable(Integer id);

  void enable(Integer id);
}
