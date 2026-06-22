package com.braintech.eFacturador.services.inventario;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.braintech.eFacturador.dao.inventario.InLoteDao;
import com.braintech.eFacturador.dao.inventario.InOrdenEntradaDao;
import com.braintech.eFacturador.dao.inventario.InOrdenesComprasRepository;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.inventario.InOrdenEntradaResumenDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenEntradaSearchCriteria;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InMovimientoService;
import com.braintech.eFacturador.jpa.inventario.InLote;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntrada;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntradaDetalle;
import com.braintech.eFacturador.jpa.inventario.InOrdenEntradaDetalleLote;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.util.TenantContext;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

@ExtendWith(MockitoExtension.class)
class InOrdenEntradaServiceImplTest {

  @Mock private InOrdenEntradaDao inOrdenEntradaDao;
  @Mock private InLoteDao inLoteDao;
  @Mock private SgSucursalRepository sgSucursalRepository;
  @Mock private TenantContext tenantContext;
  @Mock private InMovimientoService movimientoService;
  @Mock private InOrdenesComprasRepository inOrdenesComprasRepository;

  @InjectMocks private InOrdenEntradaServiceImpl service;

  private static final Integer EMPRESA_ID = 1;
  private static final Integer SUCURSAL_ID = 10;
  private static final String USERNAME = "testuser";

  @BeforeEach
  void configurarTenant() {
    lenient().when(tenantContext.getCurrentEmpresaId()).thenReturn(EMPRESA_ID);
    lenient().when(tenantContext.getCurrentSucursalId()).thenReturn(SUCURSAL_ID);
    lenient().when(tenantContext.getCurrentUsername()).thenReturn(USERNAME);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private SgSucursal sucursalFake() {
    SgSucursal s = new SgSucursal();
    s.setId(SUCURSAL_ID);
    return s;
  }

  private MgProducto productoFake(Integer id) {
    MgProducto p = new MgProducto();
    p.setId(id);
    return p;
  }

  private InLote loteFake(String loteId) {
    InLote l = new InLote();
    l.setLote(loteId);
    l.setEmpresaId(EMPRESA_ID);
    return l;
  }

  /** Crea una orden de entrada mínima sin detalles. */
  private InOrdenEntrada ordenFake(Integer id) {
    InOrdenEntrada o = new InOrdenEntrada();
    o.setId(id);
    o.setEmpresaId(EMPRESA_ID);
    o.setAlmacenId(20);
    o.setMonto(BigDecimal.valueOf(850));
    o.setItbis(BigDecimal.valueOf(150));
    o.setTotal(BigDecimal.valueOf(1000));
    o.setInOrdenDetalleList(new ArrayList<>());
    return o;
  }

  /** Crea un detalle con producto y sin lotes (producto entero, no servicio). */
  private InOrdenEntradaDetalle detalleFake(Integer cantidad, Integer unidadCantidad) {
    InOrdenEntradaDetalle d = new InOrdenEntradaDetalle();
    d.setProductoId(productoFake(99));
    d.setCantidad(cantidad);
    d.setUnidadCantidad(unidadCantidad);
    d.setPrecioUnitario(BigDecimal.valueOf(100));
    d.setSubTotal(BigDecimal.valueOf(850));
    d.setItbis(BigDecimal.valueOf(150));
    d.setTotal(BigDecimal.valueOf(1000));
    d.setServicio(false);
    d.setInOrdenDetalleLotes(new ArrayList<>());
    return d;
  }

  /** Crea un detalleLote con un lote y cantidad dada. */
  private InOrdenEntradaDetalleLote detalleLoteFake(String loteId, Integer cantidad) {
    InOrdenEntradaDetalleLote dl = new InOrdenEntradaDetalleLote();
    dl.setCantidad(cantidad);
    InLote lote = loteFake(loteId);
    dl.setInLotes(lote);
    return dl;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // save()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("save()")
  class Save {

    @Test
    @DisplayName("guarda la orden y retorna la entidad persistida")
    void save_happyPath_sinDetalles() {
      InOrdenEntrada orden = ordenFake(null);
      InOrdenEntrada saved = ordenFake(1);

      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inOrdenEntradaDao.save(any())).thenReturn(saved);

      InOrdenEntrada result = service.save(orden);

      assertThat(result).isNotNull();
      assertThat(result.getId()).isEqualTo(1);
      verify(inOrdenEntradaDao).save(orden);
    }

    @Test
    @DisplayName("empresaId y sucursalId siempre se sobreescriben desde el JWT")
    void save_tenantDesdeJwt() {
      InOrdenEntrada orden = ordenFake(null);
      orden.setEmpresaId(999); // valor del cliente — debe ser ignorado

      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inOrdenEntradaDao.save(any())).thenReturn(ordenFake(1));

      service.save(orden);

      assertThat(orden.getEmpresaId()).isEqualTo(EMPRESA_ID);
      assertThat(orden.getSucursalId().getId()).isEqualTo(SUCURSAL_ID);
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando la sucursal no existe")
    void save_sucursalNoEncontrada() {
      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.save(ordenFake(null)))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("Sucursal");
    }

    @Test
    @DisplayName("cuando ordenCompraId no es null, marca la OC como COM")
    void save_marcaOrdenCompraComoCOM_cuandoOrdenCompraIdPresente() {
      InOrdenEntrada orden = ordenFake(null);
      orden.setOrdenCompraId(55);

      InOrdenEntrada saved = ordenFake(1);
      saved.setOrdenCompraId(55);

      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inOrdenEntradaDao.save(any())).thenReturn(saved);

      service.save(orden);

      verify(inOrdenesComprasRepository).updateEstadoId(55, "COM");
    }

