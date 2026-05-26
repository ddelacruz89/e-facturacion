package com.braintech.eFacturador.listeners;

import com.braintech.eFacturador.dao.inventario.InRequisicionDao;
import com.braintech.eFacturador.events.AprobacionResueltaEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class InRequisicionAprobacionListener {

  private final InRequisicionDao inRequisicionDao;

  @EventListener
  @Transactional
  public void onAprobacionResuelta(AprobacionResueltaEvent event) {
    if (!"REQUISICION".equals(event.getTipoDocumento())) return;

    inRequisicionDao
        .findById(event.getDocumentoId(), event.getEmpresaId())
        .ifPresent(
            req -> {
              if ("PEN_APR".equals(req.getEstadoId())) {
                req.setEstadoId(event.getNuevoEstado());
                inRequisicionDao.save(req);
                log.info(
                    "Requisicion id={} actualizada a {} tras resolución de aprobación",
                    req.getId(),
                    event.getNuevoEstado());
              }
            });
  }
}
