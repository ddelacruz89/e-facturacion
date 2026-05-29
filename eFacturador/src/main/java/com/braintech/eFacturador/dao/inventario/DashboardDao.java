package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.DashboardAjusteBarDTO;
import com.braintech.eFacturador.dto.inventario.DashboardKpiDTO;
import com.braintech.eFacturador.dto.inventario.OrdenCompraEntregaHoyDTO;
import java.util.List;

/**
 * DAO del dashboard. {@code sucursalId} es opcional — si es {@code null} se retornan datos de toda
 * la empresa.
 */
public interface DashboardDao {
  DashboardKpiDTO kpiOrdenEntrada(Integer empresaId, Integer sucursalId);

  DashboardKpiDTO kpiOrdenCompra(Integer empresaId, Integer sucursalId);

  DashboardKpiDTO kpiRequisicion(Integer empresaId, Integer sucursalId);

  DashboardKpiDTO kpiTransferencia(Integer empresaId, Integer sucursalId);

  List<DashboardAjusteBarDTO> kpiAjustesPorTipo(Integer empresaId, Integer sucursalId);

  /**
   * Órdenes de compra cuya fecha_entrega_tentativa es hoy y no están inactivas. Usadas para el card
   * de pedidos del día en el dashboard.
   */
  List<OrdenCompraEntregaHoyDTO> pedidosEntregaHoy(Integer empresaId, Integer sucursalId);

  /** Órdenes de compra cuya fecha_entrega_tentativa es mañana y no están inactivas. */
  List<OrdenCompraEntregaHoyDTO> pedidosEntregaManana(Integer empresaId, Integer sucursalId);
}
