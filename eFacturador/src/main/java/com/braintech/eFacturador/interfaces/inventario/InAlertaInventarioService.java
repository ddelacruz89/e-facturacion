package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.InAlertaDTO;
import java.util.List;

public interface InAlertaInventarioService {

  /** Alertas activas del tenant del usuario autenticado, con flag visto resuelto por usuario. */
  List<InAlertaDTO> findActivas();

  /** Cantidad de alertas activas que el usuario autenticado aún no ha visto. */
  long contarNoVistas();

  /** Marca una alerta como vista por el usuario autenticado. Idempotente. */
  void marcarVisto(Integer alertaId);

  /** Cierra una alerta (estadoId = 'CER'). Solo debe ejecutarlo un usuario autorizado. */
  void cerrar(Integer alertaId);
}
