package com.braintech.eFacturador.interfaces.inventario;

import com.braintech.eFacturador.dto.inventario.InReportesCriteria;
import com.braintech.eFacturador.dto.inventario.InTopProductoDTO;
import com.braintech.eFacturador.dto.inventario.InVentasComparativoDTO;
import com.braintech.eFacturador.dto.inventario.InVentasMesDTO;
import com.braintech.eFacturador.dto.inventario.InVentasSemanaDTO;
import com.braintech.eFacturador.dto.inventario.InVentasSucursalDTO;
import java.util.List;

public interface InReportesService {

  List<InVentasComparativoDTO> comparativoAnual(InReportesCriteria criteria);

  List<InTopProductoDTO> topProductos(InReportesCriteria criteria);

  List<InVentasSemanaDTO> ventasPorSemana(InReportesCriteria criteria);

  List<InVentasSucursalDTO> ventasPorSucursal(InReportesCriteria criteria);

  List<InVentasMesDTO> historicoProducto(InReportesCriteria criteria);
}
