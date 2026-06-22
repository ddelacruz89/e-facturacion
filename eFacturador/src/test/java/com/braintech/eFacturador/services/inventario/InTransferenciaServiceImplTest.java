package com.braintech.eFacturador.services.inventario;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.braintech.eFacturador.dao.inventario.InAlmacenDao;
import com.braintech.eFacturador.dao.inventario.InInventarioRepository;
import com.braintech.eFacturador.dao.inventario.InLoteDao;
import com.braintech.eFacturador.dao.inventario.InRequisicionDao;
import com.braintech.eFacturador.dao.inventario.InTransferenciaRepository;
import com.braintech.eFacturador.dao.producto.MgProductoRepository;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.inventario.InLoteStockItemDTO;
import com.braintech.eFacturador.dto.inventario.InProductoLotesStockDTO;
import com.braintech.eFacturador.dto.inventario.InTransferenciaDetalleRequestDTO;
import com.braintech.eFacturador.dto.inventario.InTransferenciaRequestDTO;
import com.braintech.eFacturador.exceptions.ApplicationException;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InMovimientoService;
import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import com.braintech.eFacturador.jpa.inventario.InInventario;
import com.braintech.eFacturador.jpa.inventario.InLote;
import com.braintech.eFacturador.jpa.inventario.InMovimiento;
import com.braintech.eFacturador.jpa.inventario.InRequisicion;
import com.braintech.eFacturador.jpa.inventario.InRequisicionDetalle;
import com.braintech.eFacturador.jpa.inventario.InTransferencia;
import com.braintech.eFacturador.jpa.inventario.InTransferenciaDetalle;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.producto.MgProductoUnidadSuplidor;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.util.TenantContext;
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
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class InTransferenciaServiceImplTest {

  @Mock private InTransferenciaRepository inTransferenciaRepository;
  @Mock private InRequisicionDao inRequisicionDao;
  @Mock private InAlmacenDao inAlmacenDao;
  @Mock private MgProductoRepository mgProductoRepository;
  @Mock private InInventarioRepository inInventarioRepository;
  @Mock private InLoteDao inLoteDao;
  @Mock private SgSucursalRepository sgSucursalRepository;
  @Mock private InMovimientoService movimientoService;
  @Mock private TenantContext tenantContext;

  @InjectMocks private InTransferenciaServiceImpl service;

  private static final Integer EMPRESA_ID = 1;
  private static final Integer SUCURSAL_ID = 10;
  private static final String USERNAME = "tester";
  private static final Integer ALMACEN_ORIGEN = 100;
  private static final Integer ALMACEN_DESTINO = 200;
  private static final Integer PRODUCTO_ID = 99;

  @BeforeEach
  void configurarTenant() {
    lenient().when(tenantContext.getCurrentEmpresaId()).thenReturn(EMPRESA_ID);
    lenient().when(tenantContext.getCurrentSucursalId()).thenReturn(SUCURSAL_ID);
    lenient().when(tenantContext.getCurrentUsername()).thenReturn(USERNAME);
  }

  // ─── Factories ──────────────────────────────────────────────────────────────

  private InAlmacen almacenFake(Integer id) {
    InAlmacen a = new InAlmacen();
    a.setId(id);
    return a;
  }

  private MgProducto productoFake(Integer id) {
    MgProducto p = new MgProducto();
    p.setId(id);
    p.setUnidadProductorSuplidor(new ArrayList<>());
    return p;
  }

  private InInventario inventarioFake(Integer cantidad) {
    InInventario i = new InInventario();
    i.setCantidad(cantidad);
    return i;
  }

  private InTransferenciaDetalleRequestDTO detalleDTOFake(
      Integer productoId, int cant, String lote) {
    InTransferenciaDetalleRequestDTO d = new InTransferenciaDetalleRequestDTO();
    d.setProductoId(productoId);
    d.setCant(cant);
    d.setLote(lote);
    return d;
  }

  private InTransferenciaRequestDTO requestFake(Integer origenId, Integer destinoId) {
    InTransferenciaRequestDTO r = new InTransferenciaRequestDTO();
    r.setOrigenAlmacenId(origenId);
    r.setDestinoAlmacenId(destinoId);
    r.setEstadoId("PEN");
    r.setDetalles(new ArrayList<>());
    return r;
  }

  private InTransferencia transferenciaGuardadaFake(Integer id) {
    InTransferencia t = new InTransferencia();
    t.setId(id);
    t.setEmpresaId(EMPRESA_ID);
    t.setEstadoId("PEN");
    t.setOrigenAlmacenId(almacenFake(ALMACEN_ORIGEN));
    t.setDestinoAlmacenId(almacenFake(ALMACEN_DESTINO));
    t.setDetalles(new ArrayList<>());
    return t;
  }

  /** Prepara los mocks mínimos para que create() llegue a inTransferenciaRepository.save(). */
  private void prepararAlmacenesYSave(InTransferencia respuesta) {
    when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
        .thenReturn(Optional.of(almacenFake(ALMACEN_ORIGEN)));
    when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_DESTINO, EMPRESA_ID))
        .thenReturn(Optional.of(almacenFake(ALMACEN_DESTINO)));
    when(inTransferenciaRepository.save(any())).thenReturn(respuesta);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // create()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("create()")
  class Create {

    @Test
    @DisplayName("guarda la transferencia y retorna OK cuando los datos son válidos")
    void create_happyPath() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      prepararAlmacenesYSave(transferenciaGuardadaFake(1));

      Response<?> resp = service.create(req);

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
      verify(inTransferenciaRepository).save(any());
    }

    @Test
    @DisplayName("lanza ApplicationException cuando origen y destino son el mismo almacén")
    void create_almacenesIguales_lanzaExcepcion() {
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ORIGEN)));

      assertThatThrownBy(() -> service.create(requestFake(ALMACEN_ORIGEN, ALMACEN_ORIGEN)))
          .isInstanceOf(ApplicationException.class)
          .hasMessageContaining("mismo");
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando el almacén origen no existe")
    void create_origenNoEncontrado() {
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
          .thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.create(requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO)))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("origen");
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando el almacén destino no existe")
    void create_destinoNoEncontrado() {
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ORIGEN)));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_DESTINO, EMPRESA_ID))
          .thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.create(requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO)))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("destino");
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando el producto de un detalle no existe")
    void create_productoNoEncontrado() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 5, null));

      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ORIGEN)));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_DESTINO, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_DESTINO)));
      when(mgProductoRepository.findByIdAndEmpresaId(PRODUCTO_ID, EMPRESA_ID))
          .thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.create(req))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining(String.valueOf(PRODUCTO_ID));
    }

    @Test
    @DisplayName("cant = cantSolicitada cuando el stock es suficiente")
    void create_cantIgualASolicitada_cuandoStockSuficiente() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 5, null));

      prepararAlmacenesYSave(transferenciaGuardadaFake(1));
      when(mgProductoRepository.findByIdAndEmpresaId(PRODUCTO_ID, EMPRESA_ID))
          .thenReturn(Optional.of(productoFake(PRODUCTO_ID)));
      when(inInventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ORIGEN, EMPRESA_ID, SUCURSAL_ID, null))
          .thenReturn(Optional.of(inventarioFake(10))); // stock 10 >= solicitado 5

      service.create(req);

      ArgumentCaptor<InTransferencia> captor = ArgumentCaptor.forClass(InTransferencia.class);
      verify(inTransferenciaRepository).save(captor.capture());
      assertThat(captor.getValue().getDetalles().get(0).getCant()).isEqualTo(5);
      assertThat(captor.getValue().getDetalles().get(0).getCantSolicitada()).isEqualTo(5);
    }

    @Test
    @DisplayName("cant se ajusta al stock disponible cuando hay stock insuficiente")
    void create_cantAjustadaAlStock_cuandoStockInsuficiente() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 10, null)); // pide 10

      prepararAlmacenesYSave(transferenciaGuardadaFake(1));
      when(mgProductoRepository.findByIdAndEmpresaId(PRODUCTO_ID, EMPRESA_ID))
          .thenReturn(Optional.of(productoFake(PRODUCTO_ID)));
      when(inInventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ORIGEN, EMPRESA_ID, SUCURSAL_ID, null))
          .thenReturn(Optional.of(inventarioFake(3))); // solo hay 3

      service.create(req);

      ArgumentCaptor<InTransferencia> captor = ArgumentCaptor.forClass(InTransferencia.class);
      verify(inTransferenciaRepository).save(captor.capture());
      InTransferenciaDetalle detalle = captor.getValue().getDetalles().get(0);
      assertThat(detalle.getCant()).isEqualTo(3); // transferido = stock real
      assertThat(detalle.getCantSolicitada()).isEqualTo(10); // original conservado
    }

    @Test
    @DisplayName("cant es 0 cuando el stock es cero")
    void create_cant_cero_cuandoSinStock() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 5, null));

      prepararAlmacenesYSave(transferenciaGuardadaFake(1));
      when(mgProductoRepository.findByIdAndEmpresaId(PRODUCTO_ID, EMPRESA_ID))
          .thenReturn(Optional.of(productoFake(PRODUCTO_ID)));
      when(inInventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ORIGEN, EMPRESA_ID, SUCURSAL_ID, null))
          .thenReturn(Optional.empty()); // sin inventario

      service.create(req);

      ArgumentCaptor<InTransferencia> captor = ArgumentCaptor.forClass(InTransferencia.class);
      verify(inTransferenciaRepository).save(captor.capture());
      assertThat(captor.getValue().getDetalles().get(0).getCant()).isEqualTo(0);
    }

    @Test
    @DisplayName("estadoId por defecto es 'PEN' cuando el DTO lo envía null")
    void create_estadoPorDefecto_PEN() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.setEstadoId(null);

      prepararAlmacenesYSave(transferenciaGuardadaFake(1));

      service.create(req);

      ArgumentCaptor<InTransferencia> captor = ArgumentCaptor.forClass(InTransferencia.class);
      verify(inTransferenciaRepository).save(captor.capture());
      assertThat(captor.getValue().getEstadoId()).isEqualTo("PEN");
    }

    @Test
    @DisplayName("empresaId y username siempre vienen del JWT, no del cliente")
    void create_tenantDesdeJwt() {
      prepararAlmacenesYSave(transferenciaGuardadaFake(1));

      service.create(requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO));

      ArgumentCaptor<InTransferencia> captor = ArgumentCaptor.forClass(InTransferencia.class);
      verify(inTransferenciaRepository).save(captor.capture());
      assertThat(captor.getValue().getEmpresaId()).isEqualTo(EMPRESA_ID);
      assertThat(captor.getValue().getUsuarioReg()).isEqualTo(USERNAME);
    }

    @Test
    @DisplayName(
        "genera movimiento de salida (tipo 3, negativo) y entrada (tipo 2, positivo) por detalle")
    void create_generaMovimientosParaCadaDetalle() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 5, null));

      InTransferencia saved = transferenciaGuardadaFake(42);
      InTransferenciaDetalle det = new InTransferenciaDetalle();
      det.setProductoId(productoFake(PRODUCTO_ID));
      det.setCant(5);
      det.setLote(null);
      saved.setDetalles(List.of(det));

      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ORIGEN)));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_DESTINO, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_DESTINO)));
      when(mgProductoRepository.findByIdAndEmpresaId(PRODUCTO_ID, EMPRESA_ID))
          .thenReturn(Optional.of(productoFake(PRODUCTO_ID)));
      when(inInventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ORIGEN, EMPRESA_ID, SUCURSAL_ID, null))
          .thenReturn(Optional.of(inventarioFake(10)));
      when(inTransferenciaRepository.save(any())).thenReturn(saved);

      service.create(req);

      @SuppressWarnings("unchecked")
      ArgumentCaptor<List<InMovimiento>> captor = ArgumentCaptor.forClass(List.class);
      verify(movimientoService).registrarTodos(captor.capture());
      List<InMovimiento> movimientos = captor.getValue();

      assertThat(movimientos).hasSize(2);

      InMovimiento salida =
          movimientos.stream().filter(m -> m.getCantidad() < 0).findFirst().orElseThrow();
      assertThat(salida.getTipoMovimientoId()).isEqualTo(3);
      assertThat(salida.getAlmacenId()).isEqualTo(ALMACEN_ORIGEN);
      assertThat(salida.getCantidad()).isEqualTo(-5);

      InMovimiento entrada =
          movimientos.stream().filter(m -> m.getCantidad() > 0).findFirst().orElseThrow();
      assertThat(entrada.getTipoMovimientoId()).isEqualTo(2);
      assertThat(entrada.getAlmacenId()).isEqualTo(ALMACEN_DESTINO);
      assertThat(entrada.getCantidad()).isEqualTo(5);
    }

    @Test
    @DisplayName("los movimientos llevan el id de la transferencia guardada como referencia")
    void create_movimientosConNumeroReferencia() {
      InTransferencia saved = transferenciaGuardadaFake(77);
      InTransferenciaDetalle det = new InTransferenciaDetalle();
      det.setProductoId(productoFake(PRODUCTO_ID));
      det.setCant(3);
      det.setLote(null);
      saved.setDetalles(List.of(det));

      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ORIGEN)));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_DESTINO, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_DESTINO)));
      when(inTransferenciaRepository.save(any())).thenReturn(saved);

      service.create(requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO));

      @SuppressWarnings("unchecked")
      ArgumentCaptor<List<InMovimiento>> captor = ArgumentCaptor.forClass(List.class);
      verify(movimientoService).registrarTodos(captor.capture());
      captor.getValue().forEach(m -> assertThat(m.getNumeroReferencia()).isEqualTo(77));
    }

    @Test
    @DisplayName("detalles con cant=0 o null no generan movimiento")
    void create_noMovimientoCuandoCantCero() {
      InTransferencia saved = transferenciaGuardadaFake(1);
      InTransferenciaDetalle det = new InTransferenciaDetalle();
      det.setProductoId(productoFake(PRODUCTO_ID));
      det.setCant(0); // sin stock
      saved.setDetalles(List.of(det));

      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ORIGEN)));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_DESTINO, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_DESTINO)));
      when(inTransferenciaRepository.save(any())).thenReturn(saved);

      service.create(requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO));

      verify(movimientoService, never()).registrarTodos(any());
    }

    @Test
    @DisplayName("lote en blanco se trata como null en los movimientos")
    void create_loteEnBlanco_tratadoComoNull() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 3, "  ")); // lote en blanco

      InTransferencia saved = transferenciaGuardadaFake(1);
      InTransferenciaDetalle det = new InTransferenciaDetalle();
      det.setProductoId(productoFake(PRODUCTO_ID));
      det.setCant(3);
      det.setLote("  ");
      saved.setDetalles(List.of(det));

      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ORIGEN)));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_DESTINO, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_DESTINO)));
      when(mgProductoRepository.findByIdAndEmpresaId(PRODUCTO_ID, EMPRESA_ID))
          .thenReturn(Optional.of(productoFake(PRODUCTO_ID)));
      when(inInventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ORIGEN, EMPRESA_ID, SUCURSAL_ID, null))
          .thenReturn(Optional.of(inventarioFake(10)));
      when(inTransferenciaRepository.save(any())).thenReturn(saved);

      service.create(req);

      @SuppressWarnings("unchecked")
      ArgumentCaptor<List<InMovimiento>> captor = ArgumentCaptor.forClass(List.class);
      verify(movimientoService).registrarTodos(captor.capture());
      // El lote en los movimientos debe ser null (no el string en blanco)
      captor.getValue().forEach(m -> assertThat(m.getLote()).isNull());
    }

    @Test
    @DisplayName("con requisicionId: completa la requisición origen tras guardar")
    void create_conRequisicionId_completaRequisicion() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.setRequisicionId(55);

      InRequisicion req55 = new InRequisicion();
      req55.setDetalles(new ArrayList<>());

      prepararAlmacenesYSave(transferenciaGuardadaFake(1));
      when(inRequisicionDao.findById(55, EMPRESA_ID)).thenReturn(Optional.of(req55));

      service.create(req);

      verify(inRequisicionDao).findById(55, EMPRESA_ID);
      assertThat(req55.getEstadoId()).isEqualTo("COM");
      verify(inRequisicionDao).save(req55);
    }

    @Test
    @DisplayName("sin requisicionId: inRequisicionDao nunca es consultado")
    void create_sinRequisicionId_noTocaRequisicion() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.setRequisicionId(null);

      prepararAlmacenesYSave(transferenciaGuardadaFake(1));

      service.create(req);

      verify(inRequisicionDao, never()).findById(any(), any());
    }

    @Test
    @DisplayName("completarRequisicion: acumula cant por producto y actualiza cantidadAprobada")
    void create_completarRequisicion_acumulaCantidades() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.setRequisicionId(10);

      // Detalle 1: producto 99, cant 3
      InTransferenciaDetalle det1 = new InTransferenciaDetalle();
      det1.setProductoId(productoFake(PRODUCTO_ID));
      det1.setCant(3);

      // Detalle 2: mismo producto 99, cant 2 (acumula a 5)
      InTransferenciaDetalle det2 = new InTransferenciaDetalle();
      det2.setProductoId(productoFake(PRODUCTO_ID));
      det2.setCant(2);

      InTransferencia saved = transferenciaGuardadaFake(1);
      saved.setDetalles(List.of(det1, det2));

      InRequisicionDetalle detReq = new InRequisicionDetalle();
      detReq.setProductoId(PRODUCTO_ID);
      InRequisicion requisicion = new InRequisicion();
      requisicion.setDetalles(new ArrayList<>(List.of(detReq)));

      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ORIGEN)));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_DESTINO, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_DESTINO)));
      when(inTransferenciaRepository.save(any())).thenReturn(saved);
      when(inRequisicionDao.findById(10, EMPRESA_ID)).thenReturn(Optional.of(requisicion));

      service.create(req);

      assertThat(detReq.getCantidadAprobada()).isEqualByComparingTo("5");
    }

    @Test
    @DisplayName("completarRequisicion: requisición no encontrada no lanza error")
    void create_completarRequisicion_gracefulCuandoNoExiste() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.setRequisicionId(999);

      prepararAlmacenesYSave(transferenciaGuardadaFake(1));
      when(inRequisicionDao.findById(999, EMPRESA_ID)).thenReturn(Optional.empty());

      // No debe lanzar excepción
      assertThat(service.create(req).status()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("detalle con cant=0 no contribuye al acumulado de cantidadAprobada")
    void create_completarRequisicion_ignoraDetallesCantCero() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.setRequisicionId(10);

      InTransferenciaDetalle detCero = new InTransferenciaDetalle();
      detCero.setProductoId(productoFake(PRODUCTO_ID));
      detCero.setCant(0);

      InTransferencia saved = transferenciaGuardadaFake(1);
      saved.setDetalles(List.of(detCero));

      InRequisicionDetalle detReq = new InRequisicionDetalle();
      detReq.setProductoId(PRODUCTO_ID);
      InRequisicion requisicion = new InRequisicion();
      requisicion.setDetalles(new ArrayList<>(List.of(detReq)));

      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ORIGEN)));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_DESTINO, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_DESTINO)));
      when(inTransferenciaRepository.save(any())).thenReturn(saved);
      when(inRequisicionDao.findById(10, EMPRESA_ID)).thenReturn(Optional.of(requisicion));

      service.create(req);

      // cantidadAprobada no debe haber sido seteada
      assertThat(detReq.getCantidadAprobada()).isNull();
    }

    @Test
    @DisplayName("resolveLote: busca lote existente y NO crea uno nuevo")
    void create_resolveLote_lotteExistente_noCreaNuevo() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 5, "LOTE-X"));

      prepararAlmacenesYSave(transferenciaGuardadaFake(1));
      when(mgProductoRepository.findByIdAndEmpresaId(PRODUCTO_ID, EMPRESA_ID))
          .thenReturn(Optional.of(productoFake(PRODUCTO_ID)));
      when(inInventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ORIGEN, EMPRESA_ID, SUCURSAL_ID, "LOTE-X"))
          .thenReturn(Optional.of(inventarioFake(10)));
      when(inLoteDao.findById("LOTE-X", (long) PRODUCTO_ID, EMPRESA_ID, SUCURSAL_ID))
          .thenReturn(Optional.of(new InLote())); // ya existe

      service.create(req);

      verify(inLoteDao, never()).save(any());
    }

    @Test
    @DisplayName("resolveLote: crea lote nuevo con datos del tenant cuando no existe")
    void create_resolveLote_loteNuevo_creaConTenant() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 5, "LOTE-NUEVO"));

      prepararAlmacenesYSave(transferenciaGuardadaFake(1));
      when(mgProductoRepository.findByIdAndEmpresaId(PRODUCTO_ID, EMPRESA_ID))
          .thenReturn(Optional.of(productoFake(PRODUCTO_ID)));
      when(inInventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ORIGEN, EMPRESA_ID, SUCURSAL_ID, "LOTE-NUEVO"))
          .thenReturn(Optional.of(inventarioFake(10)));
      when(inLoteDao.findById("LOTE-NUEVO", (long) PRODUCTO_ID, EMPRESA_ID, SUCURSAL_ID))
          .thenReturn(Optional.empty());
      when(sgSucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(new SgSucursal()));
      when(inLoteDao.save(any())).thenReturn(new InLote());

      service.create(req);

      ArgumentCaptor<InLote> captor = ArgumentCaptor.forClass(InLote.class);
      verify(inLoteDao).save(captor.capture());
      assertThat(captor.getValue().getLote()).isEqualTo("LOTE-NUEVO");
      assertThat(captor.getValue().getEmpresaId()).isEqualTo(EMPRESA_ID);
      assertThat(captor.getValue().getUsuarioReg()).isEqualTo(USERNAME);
      assertThat(captor.getValue().getEstadoId()).isEqualTo("ACT");
    }

    @Test
    @DisplayName("detalle sin lote: inLoteDao nunca es consultado")
    void create_sinLote_noLlamadoLoteDao() {
      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 5, null)); // sin lote

      prepararAlmacenesYSave(transferenciaGuardadaFake(1));
      when(mgProductoRepository.findByIdAndEmpresaId(PRODUCTO_ID, EMPRESA_ID))
          .thenReturn(Optional.of(productoFake(PRODUCTO_ID)));
      when(inInventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ORIGEN, EMPRESA_ID, SUCURSAL_ID, null))
          .thenReturn(Optional.of(inventarioFake(10)));

      service.create(req);

      verify(inLoteDao, never()).findById(any(), anyLong(), anyInt(), anyInt());
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // update()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("update()")
  class Update {

    @Test
    @DisplayName("actualiza almacenes y retorna OK cuando los datos son válidos")
    void update_happyPath() {
      InTransferencia existing = transferenciaGuardadaFake(1);

      when(inTransferenciaRepository.findByIdAndEmpresaId(1, EMPRESA_ID))
          .thenReturn(Optional.of(existing));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ORIGEN)));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_DESTINO, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_DESTINO)));
      when(inTransferenciaRepository.save(any())).thenReturn(existing);

      Response<?> resp = service.update(1, requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO));

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
      verify(inTransferenciaRepository).save(existing);
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando la transferencia no existe")
    void update_noEncontrada() {
      when(inTransferenciaRepository.findByIdAndEmpresaId(99, EMPRESA_ID))
          .thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.update(99, requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO)))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("Transferencia");
    }

    @Test
    @DisplayName("lanza ApplicationException cuando origen y destino son el mismo almacén")
    void update_almacenesIguales() {
      when(inTransferenciaRepository.findByIdAndEmpresaId(1, EMPRESA_ID))
          .thenReturn(Optional.of(transferenciaGuardadaFake(1)));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ORIGEN)));

      assertThatThrownBy(() -> service.update(1, requestFake(ALMACEN_ORIGEN, ALMACEN_ORIGEN)))
          .isInstanceOf(ApplicationException.class);
    }

    @Test
    @DisplayName("estadoId null no cambia el estado existente")
    void update_estadoNull_noModificaEstado() {
      InTransferencia existing = transferenciaGuardadaFake(1);
      existing.setEstadoId("PEN");

      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.setEstadoId(null);

      when(inTransferenciaRepository.findByIdAndEmpresaId(1, EMPRESA_ID))
          .thenReturn(Optional.of(existing));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ORIGEN)));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_DESTINO, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_DESTINO)));
      when(inTransferenciaRepository.save(any())).thenReturn(existing);

      service.update(1, req);

      assertThat(existing.getEstadoId()).isEqualTo("PEN"); // sin cambios
    }

    @Test
    @DisplayName("detalles null en el DTO no borra los detalles existentes")
    void update_detallesNull_conservaDetallesExistentes() {
      InTransferenciaDetalle detalleExistente = new InTransferenciaDetalle();
      InTransferencia existing = transferenciaGuardadaFake(1);
      existing.setDetalles(new ArrayList<>(List.of(detalleExistente)));

      InTransferenciaRequestDTO req = requestFake(ALMACEN_ORIGEN, ALMACEN_DESTINO);
      req.setDetalles(null);

      when(inTransferenciaRepository.findByIdAndEmpresaId(1, EMPRESA_ID))
          .thenReturn(Optional.of(existing));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ORIGEN, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ORIGEN)));
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_DESTINO, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_DESTINO)));
      when(inTransferenciaRepository.save(any())).thenReturn(existing);

      service.update(1, req);

      assertThat(existing.getDetalles()).hasSize(1);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // getById()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("getById()")
  class GetById {

    @Test
    @DisplayName("retorna OK con la transferencia cuando existe")
    void getById_encontrada() {
      when(inTransferenciaRepository.findByIdAndEmpresaId(1, EMPRESA_ID))
          .thenReturn(Optional.of(transferenciaGuardadaFake(1)));

      Response<?> resp = service.getById(1);

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
      assertThat(resp.content()).isInstanceOf(InTransferencia.class);
    }

    @Test
    @DisplayName("retorna NOT_FOUND cuando no existe o es de otra empresa")
    void getById_noEncontrada() {
      when(inTransferenciaRepository.findByIdAndEmpresaId(99, EMPRESA_ID))
          .thenReturn(Optional.empty());

      assertThat(service.getById(99).status()).isEqualTo(HttpStatus.NOT_FOUND);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // getAll() / getAllActive()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("getAll() / getAllActive()")
  class GetAll {

    @Test
    @DisplayName("getAll retorna OK cuando hay transferencias")
    void getAll_conDatos() {
      when(inTransferenciaRepository.findAllByEmpresaId(EMPRESA_ID))
          .thenReturn(List.of(transferenciaGuardadaFake(1)));
      assertThat(service.getAll().status()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("getAll retorna NOT_FOUND cuando no hay transferencias")
    void getAll_sinDatos() {
      when(inTransferenciaRepository.findAllByEmpresaId(EMPRESA_ID))
          .thenReturn(Collections.emptyList());
      assertThat(service.getAll().status()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("getAllActive retorna OK cuando hay transferencias activas")
    void getAllActive_conDatos() {
      when(inTransferenciaRepository.findAllActiveByEmpresaId(EMPRESA_ID))
          .thenReturn(List.of(transferenciaGuardadaFake(1)));
      assertThat(service.getAllActive().status()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("getAllActive retorna NOT_FOUND cuando no hay transferencias activas")
    void getAllActive_sinDatos() {
      when(inTransferenciaRepository.findAllActiveByEmpresaId(EMPRESA_ID))
          .thenReturn(Collections.emptyList());
      assertThat(service.getAllActive().status()).isEqualTo(HttpStatus.NOT_FOUND);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // disable()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("disable()")
  class Disable {

    @Test
    @DisplayName("cambia estadoId a 'INA' y retorna OK")
    void disable_inactivaTransferencia() {
      InTransferencia existing = transferenciaGuardadaFake(1);
      existing.setEstadoId("PEN");

      when(inTransferenciaRepository.findByIdAndEmpresaId(1, EMPRESA_ID))
          .thenReturn(Optional.of(existing));
      when(inTransferenciaRepository.save(any())).thenReturn(existing);

      Response<?> resp = service.disable(1);

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
      assertThat(existing.getEstadoId()).isEqualTo("INA");
      verify(inTransferenciaRepository).save(existing);
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando la transferencia no existe")
    void disable_noEncontrada() {
      when(inTransferenciaRepository.findByIdAndEmpresaId(99, EMPRESA_ID))
          .thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.disable(99))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("Transferencia");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // getStockProductoEnAlmacen()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("getStockProductoEnAlmacen()")
  class GetStockProductoEnAlmacen {

    @Test
    @DisplayName("retorna mapa con productoId, almacenId y cantidad correcta")
    void retornaStockEnMapa() {
      when(inInventarioRepository.findByProductoAndAlmacen(
              PRODUCTO_ID, ALMACEN_ORIGEN, EMPRESA_ID, SUCURSAL_ID))
          .thenReturn(Optional.of(inventarioFake(42)));

      Response<?> resp = service.getStockProductoEnAlmacen(PRODUCTO_ID, ALMACEN_ORIGEN);

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
      @SuppressWarnings("unchecked")
      var mapa = (java.util.Map<String, Object>) resp.content();
      assertThat(mapa.get("productoId")).isEqualTo(PRODUCTO_ID);
      assertThat(mapa.get("almacenId")).isEqualTo(ALMACEN_ORIGEN);
      assertThat(mapa.get("cantidad")).isEqualTo(42);
    }

    @Test
    @DisplayName("retorna cantidad=0 cuando no hay inventario registrado")
    void retornaCeroCuandoSinInventario() {
      when(inInventarioRepository.findByProductoAndAlmacen(
              PRODUCTO_ID, ALMACEN_ORIGEN, EMPRESA_ID, SUCURSAL_ID))
          .thenReturn(Optional.empty());

      Response<?> resp = service.getStockProductoEnAlmacen(PRODUCTO_ID, ALMACEN_ORIGEN);

      @SuppressWarnings("unchecked")
      var mapa = (java.util.Map<String, Object>) resp.content();
      assertThat(mapa.get("cantidad")).isEqualTo(0);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // getLotesConStockEnAlmacen()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("getLotesConStockEnAlmacen()")
  class GetLotesConStockEnAlmacen {

    @Test
    @DisplayName("retorna total como suma de todos los lotes")
    void retornaTotal_sumaDeLotes() {
      List<InLoteStockItemDTO> lotes =
          List.of(new InLoteStockItemDTO("L1", 10), new InLoteStockItemDTO("L2", 5));

      when(inInventarioRepository.findLotesConStockByProductoAndAlmacen(
              PRODUCTO_ID, ALMACEN_ORIGEN, EMPRESA_ID, SUCURSAL_ID))
          .thenReturn(lotes);
      when(mgProductoRepository.findById(PRODUCTO_ID)).thenReturn(Optional.empty());

      InProductoLotesStockDTO result =
          service.getLotesConStockEnAlmacen(PRODUCTO_ID, ALMACEN_ORIGEN);

      assertThat(result.getTotalDisponible()).isEqualTo(15);
      assertThat(result.getLotes()).hasSize(2);
    }

    @Test
    @DisplayName("totalDisponible es 0 cuando no hay lotes con stock")
    void totalCero_cuandoSinLotes() {
      when(inInventarioRepository.findLotesConStockByProductoAndAlmacen(
              PRODUCTO_ID, ALMACEN_ORIGEN, EMPRESA_ID, SUCURSAL_ID))
          .thenReturn(Collections.emptyList());
      when(mgProductoRepository.findById(PRODUCTO_ID)).thenReturn(Optional.empty());

      InProductoLotesStockDTO result =
          service.getLotesConStockEnAlmacen(PRODUCTO_ID, ALMACEN_ORIGEN);

      assertThat(result.getTotalDisponible()).isEqualTo(0);
    }

    @Test
    @DisplayName("cuando el producto tiene unidades, las copia al DTO")
    void unidadesProductoCopiadasAlDTO() {
      MgProductoUnidadSuplidor unidad = mock(MgProductoUnidadSuplidor.class);
      com.braintech.eFacturador.jpa.producto.MgUnidad unidadBase =
          mock(com.braintech.eFacturador.jpa.producto.MgUnidad.class);
      com.braintech.eFacturador.jpa.producto.MgUnidad unidadFraccion =
          mock(com.braintech.eFacturador.jpa.producto.MgUnidad.class);

      when(unidad.getUnidadId()).thenReturn(unidadBase);
      when(unidad.getUnidadFraccionId()).thenReturn(unidadFraccion);
      when(unidad.getCantidad()).thenReturn(10);
      when(unidadBase.getNombre()).thenReturn("Caja");
      when(unidadBase.getSigla()).thenReturn("CJ");
      when(unidadFraccion.getNombre()).thenReturn("Unidad");
      when(unidadFraccion.getSigla()).thenReturn("UN");

      MgProducto producto = productoFake(PRODUCTO_ID);
      producto.setUnidadProductorSuplidor(List.of(unidad));

      when(inInventarioRepository.findLotesConStockByProductoAndAlmacen(
              PRODUCTO_ID, ALMACEN_ORIGEN, EMPRESA_ID, SUCURSAL_ID))
          .thenReturn(Collections.emptyList());
      when(mgProductoRepository.findById(PRODUCTO_ID)).thenReturn(Optional.of(producto));

      InProductoLotesStockDTO result =
          service.getLotesConStockEnAlmacen(PRODUCTO_ID, ALMACEN_ORIGEN);

      assertThat(result.getUnidadNombre()).isEqualTo("Caja");
      assertThat(result.getUnidadSigla()).isEqualTo("CJ");
      assertThat(result.getUnidadFraccionNombre()).isEqualTo("Unidad");
      assertThat(result.getUnidadFraccionSigla()).isEqualTo("UN");
      assertThat(result.getCantidadUnidad()).isEqualTo(10);
    }

    @Test
    @DisplayName("cuando el producto no tiene unidades, los campos de unidad quedan null")
    void sinUnidades_camposUnidadNull() {
      when(inInventarioRepository.findLotesConStockByProductoAndAlmacen(
              PRODUCTO_ID, ALMACEN_ORIGEN, EMPRESA_ID, SUCURSAL_ID))
          .thenReturn(Collections.emptyList());
      when(mgProductoRepository.findById(PRODUCTO_ID))
          .thenReturn(Optional.of(productoFake(PRODUCTO_ID))); // lista vacía

      InProductoLotesStockDTO result =
          service.getLotesConStockEnAlmacen(PRODUCTO_ID, ALMACEN_ORIGEN);

      assertThat(result.getUnidadNombre()).isNull();
      assertThat(result.getCantidadUnidad()).isNull();
    }
  }
}
