package com.braintech.eFacturador.dao.inventario;

import com.braintech.eFacturador.dto.inventario.InTopProductoDTO;
import com.braintech.eFacturador.dto.inventario.InVentasMesDTO;
import com.braintech.eFacturador.dto.inventario.InVentasSemanaDTO;
import com.braintech.eFacturador.dto.inventario.InVentasSucursalDTO;
import java.time.LocalDateTime;
import java.util.List;

public interface InReportesDao {

  List<InVentasMesDTO> ventasPorMes(
      Integer empresaId, Integer anio, Integer anioAnterior, Integer sucursalId);

  List<InTopProductoDTO> topProductos(
      Integer empresaId, LocalDateTime desde, LocalDateTime hasta, Integer sucursalId, int top);

  List<InVentasSemanaDTO> ventasPorSemana(
      Integer empresaId, LocalDateTime desde, LocalDateTime hasta, Integer sucursalId);

  List<InVentasSucursalDTO> ventasPorSucursal(
      Integer empresaId, LocalDateTime desde, LocalDateTime hasta);

  List<InVentasMesDTO> historicoProducto(
      Integer empresaId,
      Integer productoId,
      LocalDateTime desde,
      LocalDateTime hasta,
      Integer sucursalId);
}
