package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InAlertaInventarioRepository;
import com.braintech.eFacturador.dao.inventario.InAlertaVistoRepository;
import com.braintech.eFacturador.dto.inventario.InAlertaDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InAlertaInventarioService;
import com.braintech.eFacturador.jpa.inventario.InAlertaInventario;
import com.braintech.eFacturador.jpa.inventario.InAlertaVisto;
import com.braintech.eFacturador.util.TenantContext;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InAlertaInventarioServiceImpl implements InAlertaInventarioService {

  @Autowired private InAlertaInventarioRepository alertaRepository;
  @Autowired private InAlertaVistoRepository vistoRepository;
  @Autowired private TenantContext tenantContext;

  @Override
  public List<InAlertaDTO> findActivas() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();

    List<InAlertaInventario> alertas = alertaRepository.findActivasByTenant(empresaId, sucursalId);

    Set<Integer> vistas = vistoRepository.findAlertaIdsByUsername(username);

    return alertas.stream().map(a -> toDTO(a, vistas.contains(a.getId()))).toList();
  }

  @Override
  public long contarNoVistas() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String username = tenantContext.getCurrentUsername();
    return alertaRepository.contarNoVistas(empresaId, sucursalId, username);
  }

  @Override
  @Transactional
  public void marcarVisto(Integer alertaId) {
    String username = tenantContext.getCurrentUsername();
    if (vistoRepository.existsByAlertaIdAndUsername(alertaId, username)) {
      return;
    }
    InAlertaInventario alerta =
        alertaRepository
            .findById(alertaId)
            .orElseThrow(() -> new RecordNotFoundException("Alerta no encontrada: " + alertaId));
    vistoRepository.save(new InAlertaVisto(alerta, username));
  }

  @Override
  @Transactional
  public void cerrar(Integer alertaId) {
    String username = tenantContext.getCurrentUsername();
    InAlertaInventario alerta =
        alertaRepository
            .findById(alertaId)
            .orElseThrow(() -> new RecordNotFoundException("Alerta no encontrada: " + alertaId));
    alerta.setEstadoId("CER");
    alerta.setFechaCierre(LocalDateTime.now());
    alerta.setUsuarioCierre(username);
    alertaRepository.save(alerta);
  }

  private InAlertaDTO toDTO(InAlertaInventario a, boolean visto) {
    return InAlertaDTO.builder()
        .id(a.getId())
        .tipo(a.getTipo())
        .productoId(a.getProductoId())
        .almacenId(a.getAlmacenId())
        .lote(a.getLote())
        .cantidadActual(a.getCantidadActual())
        .limite(a.getLimite())
        .fechaVencimiento(a.getFechaVencimiento())
        .fechaReg(a.getFechaReg())
        .usuarioReg(a.getUsuarioReg())
        .empresaId(a.getEmpresaId())
        .sucursalId(a.getSucursalId() != null ? a.getSucursalId().getId() : null)
        .visto(visto)
        .build();
  }
}
