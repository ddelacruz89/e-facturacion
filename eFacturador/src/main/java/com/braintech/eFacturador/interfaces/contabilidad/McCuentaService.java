package com.braintech.eFacturador.interfaces.contabilidad;

import com.braintech.eFacturador.dto.contabilidad.McCuentaNodoDTO;
import com.braintech.eFacturador.dto.contabilidad.McCuentaRequestDTO;
import com.braintech.eFacturador.jpa.contabilidad.McCuenta;
import java.util.List;
import org.springframework.data.domain.Page;

public interface McCuentaService {

  Page<McCuentaNodoDTO> buscarRaices(int page, int size);

  List<McCuentaNodoDTO> buscarHijos(Integer padreId);

  McCuenta getById(Integer id);

  McCuenta create(McCuentaRequestDTO request);

  McCuenta update(Integer id, McCuentaRequestDTO request);

  void disable(Integer id);

  void enable(Integer id);
}
