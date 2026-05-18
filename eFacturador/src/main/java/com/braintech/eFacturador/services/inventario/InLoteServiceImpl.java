package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InInventarioRepository;
import com.braintech.eFacturador.dao.inventario.InLoteDao;
import com.braintech.eFacturador.dao.producto.MgProductoRepository;
import com.braintech.eFacturador.dto.inventario.InLoteResumenDTO;
import com.braintech.eFacturador.dto.inventario.InLoteSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InLoteStockDTO;
import com.braintech.eFacturador.dto.inventario.InLoteStockResponseDTO;
import com.braintech.eFacturador.dto.inventario.InLoteUpdateDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InLoteService;
import com.braintech.eFacturador.jpa.inventario.InLote;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.producto.MgProductoUnidadSuplidor;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class InLoteServiceImpl implements InLoteService {

  private final InLoteDao inLoteDao;
  private final InInventarioRepository inInventarioRepository;
  private final MgProductoRepository mgProductoRepository;
  private final TenantContext tenantContext;

  @Override
  @Transactional
  public InLote save(InLote lote) {
    return inLoteDao.save(lote);
  }

  @Override
  public InLote findById(String lote, Long productoId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return inLoteDao.findById(lote, productoId, empresaId, sucursalId).orElse(null);
  }

  @Override
  @Transactional
  public InLote update(String lote, Long productoId, InLoteUpdateDTO dto) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();

    InLote existing =
        inLoteDao
            .findById(lote, productoId, empresaId, sucursalId)
            .orElseThrow(() -> new RecordNotFoundException("Lote no encontrado"));

    if (dto.getSerie() != null) existing.setSerie(dto.getSerie());
    if (dto.getFechaVencimiento() != null) existing.setFechaVencimiento(dto.getFechaVencimiento());
    if (dto.getFechaAlertaVencimiento() != null)
      existing.setFechaAlertaVencimiento(dto.getFechaAlertaVencimiento());
    if (dto.getAlertasDias() != null) existing.setAlertasDias(dto.getAlertasDias());
    if (dto.getEstadoId() != null) existing.setEstadoId(dto.getEstadoId());

    return inLoteDao.save(existing);
  }

  @Override
  public List<InLote> findAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return inLoteDao.findAll(empresaId, sucursalId);
  }

  @Override
  public Page<InLoteResumenDTO> searchByCriteria(InLoteSearchCriteria criteria) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    return inLoteDao.searchByCriteria(criteria, empresaId, sucursalId);
  }

  @Override
  public InLoteStockResponseDTO getStockPorAlmacen(String lote, Long productoId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    // Stock por empresa — sin filtrar por sucursal para ver todas las existencias del lote
    List<InLoteStockDTO> almacenes =
        inInventarioRepository.findStockByLoteAndProducto(lote, productoId.intValue(), empresaId);

    // Obtener conversión unidad/fracción del producto.
    // Se carga el MgProducto directamente (unidadProductorSuplidor es EAGER)
    // para evitar depender del filtro activo=true de MgProductoUnidadSuplidorRepository.
    String unidadNombre = null;
    String fraccionNombre = null;
    Integer fraccionCantidad = 1;

    MgProducto producto =
        mgProductoRepository.findByIdAndEmpresaId(productoId.intValue(), empresaId).orElse(null);

    if (producto != null
        && producto.getUnidadProductorSuplidor() != null
        && !producto.getUnidadProductorSuplidor().isEmpty()) {
      MgProductoUnidadSuplidor u = producto.getUnidadProductorSuplidor().get(0);
      unidadNombre = u.getUnidadId() != null ? u.getUnidadId().getNombre() : null;
      fraccionNombre = u.getUnidadFraccionId() != null ? u.getUnidadFraccionId().getNombre() : null;
      fraccionCantidad = (u.getCantidad() != null && u.getCantidad() > 1) ? u.getCantidad() : 1;
    }

    return new InLoteStockResponseDTO(unidadNombre, fraccionNombre, fraccionCantidad, almacenes);
  }

  @Override
  @Transactional
  public void disableById(String lote, Long productoId) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    inLoteDao.disableById(lote, productoId, empresaId, sucursalId);
  }
}
