package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InStockArbolDao;
import com.braintech.eFacturador.dto.inventario.InStockAlmacenNodoDTO;
import com.braintech.eFacturador.dto.inventario.InStockArbolSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InStockCriticoDTO;
import com.braintech.eFacturador.dto.inventario.InStockLoteNodoDTO;
import com.braintech.eFacturador.dto.inventario.InStockProductoNodoDTO;
import com.braintech.eFacturador.interfaces.inventario.InStockArbolService;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InStockArbolServiceImpl implements InStockArbolService {

  private final InStockArbolDao stockArbolDao;
  private final TenantContext tenantContext;

  @Override
  @Transactional(readOnly = true)
  public Page<InStockProductoNodoDTO> buscarProductos(InStockArbolSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return stockArbolDao.findProductos(empresaId, criteria);
  }

  @Override
  @Transactional(readOnly = true)
  public List<InStockAlmacenNodoDTO> buscarAlmacenesPorProducto(
      Integer productoId, InStockArbolSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return stockArbolDao.findAlmacenesPorProducto(empresaId, productoId, criteria);
  }

  @Override
  @Transactional(readOnly = true)
  public List<InStockLoteNodoDTO> buscarLotesPorProductoAlmacen(
      Integer productoId, Integer almacenId, InStockArbolSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return stockArbolDao.findLotesPorProductoAlmacen(empresaId, productoId, almacenId, criteria);
  }

  @Override
  @Transactional(readOnly = true)
  public List<InStockCriticoDTO> getStockCritico() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    return stockArbolDao.findStockCritico(empresaId);
  }
}
