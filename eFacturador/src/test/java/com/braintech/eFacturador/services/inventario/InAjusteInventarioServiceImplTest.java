package com.braintech.eFacturador.services.inventario;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.braintech.eFacturador.dao.inventario.InAjusteInventarioDao;
import com.braintech.eFacturador.dao.inventario.InInventarioRepository;
import com.braintech.eFacturador.dao.inventario.InMovimientoTipoRepository;
import com.braintech.eFacturador.dao.producto.MgProductoRepository;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.inventario.InAjusteInventarioDetalleRequestDTO;
import com.braintech.eFacturador.dto.inventario.InAjusteInventarioRequestDTO;
import com.braintech.eFacturador.dto.inventario.InAjusteInventarioResumenDTO;
import com.braintech.eFacturador.dto.inventario.InAjusteInventarioSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InStockActualDTO;
import com.braintech.eFacturador.exceptions.ApplicationException;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.interfaces.inventario.InMovimientoService;
import com.braintech.eFacturador.jpa.inventario.InAjusteInventario;
import com.braintech.eFacturador.jpa.inventario.InInventario;
import com.braintech.eFacturador.jpa.inventario.InMovimiento;
import com.braintech.eFacturador.jpa.inventario.InMovimientoTipo;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.util.TenantContext;
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
class InAjusteInventarioServiceImplTest {

  @Mock private InAjusteInventarioDao ajusteDao;
  @Mock private InInventarioRepository inventarioRepository;
  @Mock private InMovimientoTipoRepository movimientoTipoRepository;
  @Mock private InMovimientoService movimientoService;
  @Mock private MgProductoRepository productoRepository;
  @Mock private SgSucursalRepository sucursalRepository;
  @Mock private TenantContext tenantContext;

  @InjectMocks private InAjusteInventarioServiceImpl service;

  private static final Integer EMPRESA_ID = 1;
  private static final Integer SUCURSAL_ID = 10;
  private static final String USERNAME = "testuser";
  private static final Integer ALMACEN_ID = 20;
  private static final Integer PRODUCTO_ID = 99;
  private static final Integer TIPO_MOV_CREDITO = 4; // cr=true
  private static final Integer TIPO_MOV_DEBITO = 5; // cr=false
  private static final Integer TIPO_MOV_DEFAULT = 3; // fallback cuando movimientoTipoId es null

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

  private InMovimientoTipo tipoFake(Integer id, boolean cr) {
    InMovimientoTipo t = new InMovimientoTipo();
    t.setId(id);
    t.setTipoMovimiento(cr ? "Ajuste Positivo" : "Ajuste Negativo");
    t.setCr(cr);
    return t;
  }

  private InInventario inventarioFake(Integer cantidad) {
    InInventario i = new InInventario();
    i.setCantidad(cantidad);
    return i;
  }

  private MgProducto productoFake(Integer id) {
    MgProducto p = new MgProducto();
    p.setId(id);
    p.setNombreProducto("Producto " + id);
    return p;
  }

  private InAjusteInventario ajusteGuardadoFake(Integer id) {
    InAjusteInventario a = new InAjusteInventario();
    a.setId(id);
    a.setEmpresaId(EMPRESA_ID);
    a.setAlmacenId(ALMACEN_ID);
    a.setEstadoId("APL");
    a.setDetalles(new ArrayList<>());
    return a;
  }

  private InAjusteInventarioDetalleRequestDTO detalleDTOFake(
      Integer productoId, Integer cantidadNueva, String lote) {
    InAjusteInventarioDetalleRequestDTO d = new InAjusteInventarioDetalleRequestDTO();
    d.setProductoId(productoId);
    d.setCantidadNueva(cantidadNueva);
    d.setLote(lote);
    return d;
  }

  private InAjusteInventarioRequestDTO requestFake(Integer tipoId) {
    InAjusteInventarioRequestDTO r = new InAjusteInventarioRequestDTO();
    r.setAlmacenId(ALMACEN_ID);
    r.setMovimientoTipoId(tipoId);
    r.setObservacion("Ajuste de prueba");
    r.setDetalles(new ArrayList<>());
    return r;
  }

