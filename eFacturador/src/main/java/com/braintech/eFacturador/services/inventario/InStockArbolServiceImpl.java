package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InInventarioRepository;
import com.braintech.eFacturador.dto.inventario.InStockAlmacenNodoDTO;
import com.braintech.eFacturador.dto.inventario.InStockArbolFlatDTO;
import com.braintech.eFacturador.dto.inventario.InStockArbolSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InStockProductoNodoDTO;
import com.braintech.eFacturador.interfaces.inventario.InStockArbolService;
import com.braintech.eFacturador.util.TenantContext;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InStockArbolServiceImpl implements InStockArbolService {

  private final InInventarioRepository inventarioRepository;
  private final TenantContext tenantContext;

  @Override
  @Transactional(readOnly = true)
  public List<InStockProductoNodoDTO> buscarArbol(InStockArbolSearchCriteria criteria) {
    // empresaId siempre del token — nunca del frontend
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    // sucursalId viene en criteria: null = todas las sucursales de la empresa
    Integer sucursalId = criteria.getSucursalId();

    String productoNombre =
        (criteria.getProductoNombre() != null && !criteria.getProductoNombre().isBlank())
            ? criteria.getProductoNombre().trim()
            : null;

    List<InStockArbolFlatDTO> filas =
        inventarioRepository.findStockArbol(
            empresaId,
            sucursalId,
            productoNombre,
            criteria.getAlmacenId(),
            criteria.isSoloConStock());

    return agruparEnArbol(filas);
  }

  /**
   * Transforma la lista plana en árbol producto → almacén → lote. Usa LinkedHashMap para preservar
   * el orden que retorna la query (ORDER BY).
   */
  private List<InStockProductoNodoDTO> agruparEnArbol(List<InStockArbolFlatDTO> filas) {
    // productoId → nodo producto
    Map<Integer, InStockProductoNodoDTO> productoMap = new LinkedHashMap<>();
    // productoId_almacenId → nodo almacén
    Map<String, InStockAlmacenNodoDTO> almacenMap = new LinkedHashMap<>();

    for (InStockArbolFlatDTO fila : filas) {
      // ── Nivel 1: Producto ───────────────────────────────────────────────
      InStockProductoNodoDTO productoNodo =
          productoMap.computeIfAbsent(
              fila.getProductoId(), id -> new InStockProductoNodoDTO(id, fila.getProductoNombre()));

      // ── Nivel 2: Almacén ────────────────────────────────────────────────
      String almacenKey = fila.getProductoId() + "_" + fila.getAlmacenId();
      InStockAlmacenNodoDTO almacenNodo =
          almacenMap.computeIfAbsent(
              almacenKey,
              k -> {
                InStockAlmacenNodoDTO nuevo =
                    new InStockAlmacenNodoDTO(fila.getAlmacenId(), fila.getAlmacenNombre());
                productoNodo.getAlmacenes().add(nuevo);
                return nuevo;
              });

      // ── Nivel 3: Lote ───────────────────────────────────────────────────
      almacenNodo.agregarLote(fila.getLote(), fila.getCantidad());

      // Acumular en el total del producto
      productoNodo.agregarCantidad(fila.getCantidad());
    }

    return new ArrayList<>(productoMap.values());
  }
}
