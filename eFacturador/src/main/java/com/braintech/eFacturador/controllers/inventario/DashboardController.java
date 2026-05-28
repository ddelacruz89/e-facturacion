package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.DashboardAjusteBarDTO;
import com.braintech.eFacturador.dto.inventario.DashboardKpiDTO;
import com.braintech.eFacturador.dto.inventario.DashboardSucursalDTO;
import com.braintech.eFacturador.interfaces.inventario.DashboardService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

  private final DashboardService dashboardService;

  /**
   * GET /api/v1/dashboard/kpis
   *
   * <p>Retorna los KPIs del dashboard según los permisos del usuario. El parámetro opcional {@code
   * sucursalId} filtra por sucursal; si se omite se incluyen datos de toda la empresa.
   */
  @GetMapping("/kpis")
  public ResponseEntity<List<DashboardKpiDTO>> getKpis(
      @RequestParam(required = false) Integer sucursalId) {
    return ResponseEntity.ok(dashboardService.getKpis(sucursalId));
  }

  /**
   * GET /api/v1/dashboard/sucursales
   *
   * <p>Retorna las sucursales a las que el usuario tiene acceso dentro de su empresa. Usado para
   * poblar el selector de filtro del dashboard.
   */
  @GetMapping("/sucursales")
  public ResponseEntity<List<DashboardSucursalDTO>> getSucursales() {
    return ResponseEntity.ok(dashboardService.getSucursales());
  }

  /**
   * GET /api/v1/dashboard/ajustes
   *
   * <p>Conteo de ajustes de inventario (tipos 4, 5, 9, 20) de los últimos 7 días. {@code
   * sucursalId} opcional; omitir = toda la empresa.
   */
  @GetMapping("/ajustes")
  public ResponseEntity<List<DashboardAjusteBarDTO>> getAjustes(
      @RequestParam(required = false) Integer sucursalId) {
    return ResponseEntity.ok(dashboardService.getAjustesPorTipo(sucursalId));
  }
}
