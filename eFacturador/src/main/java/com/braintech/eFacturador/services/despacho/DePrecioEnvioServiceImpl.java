package com.braintech.eFacturador.services.despacho;

import com.braintech.eFacturador.dao.despacho.DePrecioEnvioRepository;
import com.braintech.eFacturador.dao.general.MgBarrioParajeDao;
import com.braintech.eFacturador.dao.general.MgSubBarrioRepository;
import com.braintech.eFacturador.dto.despacho.DePrecioEnvioDTO;
import com.braintech.eFacturador.dto.general.MgBarrioParajeResumenDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.despacho.DePrecioEnvioService;
import com.braintech.eFacturador.jpa.despacho.DePrecioEnvio;
import com.braintech.eFacturador.jpa.general.MgSubBarrio;
import com.braintech.eFacturador.util.TenantContext;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class DePrecioEnvioServiceImpl implements DePrecioEnvioService {

  private final DePrecioEnvioRepository repository;
  private final MgBarrioParajeDao barrioParajeDao;
  private final MgSubBarrioRepository subBarrioRepository;
  private final TenantContext tenantContext;

  @Override
  public List<DePrecioEnvioDTO> getPorMunicipio(Integer municipioId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    List<MgBarrioParajeResumenDTO> barrios = barrioParajeDao.findByMunicipio(municipioId);
    if (barrios.isEmpty()) return List.of();
    List<Integer> barrioIds =
        barrios.stream().map(MgBarrioParajeResumenDTO::getId).collect(Collectors.toList());
    return repository.findDTOsByEmpresaIdAndBarrioIdIn(empresaId, barrioIds);
  }

  @Override
  public List<DePrecioEnvioDTO> getPorBarrio(Integer barrioId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return repository.findDTOsByEmpresaIdAndBarrioId(empresaId, barrioId);
  }

  @Override
  @Transactional
  public DePrecioEnvioDTO upsertBarrio(Integer barrioId, BigDecimal precio) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    DePrecioEnvio entity =
        repository
            .findByEmpresaIdAndBarrioIdAndSubBarrioIdIsNull(empresaId, barrioId)
            .orElseGet(() -> buildNew(empresaId, barrioId, null));
    entity.setPrecio(precio);
    repository.save(entity);
    return repository.findDTOsByEmpresaIdAndBarrioId(empresaId, barrioId).stream()
        .filter(d -> d.getSubBarrioId() == null)
        .findFirst()
        .orElseThrow();
  }

  @Override
  @Transactional
  public DePrecioEnvioDTO upsertSubBarrio(Integer subBarrioId, BigDecimal precio) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    MgSubBarrio sub =
        subBarrioRepository
            .findById(subBarrioId)
            .orElseThrow(
                () -> new RecordNotFoundException("Sub-barrio no encontrado: " + subBarrioId));
    DePrecioEnvio entity =
        repository
            .findByEmpresaIdAndSubBarrioId(empresaId, subBarrioId)
            .orElseGet(() -> buildNew(empresaId, sub.getBarrioId(), subBarrioId));
    entity.setPrecio(precio);
    repository.save(entity);
    return repository.findDTOsByEmpresaIdAndBarrioId(empresaId, sub.getBarrioId()).stream()
        .filter(d -> subBarrioId.equals(d.getSubBarrioId()))
        .findFirst()
        .orElseThrow();
  }

  @Override
  @Transactional
  public void deleteBarrio(Integer barrioId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    repository
        .findByEmpresaIdAndBarrioIdAndSubBarrioIdIsNull(empresaId, barrioId)
        .ifPresent(repository::delete);
  }

  @Override
  @Transactional
  public void deleteSubBarrio(Integer subBarrioId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    repository.findByEmpresaIdAndSubBarrioId(empresaId, subBarrioId).ifPresent(repository::delete);
  }

  private DePrecioEnvio buildNew(Integer empresaId, Integer barrioId, Integer subBarrioId) {
    DePrecioEnvio e = new DePrecioEnvio();
    e.setEmpresaId(empresaId);
    e.setBarrioId(barrioId);
    e.setSubBarrioId(subBarrioId);
    e.setFechaReg(LocalDateTime.now());
    e.setUsuarioReg(tenantContext.getCurrentUsername());
    return e;
  }
}
