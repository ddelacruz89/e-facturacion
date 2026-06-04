package com.braintech.eFacturador.services.producto.impl;

import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.dao.producto.MgPaqueteRepository;
import com.braintech.eFacturador.dto.producto.MgPaqueteResumenDTO;
import com.braintech.eFacturador.dto.producto.MgPaqueteSearchCriteria;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.producto.MgPaquete;
import com.braintech.eFacturador.jpa.producto.MgPaqueteItem;
import com.braintech.eFacturador.services.producto.MgPaqueteService;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class MgPaqueteServiceImpl implements MgPaqueteService {

  private final MgPaqueteRepository paqueteRepository;
  private final SecuenciasDao secuenciasDao;
  private final TenantContext tenantContext;

  @Override
  public List<MgPaqueteResumenDTO> buscar(MgPaqueteSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    // Pasar "" cuando no hay filtro: Hibernate 6 + PostgreSQL no puede inferir el tipo
    // de un parámetro null dentro de CONCAT/LOWER, resultando en bytea.
    String nombre =
        (criteria.getNombre() != null && !criteria.getNombre().isBlank())
            ? criteria.getNombre().trim()
            : "";

    return paqueteRepository.buscar(empresaId, nombre);
  }

  @Override
  public MgPaquete getById(Integer id) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return paqueteRepository
        .findByIdAndEmpresaId(id, empresaId)
        .orElseThrow(() -> new RecordNotFoundException("Paquete no encontrado"));
  }

  @Override
  @Transactional
  public MgPaquete save(MgPaquete paquete) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    String username = tenantContext.getCurrentUsername();
    boolean isUpdate = paquete.getId() != null && paquete.getId() > 0;

    if (isUpdate) {
      MgPaquete existing =
          paqueteRepository
              .findByIdAndEmpresaId(paquete.getId(), empresaId)
              .orElseThrow(() -> new RecordNotFoundException("Paquete no encontrado"));
      // Preservar auditoría original
      paquete.setEmpresaId(existing.getEmpresaId());
      paquete.setUsuarioReg(existing.getUsuarioReg());
      paquete.setFechaReg(existing.getFechaReg());
      paquete.setSecuencia(existing.getSecuencia());
    } else {
      paquete.setEmpresaId(empresaId);
      paquete.setUsuarioReg(username);
      paquete.setFechaReg(LocalDateTime.now());
      if (paquete.getActivo() == null) {
        paquete.setActivo(true);
      }
    }

    // Corregir back-references y auditoría de cada ítem
    if (paquete.getItems() != null) {
      for (MgPaqueteItem item : paquete.getItems()) {
        item.setPaqueteId(paquete);
        if (item.getId() == null || item.getId() == 0) {
          item.setEmpresaId(empresaId);
          item.setUsuarioReg(username);
          item.setFechaReg(LocalDateTime.now());
          if (item.getActivo() == null) {
            item.setActivo(true);
          }
        }
      }
    }

    MgPaquete saved = paqueteRepository.save(paquete);

    // Generar secuencia en creación nueva
    if (!isUpdate && (saved.getSecuencia() == null || saved.getSecuencia() == 0)) {
      int seq =
          secuenciasDao.getNextSecuencia(
              empresaId, MgPaquete.class.getSimpleName().toUpperCase(Locale.ROOT));
      saved.setSecuencia(seq);
      paqueteRepository.save(saved);
    }

    return saved;
  }
}
