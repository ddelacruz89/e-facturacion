package com.braintech.eFacturador.interfaces.despacho;

import com.braintech.eFacturador.dto.despacho.DePrecioEnvioDTO;
import java.math.BigDecimal;
import java.util.List;

public interface DePrecioEnvioService {

  /** Todos los precios configurados para los barrios de un municipio (del tenant actual). */
  List<DePrecioEnvioDTO> getPorMunicipio(Integer municipioId);

  /** Precio del barrio + sub-barrios configurados (del tenant actual). */
  List<DePrecioEnvioDTO> getPorBarrio(Integer barrioId);

  /** Crea o actualiza el precio base del barrio (aplica a sub-barrios sin precio propio). */
  DePrecioEnvioDTO upsertBarrio(Integer barrioId, BigDecimal precio);

  /** Crea o actualiza el precio específico de un sub-barrio. */
  DePrecioEnvioDTO upsertSubBarrio(Integer subBarrioId, BigDecimal precio);

  /** Elimina el precio del barrio (no afecta precios de sub-barrios). */
  void deleteBarrio(Integer barrioId);

  /** Elimina el precio específico del sub-barrio (quedará con el precio del barrio). */
  void deleteSubBarrio(Integer subBarrioId);
}
