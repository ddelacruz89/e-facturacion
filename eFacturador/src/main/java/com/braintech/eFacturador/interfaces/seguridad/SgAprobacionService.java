package com.braintech.eFacturador.interfaces.seguridad;

import com.braintech.eFacturador.dto.seguridad.SgAprobacionResumenDTO;
import com.braintech.eFacturador.dto.seguridad.SgAprobacionSearchCriteria;
import com.braintech.eFacturador.dto.seguridad.SgConfigAprobacionResumenDTO;
import com.braintech.eFacturador.dto.seguridad.SgConfigAprobacionSearchCriteria;
import com.braintech.eFacturador.jpa.seguridad.SgAprobacion;
import com.braintech.eFacturador.jpa.seguridad.SgConfigAprobacion;
import java.util.List;

public interface SgAprobacionService {

  // ── Config ────────────────────────────────────────────────────────────────

  List<SgConfigAprobacionResumenDTO> buscarConfig(SgConfigAprobacionSearchCriteria criteria);

  SgConfigAprobacion getConfigById(Integer id);

  SgConfigAprobacion saveConfig(SgConfigAprobacion config);

  SgConfigAprobacion updateConfig(Integer id, SgConfigAprobacion config);

  void desactivarConfig(Integer id);

  // ── Runtime ───────────────────────────────────────────────────────────────

  /**
   * Crea una solicitud de aprobación para el documento indicado. Resuelve los aprobadores de la
   * config activa (incluyendo manager si aplica).
   *
   * @param tipoDocumento código del tipo (ej. "REQUISICION")
   * @param documentoId PK interna del documento
   * @param solicitanteUsername username del usuario que origina la solicitud
   */
  SgAprobacion crearSolicitud(
      String tipoDocumento, Integer documentoId, String solicitanteUsername);

  /**
   * Registra la respuesta del aprobador actual (extraído de TenantContext).
   *
   * @param aprobacionId id de la SgAprobacion
   * @param decision "APR" | "REC"
   * @param comentario comentario opcional
   */
  SgAprobacion responder(Integer aprobacionId, String decision, String comentario);

  SgAprobacion getById(Integer id);

  List<SgAprobacionResumenDTO> buscar(SgAprobacionSearchCriteria criteria);

  /** Aprobaciones donde el usuario actual tiene pendientes. */
  List<SgAprobacionResumenDTO> getMisPendientes();

  /** Verifica si existe configuración activa para el tipo de documento en el tenant actual. */
  boolean existeConfigActiva(String tipoDocumento);
}
