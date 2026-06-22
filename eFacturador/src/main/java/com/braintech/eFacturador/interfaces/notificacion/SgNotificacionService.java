package com.braintech.eFacturador.interfaces.notificacion;

import com.braintech.eFacturador.dto.notificacion.SgNotificacionDTO;
import com.braintech.eFacturador.dto.notificacion.SgNotificacionTipoConfigDTO;
import com.braintech.eFacturador.dto.notificacion.SgNotificacionTipoConfigPatchDTO;
import java.util.List;
import java.util.Set;

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

  /**
   * Notificaciones pendientes de leer al iniciar sesión: para_login=true, activas, no vistas por el
   * usuario y cuyo tipo está suscrito por el usuario.
   */
  List<SgNotificacionDTO> findLoginPendientes();

  /** Catálogo de tipos activos con flag suscrito resuelto para el usuario dado. */
  List<SgNotificacionTipoConfigDTO> getTiposConSuscripcion(String username);

  /** Actualiza la suscripción del usuario: reemplaza los tipos suscritos por la lista recibida. */
  void saveSuscripciones(String username, Set<String> tipoIds);

  /** Actualiza paraLogin y/o activo de un tipo de notificación (admin). */
  void patchTipoConfig(String tipoId, SgNotificacionTipoConfigPatchDTO patch);

  /** Crea una notificación desde la app de management. Acepta destinatarios opcionales. */
  SgNotificacionDTO crear(SgNotificacionDTO dto);

  /** Lista los destinatarios específicos de una notificación. */
  List<String> getDestinatarios(Integer notificacionId);

  /** Agrega un destinatario a una notificación. Idempotente. */
  void addDestinatario(Integer notificacionId, String username);

  /** Elimina un destinatario de una notificación. */
  void removeDestinatario(Integer notificacionId, String username);
}
