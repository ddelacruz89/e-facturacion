package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.DashboardAjusteBarDTO;
import com.braintech.eFacturador.dto.inventario.DashboardKpiDTO;
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
}