    @Test
    @DisplayName("cuando ordenCompraId es null, NO modifica ninguna orden de compra")
    void save_noTocaOrdenCompra_cuandoOrdenCompraIdNull() {
      InOrdenEntrada orden = ordenFake(null);
      orden.setOrdenCompraId(null);

      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inOrdenEntradaDao.save(any())).thenReturn(ordenFake(1));

      service.save(orden);

      verify(inOrdenesComprasRepository, never()).updateEstadoId(anyInt(), any());
    }

    @Test
    @DisplayName("sets the back-reference ordenEntradaId en cada detalle")
    void save_fixEntityGraph_setBackReference() {
      InOrdenEntradaDetalle detalle = detalleFake(3, null);
      InOrdenEntrada orden = ordenFake(null);
      orden.setInOrdenDetalleList(new ArrayList<>(List.of(detalle)));

      InOrdenEntrada saved = ordenFake(1);
      saved.setInOrdenDetalleList(List.of(detalle));

      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inOrdenEntradaDao.save(any())).thenReturn(saved);

      service.save(orden);

      assertThat(detalle.getOrdenEntradaId()).isSameAs(orden);
    }

    @Test
    @DisplayName("lotes existentes en BD reusan el managed lote")
    void save_fixEntityGraph_loteExistente_reusaManaged() {
      InOrdenEntradaDetalleLote detalleLote = detalleLoteFake("LOTE-01", 5);
      InOrdenEntradaDetalle detalle = detalleFake(5, null);
      detalle.setInOrdenDetalleLotes(new ArrayList<>(List.of(detalleLote)));

      InOrdenEntrada orden = ordenFake(null);
      orden.setInOrdenDetalleList(new ArrayList<>(List.of(detalle)));

      InLote managed = loteFake("LOTE-01");
      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inLoteDao.findById(eq("LOTE-01"), eq(99L), eq(EMPRESA_ID), eq(SUCURSAL_ID)))
          .thenReturn(Optional.of(managed));
      when(inOrdenEntradaDao.save(any())).thenReturn(ordenFake(1));

      service.save(orden);

      assertThat(detalleLote.getInLotes()).isSameAs(managed);
      verify(inLoteDao, never()).save(any());
    }

    @Test
    @DisplayName("lotes nuevos se crean con los datos del tenant")
    void save_fixEntityGraph_loteNuevo_creaConTenant() {
      InOrdenEntradaDetalleLote detalleLote = detalleLoteFake("LOTE-NUEVO", 3);
      InOrdenEntradaDetalle detalle = detalleFake(3, null);
      detalle.setInOrdenDetalleLotes(new ArrayList<>(List.of(detalleLote)));

      InOrdenEntrada orden = ordenFake(null);
      orden.setInOrdenDetalleList(new ArrayList<>(List.of(detalle)));

      InLote nuevoLote = loteFake("LOTE-NUEVO");
      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inLoteDao.findById(eq("LOTE-NUEVO"), eq(99L), eq(EMPRESA_ID), eq(SUCURSAL_ID)))
          .thenReturn(Optional.empty());
      when(inLoteDao.save(any())).thenReturn(nuevoLote);
      when(inOrdenEntradaDao.save(any())).thenReturn(ordenFake(1));

      service.save(orden);

      ArgumentCaptor<InLote> loteCaptor = ArgumentCaptor.forClass(InLote.class);
      verify(inLoteDao).save(loteCaptor.capture());
      InLote guardado = loteCaptor.getValue();
      assertThat(guardado.getEmpresaId()).isEqualTo(EMPRESA_ID);
      assertThat(guardado.getUsuarioReg()).isEqualTo(USERNAME);
      assertThat(guardado.getEstadoId()).isEqualTo("ACT");
    }

    @Test
    @DisplayName("detalles marcados como servicio=true no procesan lotes")
    void save_fixEntityGraph_servicioSaltaLotes() {
      InOrdenEntradaDetalleLote detalleLote = detalleLoteFake("LOTE-X", 2);
      InOrdenEntradaDetalle servicio = detalleFake(2, null);
      servicio.setServicio(true);
      servicio.setInOrdenDetalleLotes(List.of(detalleLote));

      InOrdenEntrada orden = ordenFake(null);
      orden.setInOrdenDetalleList(new ArrayList<>(List.of(servicio)));

      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inOrdenEntradaDao.save(any())).thenReturn(ordenFake(1));

      service.save(orden);

      verify(inLoteDao, never()).findById(any(), anyLong(), anyInt(), anyInt());
      verify(inLoteDao, never()).save(any());
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // calcularCantidadesFraccionarias() — verificado a través de save()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("calcularCantidadesFraccionarias()")
  class CantidadesFraccionarias {

    @Test
    @DisplayName("cantidad fraccionaria = cantidad × unidadCantidad cuando factor > 1")
    void calcular_conFactor() {
      InOrdenEntradaDetalle detalle = detalleFake(5, 10); // 5 cajas × 10 unidades
      InOrdenEntrada orden = ordenFake(null);
      orden.setInOrdenDetalleList(new ArrayList<>(List.of(detalle)));

      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inOrdenEntradaDao.save(any())).thenReturn(ordenFake(1));

      service.save(orden);

      assertThat(detalle.getCantidadFraccionaria()).isEqualTo(50);
    }

    @Test
    @DisplayName("cantidad fraccionaria = cantidad cuando unidadCantidad es null")
    void calcular_sinFactor_null() {
      InOrdenEntradaDetalle detalle = detalleFake(7, null);
      InOrdenEntrada orden = ordenFake(null);
      orden.setInOrdenDetalleList(new ArrayList<>(List.of(detalle)));

      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inOrdenEntradaDao.save(any())).thenReturn(ordenFake(1));

      service.save(orden);

      assertThat(detalle.getCantidadFraccionaria()).isEqualTo(7);
    }

    @Test
    @DisplayName("cantidad fraccionaria = cantidad cuando unidadCantidad = 1")
    void calcular_sinFactor_uno() {
      InOrdenEntradaDetalle detalle = detalleFake(4, 1);
      InOrdenEntrada orden = ordenFake(null);
      orden.setInOrdenDetalleList(new ArrayList<>(List.of(detalle)));

      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inOrdenEntradaDao.save(any())).thenReturn(ordenFake(1));

      service.save(orden);

      assertThat(detalle.getCantidadFraccionaria()).isEqualTo(4);
    }

    @Test
    @DisplayName("cantidad fraccionaria = 0 cuando cantidad es null")
    void calcular_cantidadNull() {
      InOrdenEntradaDetalle detalle = detalleFake(null, 5);
      InOrdenEntrada orden = ordenFake(null);
      orden.setInOrdenDetalleList(new ArrayList<>(List.of(detalle)));

      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inOrdenEntradaDao.save(any())).thenReturn(ordenFake(1));

      service.save(orden);

      assertThat(detalle.getCantidadFraccionaria()).isEqualTo(0);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // generarMovimientos() — verificado a través de save()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("generarMovimientos()")
  class GenerarMovimientos {

    @Test
    @DisplayName("registra un movimiento por cada lote con cantidad > 0")
    void generar_movimientosPorLote() {
      InOrdenEntradaDetalleLote lote = detalleLoteFake("L-001", 3);
      InOrdenEntradaDetalle detalle = detalleFake(3, null);
      detalle.setInOrdenDetalleLotes(new ArrayList<>(List.of(lote)));

      InOrdenEntrada saved = ordenFake(1);
      saved.setInOrdenDetalleList(List.of(detalle));

      prepareSaveWith(saved);

      service.save(ordenFake(null));

      verify(movimientoService).registrarTodos(anyList());
    }

    @Test
    @DisplayName("multiplica cantidad del lote por unidadCantidad al generar el movimiento")
    void generar_cantidadConFactor() {
      InOrdenEntradaDetalleLote lote = detalleLoteFake("L-001", 5);
      InOrdenEntradaDetalle detalle = detalleFake(5, 10); // factor 10
      detalle.setInOrdenDetalleLotes(new ArrayList<>(List.of(lote)));

      InOrdenEntrada saved = ordenFake(1);
      saved.setInOrdenDetalleList(List.of(detalle));

      prepareSaveWith(saved);

      service.save(ordenFake(null));

      @SuppressWarnings("unchecked")
      ArgumentCaptor<List<com.braintech.eFacturador.jpa.inventario.InMovimiento>> captor =
          ArgumentCaptor.forClass(List.class);
      verify(movimientoService).registrarTodos(captor.capture());

      assertThat(captor.getValue()).hasSize(1);
      assertThat(captor.getValue().get(0).getCantidad()).isEqualTo(50); // 5 lote × 10 factor
    }

    @Test
    @DisplayName("no genera movimiento para detalles con servicio=true")
    void generar_saltaServicio() {
      InOrdenEntradaDetalleLote lote = detalleLoteFake("L-SRV", 2);
      InOrdenEntradaDetalle servicio = detalleFake(2, null);
      servicio.setServicio(true);
      servicio.setInOrdenDetalleLotes(List.of(lote));

      InOrdenEntrada saved = ordenFake(1);
      saved.setInOrdenDetalleList(List.of(servicio));

      prepareSaveWith(saved);

      service.save(ordenFake(null));

      verify(movimientoService, never()).registrarTodos(any());
    }

    @Test
    @DisplayName("no genera movimiento cuando el detalle no tiene lotes")
    void generar_saltaDetalleSinLotes() {
      InOrdenEntradaDetalle detalle = detalleFake(3, null);
      detalle.setInOrdenDetalleLotes(Collections.emptyList());

      InOrdenEntrada saved = ordenFake(1);
      saved.setInOrdenDetalleList(List.of(detalle));

      prepareSaveWith(saved);

      service.save(ordenFake(null));

      verify(movimientoService, never()).registrarTodos(any());
    }

    @Test
    @DisplayName("no genera movimiento cuando el lote tiene cantidad <= 0")
    void generar_saltaLoteCantidadCero() {
      InOrdenEntradaDetalleLote lote = detalleLoteFake("L-CERO", 0);
      InOrdenEntradaDetalle detalle = detalleFake(0, null);
      detalle.setInOrdenDetalleLotes(new ArrayList<>(List.of(lote)));

      InOrdenEntrada saved = ordenFake(1);
      saved.setInOrdenDetalleList(List.of(detalle));

      prepareSaveWith(saved);

      service.save(ordenFake(null));

      verify(movimientoService, never()).registrarTodos(any());
    }

    @Test
    @DisplayName("no llama a registrarTodos cuando no hay movimientos válidos")
    void generar_noLlamaRegistrarTodos_listaVacia() {
      InOrdenEntrada saved = ordenFake(1);
      saved.setInOrdenDetalleList(Collections.emptyList());

      prepareSaveWith(saved);

      service.save(ordenFake(null));

      verify(movimientoService, never()).registrarTodos(any());
    }

    /** Prepara los mocks para que save() complete sin error y devuelva {@code saved}. */
    private void prepareSaveWith(InOrdenEntrada saved) {
      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inOrdenEntradaDao.save(any())).thenReturn(saved);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // findById()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("findById()")
  class FindById {

    @Test
    @DisplayName("retorna la orden cuando existe y pertenece a la empresa del JWT")
    void findById_encontrada() {
      when(inOrdenEntradaDao.findById(1, EMPRESA_ID)).thenReturn(Optional.of(ordenFake(1)));

      InOrdenEntrada result = service.findById(1);

      assertThat(result).isNotNull();
      assertThat(result.getId()).isEqualTo(1);
    }

    @Test
    @DisplayName("retorna null cuando el id no existe o es de otra empresa")
    void findById_noEncontrada_retornaNull() {
      when(inOrdenEntradaDao.findById(99, EMPRESA_ID)).thenReturn(Optional.empty());

      InOrdenEntrada result = service.findById(99);

      assertThat(result).isNull();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // findAll()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("findAll()")
  class FindAll {

    @Test
    @DisplayName("retorna todas las órdenes de la empresa del JWT")
    void findAll_retornaLista() {
      when(inOrdenEntradaDao.findAll(EMPRESA_ID)).thenReturn(List.of(ordenFake(1), ordenFake(2)));

      List<InOrdenEntrada> result = service.findAll();

      assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("retorna lista vacía cuando no hay órdenes")
    void findAll_sinDatos_listaVacia() {
      when(inOrdenEntradaDao.findAll(EMPRESA_ID)).thenReturn(Collections.emptyList());

      List<InOrdenEntrada> result = service.findAll();

      assertThat(result).isEmpty();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // disableById()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("disableById()")
  class DisableById {

    @Test
    @DisplayName("delega al DAO con el empresaId del JWT")
    void disableById_delegaAlDao() {
      service.disableById(1);

      verify(inOrdenEntradaDao).disableById(1, EMPRESA_ID);
    }

    @Test
    @DisplayName("nunca usa el empresaId del cliente")
    void disableById_usaEmpresaIdDelJwt() {
      service.disableById(7);

      verify(inOrdenEntradaDao).disableById(eq(7), eq(EMPRESA_ID));
      verify(inOrdenEntradaDao, never()).disableById(anyInt(), eq(999));
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // searchByCriteria()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("searchByCriteria()")
  class SearchByCriteria {

    @Test
    @DisplayName("retorna página de resultados pasando el empresaId del JWT al DAO")
    void search_retornaPagina() {
      InOrdenEntradaResumenDTO dto =
          new InOrdenEntradaResumenDTO(
              1, LocalDateTime.now(), "Almacén Central", BigDecimal.valueOf(1000), USERNAME, "ACT");
      Page<InOrdenEntradaResumenDTO> page = new PageImpl<>(List.of(dto));

      InOrdenEntradaSearchCriteria criteria = new InOrdenEntradaSearchCriteria();
      when(inOrdenEntradaDao.searchByCriteria(criteria, EMPRESA_ID)).thenReturn(page);

      Page<InOrdenEntradaResumenDTO> result = service.searchByCriteria(criteria);

      assertThat(result.getContent()).hasSize(1);
      verify(inOrdenEntradaDao).searchByCriteria(criteria, EMPRESA_ID);
    }

    @Test
    @DisplayName("retorna página vacía cuando no hay resultados")
    void search_sinResultados() {
      InOrdenEntradaSearchCriteria criteria = new InOrdenEntradaSearchCriteria();
      when(inOrdenEntradaDao.searchByCriteria(criteria, EMPRESA_ID)).thenReturn(Page.empty());

      Page<InOrdenEntradaResumenDTO> result = service.searchByCriteria(criteria);

      assertThat(result).isEmpty();
    }
  }
}