  /** Prepara los mocks base para que aplicar() pase la fase de validación inicial. */
  private void prepararSucursalYTipo(Integer tipoId, boolean cr) {
    when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
    when(movimientoTipoRepository.findById(tipoId)).thenReturn(Optional.of(tipoFake(tipoId, cr)));
  }

  private void prepararInventario(Integer productoId, String lote, Integer cantidad) {
    when(inventarioRepository.findByProductoAlmacenLote(
            productoId, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID, lote))
        .thenReturn(Optional.of(inventarioFake(cantidad)));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // aplicar()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("aplicar()")
  class Aplicar {

    @Test
    @DisplayName("happy path cr=true: aumenta stock y retorna el ajuste guardado")
    void aplicar_creditoAumentaStock() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_CREDITO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 120, null)); // stock actual=100 → +20

      InAjusteInventario saved = ajusteGuardadoFake(1);
      prepararSucursalYTipo(TIPO_MOV_CREDITO, true);
      prepararInventario(PRODUCTO_ID, null, 100);
      when(ajusteDao.save(any())).thenReturn(saved);

      InAjusteInventario result = service.aplicar(req);

      assertThat(result).isNotNull();
      assertThat(result.getId()).isEqualTo(1);
      verify(ajusteDao).save(any());
      verify(movimientoService).registrarTodos(anyList());
    }

    @Test
    @DisplayName("happy path cr=false: reduce stock y retorna el ajuste guardado")
    void aplicar_debitoReduceStock() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_DEBITO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 80, null)); // stock actual=100 → -20

      InAjusteInventario saved = ajusteGuardadoFake(1);
      prepararSucursalYTipo(TIPO_MOV_DEBITO, false);
      prepararInventario(PRODUCTO_ID, null, 100);
      when(ajusteDao.save(any())).thenReturn(saved);

      InAjusteInventario result = service.aplicar(req);

      assertThat(result).isNotNull();
      verify(movimientoService).registrarTodos(anyList());
    }

    @Test
    @DisplayName("movimientoTipoId null usa el tipo por defecto (ID=3)")
    void aplicar_tipoNullUsaDefault() {
      InAjusteInventarioRequestDTO req = requestFake(null); // sin tipo
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 110, null));

      prepararSucursalYTipo(TIPO_MOV_DEFAULT, true);
      prepararInventario(PRODUCTO_ID, null, 100);
      when(ajusteDao.save(any())).thenReturn(ajusteGuardadoFake(1));

      service.aplicar(req);

      // El tipo buscado debe ser el 3, no null
      verify(movimientoTipoRepository).findById(TIPO_MOV_DEFAULT);
    }

    @Test
    @DisplayName("tenant se estampa desde el JWT, nunca del cliente")
    void aplicar_tenantDesdeJwt() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_CREDITO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 110, null));

      prepararSucursalYTipo(TIPO_MOV_CREDITO, true);
      prepararInventario(PRODUCTO_ID, null, 100);
      when(ajusteDao.save(any())).thenReturn(ajusteGuardadoFake(1));

      service.aplicar(req);

      ArgumentCaptor<InAjusteInventario> captor = ArgumentCaptor.forClass(InAjusteInventario.class);
      verify(ajusteDao).save(captor.capture());
      InAjusteInventario guardado = captor.getValue();

      assertThat(guardado.getEmpresaId()).isEqualTo(EMPRESA_ID);
      assertThat(guardado.getSucursalId().getId()).isEqualTo(SUCURSAL_ID);
      assertThat(guardado.getUsuarioReg()).isEqualTo(USERNAME);
      assertThat(guardado.getFechaReg()).isNotNull();
    }

    @Test
    @DisplayName("estadoId siempre es 'APL' al guardar")
    void aplicar_estadoSiempreAPL() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_CREDITO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 110, null));

      prepararSucursalYTipo(TIPO_MOV_CREDITO, true);
      prepararInventario(PRODUCTO_ID, null, 100);
      when(ajusteDao.save(any())).thenReturn(ajusteGuardadoFake(1));

      service.aplicar(req);

      ArgumentCaptor<InAjusteInventario> captor = ArgumentCaptor.forClass(InAjusteInventario.class);
      verify(ajusteDao).save(captor.capture());
      assertThat(captor.getValue().getEstadoId()).isEqualTo("APL");
    }

    @Test
    @DisplayName("diferencia se calcula como cantidadNueva − cantidadActual de in_inventarios")
    void aplicar_diferenciaCalculadaDesdeBD() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_CREDITO);
      // DTO dice cantidadActual=50 pero la BD tiene 80 — la BD manda
      InAjusteInventarioDetalleRequestDTO detDTO = detalleDTOFake(PRODUCTO_ID, 100, null);
      detDTO.setCantidadActual(50); // ignorado; se usa el stock real de BD
      req.getDetalles().add(detDTO);

      prepararSucursalYTipo(TIPO_MOV_CREDITO, true);
      prepararInventario(PRODUCTO_ID, null, 80); // stock real = 80
      when(ajusteDao.save(any())).thenReturn(ajusteGuardadoFake(1));

      service.aplicar(req);

      @SuppressWarnings("unchecked")
      ArgumentCaptor<List<InMovimiento>> captor = ArgumentCaptor.forClass(List.class);
      verify(movimientoService).registrarTodos(captor.capture());
      // diferencia = 100 - 80 = 20 (no 100 - 50 = 50)
      assertThat(captor.getValue().get(0).getCantidad()).isEqualTo(20);
    }

    @Test
    @DisplayName("lote se propaga correctamente al detalle y al movimiento")
    void aplicar_loteEnDetalleYMovimiento() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_DEBITO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 5, "LOTE-001"));

      prepararSucursalYTipo(TIPO_MOV_DEBITO, false);
      when(inventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID, "LOTE-001"))
          .thenReturn(Optional.of(inventarioFake(20)));
      when(ajusteDao.save(any())).thenReturn(ajusteGuardadoFake(1));

      service.aplicar(req);

      @SuppressWarnings("unchecked")
      ArgumentCaptor<List<InMovimiento>> captor = ArgumentCaptor.forClass(List.class);
      verify(movimientoService).registrarTodos(captor.capture());
      assertThat(captor.getValue().get(0).getLote()).isEqualTo("LOTE-001");
    }

    @Test
    @DisplayName("movimientos llevan el id del ajuste guardado como numeroReferencia")
    void aplicar_movimientosConNumeroReferencia() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_CREDITO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 110, null));
      req.getDetalles().add(detalleDTOFake(77, 50, null));

      prepararSucursalYTipo(TIPO_MOV_CREDITO, true);
      prepararInventario(PRODUCTO_ID, null, 100);
      when(inventarioRepository.findByProductoAlmacenLote(
              77, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID, null))
          .thenReturn(Optional.of(inventarioFake(30)));
      when(ajusteDao.save(any())).thenReturn(ajusteGuardadoFake(42)); // ID = 42

      service.aplicar(req);

      @SuppressWarnings("unchecked")
      ArgumentCaptor<List<InMovimiento>> captor = ArgumentCaptor.forClass(List.class);
      verify(movimientoService).registrarTodos(captor.capture());
      captor.getValue().forEach(m -> assertThat(m.getNumeroReferencia()).isEqualTo(42));
    }

    @Test
    @DisplayName("múltiples detalles generan un movimiento por cada uno")
    void aplicar_multipleDetalles_multipleMovimientos() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_CREDITO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 110, null));
      req.getDetalles().add(detalleDTOFake(77, 60, null));

      prepararSucursalYTipo(TIPO_MOV_CREDITO, true);
      prepararInventario(PRODUCTO_ID, null, 100);
      when(inventarioRepository.findByProductoAlmacenLote(
              77, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID, null))
          .thenReturn(Optional.of(inventarioFake(40)));
      when(ajusteDao.save(any())).thenReturn(ajusteGuardadoFake(1));

      service.aplicar(req);

      @SuppressWarnings("unchecked")
      ArgumentCaptor<List<InMovimiento>> captor = ArgumentCaptor.forClass(List.class);
      verify(movimientoService).registrarTodos(captor.capture());
      assertThat(captor.getValue()).hasSize(2);
    }

    @Test
    @DisplayName("inventario con cantidad null se trata como 0")
    void aplicar_inventarioCantidadNull_tratadoComoCero() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_CREDITO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 10, null));

      prepararSucursalYTipo(TIPO_MOV_CREDITO, true);
      when(inventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID, null))
          .thenReturn(Optional.of(inventarioFake(null))); // cantidad null
      when(ajusteDao.save(any())).thenReturn(ajusteGuardadoFake(1));

      service.aplicar(req);

      @SuppressWarnings("unchecked")
      ArgumentCaptor<List<InMovimiento>> captor = ArgumentCaptor.forClass(List.class);
      verify(movimientoService).registrarTodos(captor.capture());
      // diferencia = 10 - 0 = 10
      assertThat(captor.getValue().get(0).getCantidad()).isEqualTo(10);
    }

    // ── Validaciones de dirección ─────────────────────────────────────────────

    @Test
    @DisplayName("cr=true y diferencia < 0 lanza ApplicationException")
    void aplicar_creditoConDiferenciaNegativa_lanzaExcepcion() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_CREDITO);
      req.getDetalles()
          .add(detalleDTOFake(PRODUCTO_ID, 80, null)); // stock actual=100, nuevo=80 → -20

      prepararSucursalYTipo(TIPO_MOV_CREDITO, true);
      prepararInventario(PRODUCTO_ID, null, 100);

      assertThatThrownBy(() -> service.aplicar(req))
          .isInstanceOf(ApplicationException.class)
          .hasMessageContaining("solo permite aumentar");
    }

    @Test
    @DisplayName("cr=false y diferencia > 0 lanza ApplicationException")
    void aplicar_debitoConDiferenciaPositiva_lanzaExcepcion() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_DEBITO);
      req.getDetalles()
          .add(detalleDTOFake(PRODUCTO_ID, 120, null)); // stock actual=100, nuevo=120 → +20

      prepararSucursalYTipo(TIPO_MOV_DEBITO, false);
      prepararInventario(PRODUCTO_ID, null, 100);

      assertThatThrownBy(() -> service.aplicar(req))
          .isInstanceOf(ApplicationException.class)
          .hasMessageContaining("solo permite reducir");
    }

    @Test
    @DisplayName("cr=true y diferencia == 0 no lanza excepción")
    void aplicar_creditoConDiferenciaCero_noLanzaExcepcion() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_CREDITO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 100, null)); // sin cambio

      prepararSucursalYTipo(TIPO_MOV_CREDITO, true);
      prepararInventario(PRODUCTO_ID, null, 100);
      when(ajusteDao.save(any())).thenReturn(ajusteGuardadoFake(1));

      service.aplicar(req); // no debe lanzar

      verify(ajusteDao).save(any());
    }

    @Test
    @DisplayName("cr=false y diferencia == 0 no lanza excepción")
    void aplicar_debitoConDiferenciaCero_noLanzaExcepcion() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_DEBITO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 100, null)); // sin cambio

      prepararSucursalYTipo(TIPO_MOV_DEBITO, false);
      prepararInventario(PRODUCTO_ID, null, 100);
      when(ajusteDao.save(any())).thenReturn(ajusteGuardadoFake(1));

      service.aplicar(req); // no debe lanzar

      verify(ajusteDao).save(any());
    }

    // ── Errores de not found ──────────────────────────────────────────────────

    @Test
    @DisplayName("lanza RecordNotFoundException cuando la sucursal no existe")
    void aplicar_sucursalNoEncontrada() {
      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.aplicar(requestFake(TIPO_MOV_CREDITO)))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("Sucursal");
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando el tipo de movimiento no existe")
    void aplicar_tipoMovimientoNoEncontrado() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_CREDITO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 110, null));

      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(movimientoTipoRepository.findById(TIPO_MOV_CREDITO)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.aplicar(req))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining(String.valueOf(TIPO_MOV_CREDITO));
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando el inventario del producto no existe")
    void aplicar_inventarioNoEncontrado() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_CREDITO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 110, null));

      prepararSucursalYTipo(TIPO_MOV_CREDITO, true);
      when(inventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID, null))
          .thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.aplicar(req))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining(String.valueOf(PRODUCTO_ID));
    }

    @Test
    @DisplayName("el tipo de movimiento se carga con el id del request, no el default")
    void aplicar_tipoMovimientoUsaIdDelRequest() {
      InAjusteInventarioRequestDTO req = requestFake(TIPO_MOV_CREDITO);
      req.getDetalles().add(detalleDTOFake(PRODUCTO_ID, 110, null));

      prepararSucursalYTipo(TIPO_MOV_CREDITO, true);
      prepararInventario(PRODUCTO_ID, null, 100);
      when(ajusteDao.save(any())).thenReturn(ajusteGuardadoFake(1));

      service.aplicar(req);

      verify(movimientoTipoRepository).findById(TIPO_MOV_CREDITO);
      verify(movimientoTipoRepository, never()).findById(TIPO_MOV_DEFAULT);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // buscar()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("buscar()")
  class Buscar {

    @Test
    @DisplayName("delega al DAO con empresaId y sucursalId del JWT")
    void buscar_delegaAlDao() {
      InAjusteInventarioSearchCriteria criteria = new InAjusteInventarioSearchCriteria();
      InAjusteInventarioResumenDTO dto =
          new InAjusteInventarioResumenDTO(
              1, LocalDateTime.now(), ALMACEN_ID, "APL", "Ajuste Positivo", "obs", USERNAME, 2);
      Page<InAjusteInventarioResumenDTO> page = new PageImpl<>(List.of(dto));

      when(ajusteDao.buscar(criteria, EMPRESA_ID, SUCURSAL_ID)).thenReturn(page);

      Page<InAjusteInventarioResumenDTO> result = service.buscar(criteria);

      assertThat(result.getContent()).hasSize(1);
      verify(ajusteDao).buscar(criteria, EMPRESA_ID, SUCURSAL_ID);
    }

    @Test
    @DisplayName("retorna página vacía cuando no hay ajustes")
    void buscar_sinResultados_paginaVacia() {
      InAjusteInventarioSearchCriteria criteria = new InAjusteInventarioSearchCriteria();
      when(ajusteDao.buscar(criteria, EMPRESA_ID, SUCURSAL_ID)).thenReturn(Page.empty());

      Page<InAjusteInventarioResumenDTO> result = service.buscar(criteria);

      assertThat(result).isEmpty();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // findById()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("findById()")
  class FindById {

    @Test
    @DisplayName("retorna el ajuste cuando existe y pertenece al tenant")
    void findById_encontrado() {
      when(ajusteDao.findById(1, EMPRESA_ID, SUCURSAL_ID))
          .thenReturn(Optional.of(ajusteGuardadoFake(1)));

      InAjusteInventario result = service.findById(1);

      assertThat(result).isNotNull();
      assertThat(result.getId()).isEqualTo(1);
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando el ajuste no existe")
    void findById_noEncontrado() {
      when(ajusteDao.findById(99, EMPRESA_ID, SUCURSAL_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.findById(99))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("99");
    }

    @Test
    @DisplayName("busca con empresaId y sucursalId del JWT, no parámetros externos")
    void findById_usaTenantDelJwt() {
      when(ajusteDao.findById(5, EMPRESA_ID, SUCURSAL_ID))
          .thenReturn(Optional.of(ajusteGuardadoFake(5)));

      service.findById(5);

      verify(ajusteDao).findById(eq(5), eq(EMPRESA_ID), eq(SUCURSAL_ID));
      verify(ajusteDao, never()).findById(anyInt(), eq(999), anyInt());
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // findByAlmacen()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("findByAlmacen()")
  class FindByAlmacen {

    @Test
    @DisplayName("delega al DAO con los tres parámetros del tenant")
    void findByAlmacen_delegaAlDao() {
      InAjusteInventarioResumenDTO dto =
          new InAjusteInventarioResumenDTO(
              1, LocalDateTime.now(), ALMACEN_ID, "APL", "Ajuste Positivo", null, USERNAME, 1);
      when(ajusteDao.findByAlmacen(ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID)).thenReturn(List.of(dto));

      List<InAjusteInventarioResumenDTO> result = service.findByAlmacen(ALMACEN_ID);

      assertThat(result).hasSize(1);
      verify(ajusteDao).findByAlmacen(ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID);
    }

    @Test
    @DisplayName("retorna lista vacía cuando no hay ajustes para ese almacén")
    void findByAlmacen_sinAjustes() {
      when(ajusteDao.findByAlmacen(ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID))
          .thenReturn(Collections.emptyList());

      assertThat(service.findByAlmacen(ALMACEN_ID)).isEmpty();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // getStockActual()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("getStockActual()")
  class GetStockActual {

    @Test
    @DisplayName("retorna DTO con datos correctos cuando hay inventario registrado")
    void getStockActual_conInventario() {
      when(inventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID, "LOTE-A"))
          .thenReturn(Optional.of(inventarioFake(55)));
      when(productoRepository.findById(PRODUCTO_ID))
          .thenReturn(Optional.of(productoFake(PRODUCTO_ID)));

      InStockActualDTO result = service.getStockActual(PRODUCTO_ID, ALMACEN_ID, "LOTE-A");

      assertThat(result.getProductoId()).isEqualTo(PRODUCTO_ID);
      assertThat(result.getAlmacenId()).isEqualTo(ALMACEN_ID);
      assertThat(result.getLote()).isEqualTo("LOTE-A");
      assertThat(result.getCantidad()).isEqualTo(55);
      assertThat(result.getProductoNombre()).isEqualTo("Producto " + PRODUCTO_ID);
    }

    @Test
    @DisplayName("retorna cantidad=0 cuando no hay registro de inventario")
    void getStockActual_sinInventario_retornaCero() {
      when(inventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID, null))
          .thenReturn(Optional.empty());
      when(productoRepository.findById(PRODUCTO_ID))
          .thenReturn(Optional.of(productoFake(PRODUCTO_ID)));

      InStockActualDTO result = service.getStockActual(PRODUCTO_ID, ALMACEN_ID, null);

      assertThat(result.getCantidad()).isEqualTo(0);
    }

    @Test
    @DisplayName("retorna cantidad=0 cuando inventario existe pero cantidad es null")
    void getStockActual_cantidadNull_retornaCero() {
      when(inventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID, null))
          .thenReturn(Optional.of(inventarioFake(null)));
      when(productoRepository.findById(PRODUCTO_ID))
          .thenReturn(Optional.of(productoFake(PRODUCTO_ID)));

      InStockActualDTO result = service.getStockActual(PRODUCTO_ID, ALMACEN_ID, null);

      assertThat(result.getCantidad()).isEqualTo(0);
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando el producto no existe")
    void getStockActual_productoNoEncontrado() {
      when(inventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID, null))
          .thenReturn(Optional.empty());
      when(productoRepository.findById(PRODUCTO_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.getStockActual(PRODUCTO_ID, ALMACEN_ID, null))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining(String.valueOf(PRODUCTO_ID));
    }

    @Test
    @DisplayName("usa empresaId y sucursalId del JWT al buscar el inventario")
    void getStockActual_usaTenantDelJwt() {
      when(inventarioRepository.findByProductoAlmacenLote(
              PRODUCTO_ID, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID, null))
          .thenReturn(Optional.of(inventarioFake(10)));
      when(productoRepository.findById(PRODUCTO_ID))
          .thenReturn(Optional.of(productoFake(PRODUCTO_ID)));

      service.getStockActual(PRODUCTO_ID, ALMACEN_ID, null);

      verify(inventarioRepository)
          .findByProductoAlmacenLote(PRODUCTO_ID, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID, null);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // getLotesByProductoAndAlmacen()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("getLotesByProductoAndAlmacen()")
  class GetLotesByProductoAndAlmacen {

    @Test
    @DisplayName("delega al repository con los cuatro parámetros del tenant")
    void getLotes_delegaAlRepository() {
      List<String> lotes = List.of("LOTE-01", "LOTE-02");
      when(inventarioRepository.findLotesByProductoAndAlmacen(
              PRODUCTO_ID, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID))
          .thenReturn(lotes);

      List<String> result = service.getLotesByProductoAndAlmacen(PRODUCTO_ID, ALMACEN_ID);

      assertThat(result).containsExactly("LOTE-01", "LOTE-02");
      verify(inventarioRepository)
          .findLotesByProductoAndAlmacen(PRODUCTO_ID, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID);
    }

    @Test
    @DisplayName("retorna lista vacía cuando no hay lotes con stock")
    void getLotes_sinLotes_listaVacia() {
      when(inventarioRepository.findLotesByProductoAndAlmacen(
              PRODUCTO_ID, ALMACEN_ID, EMPRESA_ID, SUCURSAL_ID))
          .thenReturn(Collections.emptyList());

      assertThat(service.getLotesByProductoAndAlmacen(PRODUCTO_ID, ALMACEN_ID)).isEmpty();
    }
  }
}
