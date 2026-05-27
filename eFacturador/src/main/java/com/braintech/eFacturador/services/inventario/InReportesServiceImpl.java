package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InReportesDao;
import com.braintech.eFacturador.dto.inventario.InReportesCriteria;
import com.braintech.eFacturador.dto.inventario.InTopProductoDTO;
import com.braintech.eFacturador.dto.inventario.InVentasComparativoDTO;
import com.braintech.eFacturador.dto.inventario.InVentasMesDTO;
import com.braintech.eFacturador.dto.inventario.InVentasSemanaDTO;
import com.braintech.eFacturador.dto.inventario.InVentasSucursalDTO;
import com.braintech.eFacturador.interfaces.inventario.InReportesService;
import com.braintech.eFacturador.util.TenantContext;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InReportesServiceImpl implements InReportesService {

  private final InReportesDao reportesDao;
  private final TenantContext tenantContext;

  // ── comparativoAnual ─────────────────────────────────────────────────────────

  @Override
  public List<InVentasComparativoDTO> comparativoAnual(InReportesCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    int anio = criteria.getAnio() != null ? criteria.getAnio() : Year.now().getValue();
    int anioAnterior = anio - 1;

    List<InVentasMesDTO> raw =
        reportesDao.ventasPorMes(empresaId, anio, anioAnterior, criteria.getSucursalId());

    // Pivot: {anio → mes → DTO}
    Map<Integer, Map<Integer, InVentasMesDTO>> byAnio =
        raw.stream()
            .collect(
                Collectors.groupingBy(
                    InVentasMesDTO::getAnio, Collectors.toMap(InVentasMesDTO::getMes, d -> d)));

    Map<Integer, InVentasMesDTO> actual = byAnio.getOrDefault(anio, Map.of());
    Map<Integer, InVentasMesDTO> anterior = byAnio.getOrDefault(anioAnterior, Map.of());

    List<InVentasComparativoDTO> result = new ArrayList<>();
    for (int mes = 1; mes <= 12; mes++) {
      InVentasMesDTO a = actual.get(mes);
      InVentasMesDTO p = anterior.get(mes);
      result.add(
          new InVentasComparativoDTO(
              mes,
              a != null ? a.getUnidades() : 0L,
              p != null ? p.getUnidades() : 0L,
              a != null ? a.getCostoTotal() : BigDecimal.ZERO,
              p != null ? p.getCostoTotal() : BigDecimal.ZERO));
    }
    return result;
  }

  // ── topProductos ─────────────────────────────────────────────────────────────

  @Override
  public List<InTopProductoDTO> topProductos(InReportesCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    int top = criteria.getTop() != null ? criteria.getTop() : 10;
    LocalDateTime[] rango = resolverRango(criteria);
    return reportesDao.topProductos(empresaId, rango[0], rango[1], criteria.getSucursalId(), top);
  }

  // ── ventasPorSemana ──────────────────────────────────────────────────────────

  @Override
  public List<InVentasSemanaDTO> ventasPorSemana(InReportesCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    LocalDateTime[] rango = resolverRango(criteria);
    return reportesDao.ventasPorSemana(empresaId, rango[0], rango[1], criteria.getSucursalId());
  }

  // ── ventasPorSucursal ────────────────────────────────────────────────────────

  @Override
  public List<InVentasSucursalDTO> ventasPorSucursal(InReportesCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    LocalDateTime[] rango = resolverRango(criteria);
    return reportesDao.ventasPorSucursal(empresaId, rango[0], rango[1]);
  }

  // ── historicoProducto ────────────────────────────────────────────────────────

  @Override
  public List<InVentasMesDTO> historicoProducto(InReportesCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    LocalDateTime[] rango = resolverRango(criteria);
    return reportesDao.historicoProducto(
        empresaId, criteria.getProductoId(), rango[0], rango[1], criteria.getSucursalId());
  }

  // ── helper ───────────────────────────────────────────────────────────────────

  private LocalDateTime[] resolverRango(InReportesCriteria criteria) {
    LocalDate inicio =
        criteria.getFechaInicio() != null
            ? criteria.getFechaInicio()
            : LocalDate.now().withDayOfYear(1);
    LocalDate fin = criteria.getFechaFin() != null ? criteria.getFechaFin() : LocalDate.now();
    return new LocalDateTime[] {inicio.atStartOfDay(), fin.atTime(LocalTime.MAX)};
  }
}
