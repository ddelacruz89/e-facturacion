package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.DashboardDao;
import com.braintech.eFacturador.dao.seguridad.SgPermisoRepository;
import com.braintech.eFacturador.dao.seguridad.SgUsuarioRolRepository;
import com.braintech.eFacturador.dto.inventario.DashboardAjusteBarDTO;
import com.braintech.eFacturador.dto.inventario.DashboardKpiDTO;
import com.braintech.eFacturador.dto.inventario.DashboardSucursalDTO;
import com.braintech.eFacturador.dto.inventario.OrdenCompraEntregaHoyDTO;
import com.braintech.eFacturador.interfaces.inventario.DashboardService;
import com.braintech.eFacturador.util.TenantContext;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

  private final DashboardDao dashboardDao;
  private final SgPermisoRepository permisoRepository;
  private final SgUsuarioRolRepository usuarioRolRepository;
  private final TenantContext tenantContext;

  @Override
  public List<DashboardKpiDTO> getKpis(Integer sucursalId) {
    String username = tenantContext.getCurrentUsername();
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer defSucursalId = tenantContext.getCurrentSucursalId(); // sucursal del token JWT

    // Los permisos se verifican siempre contra la sucursal del JWT del usuario
    Set<String> urls = permisoRepository.findMenuUrlsPermitidas(username, empresaId, defSucursalId);

    // sucursalId=null → empresa completa; de lo contrario filtra por la sucursal solicitada
    List<DashboardKpiDTO> result = new ArrayList<>();

    if (urls.contains("/inventario/orden-entrada"))
      result.add(dashboardDao.kpiOrdenEntrada(empresaId, sucursalId));

    if (urls.contains("/inventario/orden-compra"))
      result.add(dashboardDao.kpiOrdenCompra(empresaId, sucursalId));

    if (urls.contains("/inventario/requisicion"))
      result.add(dashboardDao.kpiRequisicion(empresaId, sucursalId));

    if (urls.contains("/inventario/transferencias"))
      result.add(dashboardDao.kpiTransferencia(empresaId, sucursalId));

    return result;
  }

  @Override
  public List<DashboardAjusteBarDTO> getAjustesPorTipo(Integer sucursalId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return dashboardDao.kpiAjustesPorTipo(empresaId, sucursalId);
  }

  @Override
  public List<OrdenCompraEntregaHoyDTO> getPedidosEntregaHoy(Integer sucursalId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    if (!tienePermisoOrdenCompra()) return List.of();
    return dashboardDao.pedidosEntregaHoy(empresaId, sucursalId);
  }

  @Override
  public List<OrdenCompraEntregaHoyDTO> getPedidosEntregaManana(Integer sucursalId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    if (!tienePermisoOrdenCompra()) return List.of();
    return dashboardDao.pedidosEntregaManana(empresaId, sucursalId);
  }

  private boolean tienePermisoOrdenCompra() {
    String username = tenantContext.getCurrentUsername();
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer defSucursalId = tenantContext.getCurrentSucursalId();
    Set<String> urls = permisoRepository.findMenuUrlsPermitidas(username, empresaId, defSucursalId);
    return urls.contains("/inventario/orden-compra");
  }

  @Override
  public List<DashboardSucursalDTO> getSucursales() {
    String username = tenantContext.getCurrentUsername();
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    return usuarioRolRepository.findSucursalesByUsernameAndEmpresa(username, empresaId).stream()
        .map(s -> new DashboardSucursalDTO(s.getId(), s.getNombre()))
        .sorted(
            Comparator.comparing(
                DashboardSucursalDTO::getNombre, Comparator.nullsLast(Comparator.naturalOrder())))
        .collect(Collectors.toList());
  }
}
