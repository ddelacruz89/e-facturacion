package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dao.inventario.InRequisicionDao;
import com.braintech.eFacturador.dao.notificacion.SgNotificacionRepository;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.inventario.InRequisicionResumenDTO;
import com.braintech.eFacturador.dto.inventario.InRequisicionSearchCriteria;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InRequisicionService;
import com.braintech.eFacturador.jpa.inventario.InRequisicion;
import com.braintech.eFacturador.jpa.inventario.InRequisicionDetalle;
import com.braintech.eFacturador.jpa.notificacion.SgNotificacion;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.sse.InAlertaSseService;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class InRequisicionServiceImpl implements InRequisicionService {

  private final InRequisicionDao inRequisicionDao;
  private final SgSucursalRepository sgSucursalRepository;
  private final SecuenciasDao secuenciasDao;
  private final SgNotificacionRepository notificacionRepository;
  private final InAlertaSseService sseService;
  private final TenantContext tenantContext;

  @Override
  @Transactional
  public InRequisicion save(InRequisicion requisicion) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();

    SgSucursal sucursal =
        sgSucursalRepository
            .findById(sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Sucursal no encontrada"));

    boolean isNew = requisicion.getId() == null;

    requisicion.setEmpresaId(empresaId);
    requisicion.setSucursalId(sucursal);

    if (isNew) {
      requisicion.setFechaReg(LocalDateTime.now());
      requisicion.setUsuarioReg(username);
      requisicion.setEstadoId("PEN");
    }

    fixEntityGraph(requisicion);

    InRequisicion saved = inRequisicionDao.save(requisicion);

    if (isNew) {
      int seq =
          secuenciasDao.getNextSecuencia(
              empresaId, InRequisicion.class.getSimpleName().toUpperCase(Locale.ROOT));
      saved.setSecuencia(seq);
      saved = inRequisicionDao.save(saved);

      notificarNuevaRequisicion(saved, username);
    }

    return saved;
  }

  private void notificarNuevaRequisicion(InRequisicion requisicion, String username) {
    SgNotificacion notif = new SgNotificacion();
    notif.setEmpresaId(requisicion.getEmpresaId());
    notif.setSucursalId(requisicion.getSucursalId().getId());
    notif.setModulo("INVENTARIO");
    notif.setTipo("REQUISICION_PENDIENTE");
    notif.setTitulo("Nueva requisición #" + requisicion.getSecuencia() + " pendiente");
    notif.setDescripcion(
        "El usuario "
            + username
            + " creó la requisición #"
            + requisicion.getSecuencia()
            + " — almacén solicitante: #"
            + requisicion.getAlmacenSolicitanteId()
            + ", almacén origen: #"
            + requisicion.getAlmacenOrigenId()
            + ". Prioridad: "
            + requisicion.getPrioridad());
    notif.setReferenciaId(requisicion.getId());
    notif.setReferenciaTipo("InRequisicion");
    notif.setReferenciaKey("requisicion:" + requisicion.getId());
    notif.setPayload(
        Map.of(
            "requisicionId", requisicion.getId(),
            "secuencia", requisicion.getSecuencia(),
            "almacenSolicitanteId", requisicion.getAlmacenSolicitanteId(),
            "almacenOrigenId", requisicion.getAlmacenOrigenId(),
            "prioridad", requisicion.getPrioridad()));
    notif.setMenuUrlOrigen("/transferencias");
    notif.setEstadoId("ACT");
    notif.setFechaReg(LocalDateTime.now());
    notif.setUsuarioReg(username);
    notificacionRepository.save(notif);
    sseService.push(requisicion.getEmpresaId(), requisicion.getSucursalId().getId());
  }

  @Override
  public InRequisicion findById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inRequisicionDao.findById(id, empresaId).orElse(null);
  }

  @Override
  public List<InRequisicion> findAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inRequisicionDao.findAll(empresaId);
  }

  @Override
  @Transactional
  public void disableById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    inRequisicionDao.disableById(id, empresaId);
  }

  @Override
  public Page<InRequisicionResumenDTO> searchByCriteria(InRequisicionSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return inRequisicionDao.searchByCriteria(criteria, empresaId);
  }

  private void fixEntityGraph(InRequisicion requisicion) {
    List<InRequisicionDetalle> detalles = requisicion.getDetalles();
    if (detalles == null) return;
    for (InRequisicionDetalle detalle : detalles) {
      detalle.setRequisicionId(requisicion);
    }
  }
}
