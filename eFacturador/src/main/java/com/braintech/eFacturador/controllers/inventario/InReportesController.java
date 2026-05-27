package com.braintech.eFacturador.controllers.inventario;

import com.braintech.eFacturador.dto.inventario.InReportesCriteria;
import com.braintech.eFacturador.dto.inventario.InTopProductoDTO;
import com.braintech.eFacturador.dto.inventario.InVentasComparativoDTO;
import com.braintech.eFacturador.dto.inventario.InVentasMesDTO;
import com.braintech.eFacturador.dto.inventario.InVentasSemanaDTO;
import com.braintech.eFacturador.dto.inventario.InVentasSucursalDTO;
import com.braintech.eFacturador.interfaces.inventario.InReportesService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/inventario/reportes")
@RequiredArgsConstructor
public class InReportesController {

  private final InReportesService reportesService;

  /** POST /comparativo-anual — Ventas mes a mes: año actual vs año anterior. */
  @PostMapping("/comparativo-anual")
  public ResponseEntity<List<InVentasComparativoDTO>> comparativoAnual(
      @RequestBody InReportesCriteria criteria) {
    return ResponseEntity.ok(reportesService.comparativoAnual(criteria));
  }

  /** POST /top-productos — Los N productos más vendidos en el período. */
  @PostMapping("/top-productos")
  public ResponseEntity<List<InTopProductoDTO>> topProductos(
      @RequestBody InReportesCriteria criteria) {
    return ResponseEntity.ok(reportesService.topProductos(criteria));
  }

  /** POST /por-semana — Ventas agrupadas por número de semana en el período. */
  @PostMapping("/por-semana")
  public ResponseEntity<List<InVentasSemanaDTO>> porSemana(
      @RequestBody InReportesCriteria criteria) {
    return ResponseEntity.ok(reportesService.ventasPorSemana(criteria));
  }

  /** POST /por-sucursal — Ventas totales por sucursal en el período. */
  @PostMapping("/por-sucursal")
  public ResponseEntity<List<InVentasSucursalDTO>> porSucursal(
      @RequestBody InReportesCriteria criteria) {
    return ResponseEntity.ok(reportesService.ventasPorSucursal(criteria));
  }

  /** POST /historico-producto — Historial mensual de un producto específico. */
  @PostMapping("/historico-producto")
  public ResponseEntity<List<InVentasMesDTO>> historicoProducto(
      @RequestBody InReportesCriteria criteria) {
    return ResponseEntity.ok(reportesService.historicoProducto(criteria));
  }
}
