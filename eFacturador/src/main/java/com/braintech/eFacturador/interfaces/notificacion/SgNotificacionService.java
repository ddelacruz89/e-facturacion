package com.braintech.eFacturador.interfaces.notificacion;

import com.braintech.eFacturador.dto.notificacion.SgNotificacionDTO;
import java.util.List;

public interface SgNotificacionService {

  /** Notificaciones activas del tenant con flag visto resuelto para el usuario autenticado. */
  List<SgNotificacionDTO> findActivas();

  /** Notificaciones activas filtradas por módulo. */
  List<SgNotificacionDTO> findActivasByModulo(String modulo);

  /** Cantidad de notificaciones activas no vistas por el usuario autenticado. */
  long contarNoVistas();

  /** Marca una notificación como vista por el usuario autenticado. Idempotente. */
  void marcarVisto(Integer id);

  /** Cierra una notificación (estadoId = 'CER'). */
  void cerrar(Integer id);
}
