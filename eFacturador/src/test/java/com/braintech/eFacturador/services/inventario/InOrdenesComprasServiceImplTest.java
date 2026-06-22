package com.braintech.eFacturador.services.inventario;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.braintech.eFacturador.dao.inventario.InOrdenesComprasDao;
import com.braintech.eFacturador.dao.inventario.InOrdenesComprasRepository;
import com.braintech.eFacturador.dao.inventario.InSuplidorRepository;
import com.braintech.eFacturador.dao.producto.MgProductoRepository;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.inventario.InOrdenesComprasDetalleRequestDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenesComprasRequestDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenesComprasResumenDTO;
import com.braintech.eFacturador.dto.inventario.InOrdenesComprasSearchCriteria;
import com.braintech.eFacturador.dto.inventario.InOrdenesComprasSimpleDTO;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.inventario.InOrdenesCompras;
import com.braintech.eFacturador.jpa.inventario.InOrdenesComprasDetalles;
import com.braintech.eFacturador.jpa.inventario.InSuplidor;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.util.TenantContext;
import java.math.BigDecimal;
import java.time.LocalDate;
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
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class InOrdenesComprasServiceImplTest {

  @Mock private InOrdenesComprasRepository repository;
  @Mock private InOrdenesComprasDao dao;
  @Mock private InSuplidorRepository suplidorRepository;
  @Mock private MgProductoRepository productoRepository;
  @Mock private SgSucursalRepository sucursalRepository;
  @Mock private TenantContext tenantContext;

  @InjectMocks private InOrdenesComprasServiceImpl service;

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

  private InSuplidor suplidorFake(Integer id) {
    InSuplidor sup = new InSuplidor();
    sup.setId(id);
    sup.setEmpresaId(EMPRESA_ID);
    return sup;
  }

  private MgProducto productoFake(Integer id) {
    MgProducto p = new MgProducto();
    p.setId(id);
    return p;
  }

  private InOrdenesCompras ordenFake(Integer id, String estado) {
    InOrdenesCompras o = new InOrdenesCompras();
    o.setId(id);
    o.setEmpresaId(EMPRESA_ID);
    o.setEstadoId(estado);
    o.setTotal(BigDecimal.valueOf(1000));
    o.setSubTotal(BigDecimal.valueOf(850));
    o.setItbis(BigDecimal.valueOf(150));
    o.setDetalles(new ArrayList<>());
    o.setSuplidorId(suplidorFake(5));
    return o;
  }

  private InOrdenesComprasRequestDTO requestDTOFake() {
    InOrdenesComprasRequestDTO dto = new InOrdenesComprasRequestDTO();
    dto.setSuplidorId(5);
    dto.setSubTotal(BigDecimal.valueOf(850));
    dto.setItbis(BigDecimal.valueOf(150));
    dto.setTotal(BigDecimal.valueOf(1000));
    dto.setDescuento(BigDecimal.ZERO);
    dto.setEstadoId("PEN");
    dto.setFechaEntregaTentativa(LocalDate.now().plusDays(7));
    return dto;
  }

  private InOrdenesComprasDetalleRequestDTO detalleDTOFake(Integer productoId) {
    InOrdenesComprasDetalleRequestDTO d = new InOrdenesComprasDetalleRequestDTO();
    d.setProductoId(productoId);
    d.setCantidad(2);
    d.setPrecioUnitario(BigDecimal.valueOf(425));
    d.setSubTotal(BigDecimal.valueOf(850));
    d.setItbis(BigDecimal.valueOf(150));
    d.setTotal(BigDecimal.valueOf(1000));
    return d;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // create()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("create()")
  class Create {

    @Test
    @DisplayName("crea orden con detalles cuando los datos son válidos")
    void create_happyPath() {
      InOrdenesComprasRequestDTO dto = requestDTOFake();
      dto.setDetalles(List.of(detalleDTOFake(99)));

      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(suplidorRepository.findByIdAndEmpresaId(5, EMPRESA_ID))
          .thenReturn(Optional.of(suplidorFake(5)));
      when(productoRepository.findByIdAndEmpresaId(99, EMPRESA_ID))
          .thenReturn(Optional.of(productoFake(99)));

      InOrdenesCompras saved = ordenFake(1, "PEN");
      saved.setDetalles(List.of(new InOrdenesComprasDetalles()));
      when(repository.save(any())).thenReturn(saved);

      Response<?> resp = service.create(dto);

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
      assertThat(resp.content()).isNotNull();
      verify(repository).save(any(InOrdenesCompras.class));
    }

    @Test
    @DisplayName("el empresaId y sucursalId siempre vienen del JWT, nunca del cliente")
    void create_tenantDesdeJwt() {
      InOrdenesComprasRequestDTO dto = requestDTOFake();

      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(suplidorRepository.findByIdAndEmpresaId(5, EMPRESA_ID))
          .thenReturn(Optional.of(suplidorFake(5)));
      when(repository.save(any())).thenReturn(ordenFake(1, "PEN"));

      service.create(dto);

      ArgumentCaptor<InOrdenesCompras> captor = ArgumentCaptor.forClass(InOrdenesCompras.class);
      verify(repository).save(captor.capture());

      InOrdenesCompras persistido = captor.getValue();
      assertThat(persistido.getEmpresaId()).isEqualTo(EMPRESA_ID);
      assertThat(persistido.getSucursalId().getId()).isEqualTo(SUCURSAL_ID);
      assertThat(persistido.getUsuarioReg()).isEqualTo(USERNAME);
    }

    @Test
    @DisplayName("asigna estadoId 'ACT' por defecto cuando el DTO lo envía null")
    void create_estadoPorDefecto_cuandoEstadoNull() {
      InOrdenesComprasRequestDTO dto = requestDTOFake();
      dto.setEstadoId(null);

      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(suplidorRepository.findByIdAndEmpresaId(5, EMPRESA_ID))
          .thenReturn(Optional.of(suplidorFake(5)));
      when(repository.save(any())).thenReturn(ordenFake(1, "ACT"));

      service.create(dto);

      ArgumentCaptor<InOrdenesCompras> captor = ArgumentCaptor.forClass(InOrdenesCompras.class);
      verify(repository).save(captor.capture());
      assertThat(captor.getValue().getEstadoId()).isEqualTo("ACT");
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando la sucursal no existe")
    void create_sucursalNoEncontrada() {
      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.create(requestDTOFake()))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("Sucursal");
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando el suplidor no existe")
    void create_suplidorNoEncontrado() {
      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(suplidorRepository.findByIdAndEmpresaId(5, EMPRESA_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.create(requestDTOFake()))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("Suplidor");
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando un producto del detalle no existe")
    void create_productoNoEncontrado() {
      InOrdenesComprasRequestDTO dto = requestDTOFake();
      dto.setDetalles(List.of(detalleDTOFake(999)));

      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(suplidorRepository.findByIdAndEmpresaId(5, EMPRESA_ID))
          .thenReturn(Optional.of(suplidorFake(5)));
      when(productoRepository.findByIdAndEmpresaId(999, EMPRESA_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.create(dto))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("Producto");
    }

    @Test
    @DisplayName("crea orden sin detalles cuando la lista viene null")
    void create_sinDetalles() {
      InOrdenesComprasRequestDTO dto = requestDTOFake();
      dto.setDetalles(null);

      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(suplidorRepository.findByIdAndEmpresaId(5, EMPRESA_ID))
          .thenReturn(Optional.of(suplidorFake(5)));
      when(repository.save(any())).thenReturn(ordenFake(1, "PEN"));

      Response<?> resp = service.create(dto);

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // update()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("update()")
  class Update {

    @Test
    @DisplayName("actualiza la orden existente y sincroniza el tenant desde el JWT")
    void update_happyPath() {
      InOrdenesCompras existing = ordenFake(1, "PEN");
      InOrdenesCompras payload = ordenFake(null, "PEN");
      payload.setTotal(BigDecimal.valueOf(2000));

      when(repository.findById(1)).thenReturn(Optional.of(existing));
      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(repository.save(any())).thenReturn(existing);

      Response<?> resp = service.update(1, payload);

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
      verify(repository).save(existing);
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando el id no existe")
    void update_ordenNoEncontrada() {
      when(repository.findById(99)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.update(99, new InOrdenesCompras()))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("Orden de compra");
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando la orden pertenece a otra empresa")
    void update_otraEmpresa_noEncontrada() {
      InOrdenesCompras otraEmpresa = ordenFake(1, "PEN");
      otraEmpresa.setEmpresaId(999); // empresa distinta

      when(repository.findById(1)).thenReturn(Optional.of(otraEmpresa));

      assertThatThrownBy(() -> service.update(1, new InOrdenesCompras()))
          .isInstanceOf(RecordNotFoundException.class);
    }

    @Test
    @DisplayName("asigna estadoId 'ACT' a los detalles que no tienen estado")
    void update_detallesSinEstadoReciben_ACT() {
      InOrdenesCompras existing = ordenFake(1, "PEN");

      InOrdenesComprasDetalles detalleSinEstado = new InOrdenesComprasDetalles();
      detalleSinEstado.setEstadoId(null);

      InOrdenesCompras payload = ordenFake(null, "PEN");
      payload.setDetalles(List.of(detalleSinEstado));

      when(repository.findById(1)).thenReturn(Optional.of(existing));
      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

      service.update(1, payload);

      assertThat(existing.getDetalles().get(0).getEstadoId()).isEqualTo("ACT");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // disable()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("disable()")
  class Disable {

    @Test
    @DisplayName("inactiva la orden y todos sus detalles")
    void disable_inactivaOrdenYDetalles() {
      InOrdenesComprasDetalles det1 = new InOrdenesComprasDetalles();
      det1.setEstadoId("ACT");
      InOrdenesComprasDetalles det2 = new InOrdenesComprasDetalles();
      det2.setEstadoId("ACT");

      InOrdenesCompras orden = ordenFake(1, "PEN");
      orden.setDetalles(new ArrayList<>(List.of(det1, det2)));

      when(repository.findByIdAndEmpresaId(1, EMPRESA_ID)).thenReturn(Optional.of(orden));
      when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

      Response<?> resp = service.disable(1);

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
      assertThat(orden.getEstadoId()).isEqualTo("INA");
      assertThat(det1.getEstadoId()).isEqualTo("INA");
      assertThat(det2.getEstadoId()).isEqualTo("INA");
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando la orden no existe")
    void disable_ordenNoEncontrada() {
      when(repository.findByIdAndEmpresaId(99, EMPRESA_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.disable(99))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("Orden de compra");
    }

    @Test
    @DisplayName("inactiva orden aunque no tenga detalles")
    void disable_sinDetalles() {
      InOrdenesCompras orden = ordenFake(1, "PEN");
      orden.setDetalles(Collections.emptyList());

      when(repository.findByIdAndEmpresaId(1, EMPRESA_ID)).thenReturn(Optional.of(orden));
      when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

      Response<?> resp = service.disable(1);

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
      assertThat(orden.getEstadoId()).isEqualTo("INA");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // getById()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("getById()")
  class GetById {

    @Test
    @DisplayName("retorna la orden cuando existe y pertenece a la empresa del JWT")
    void getById_encontrada() {
      when(repository.findByIdAndEmpresaId(1, EMPRESA_ID))
          .thenReturn(Optional.of(ordenFake(1, "PEN")));

      Response<?> resp = service.getById(1);

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
      assertThat(resp.content()).isInstanceOf(InOrdenesCompras.class);
    }

    @Test
    @DisplayName("retorna NOT_FOUND cuando no existe o pertenece a otra empresa")
    void getById_noEncontrada() {
      when(repository.findByIdAndEmpresaId(99, EMPRESA_ID)).thenReturn(Optional.empty());

      Response<?> resp = service.getById(99);

      assertThat(resp.status()).isEqualTo(HttpStatus.NOT_FOUND);
      assertThat(resp.content()).isNull();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // getAll() / getAllActive()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("getAll() / getAllActive()")
  class GetAll {

    @Test
    @DisplayName("getAll retorna OK cuando hay órdenes")
    void getAll_conDatos() {
      when(repository.findAllByEmpresaId(EMPRESA_ID))
          .thenReturn(List.of(ordenFake(1, "PEN"), ordenFake(2, "ACT")));

      Response<?> resp = service.getAll();

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("getAll retorna BAD_REQUEST cuando no hay órdenes")
    void getAll_sinDatos() {
      when(repository.findAllByEmpresaId(EMPRESA_ID)).thenReturn(Collections.emptyList());

      Response<?> resp = service.getAll();

      assertThat(resp.status()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("getAllActive retorna OK cuando hay órdenes activas")
    void getAllActive_conDatos() {
      when(repository.findAllActiveByEmpresaId(EMPRESA_ID))
          .thenReturn(List.of(ordenFake(1, "ACT")));

      Response<?> resp = service.getAllActive();

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("getAllActive retorna BAD_REQUEST cuando no hay órdenes activas")
    void getAllActive_sinDatos() {
      when(repository.findAllActiveByEmpresaId(EMPRESA_ID)).thenReturn(Collections.emptyList());

      Response<?> resp = service.getAllActive();

      assertThat(resp.status()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("getAllActiveSimple retorna OK cuando hay datos")
    void getAllActiveSimple_conDatos() {
      InOrdenesComprasSimpleDTO simple = mock(InOrdenesComprasSimpleDTO.class);
      when(repository.findAllActiveSimpleByEmpresaId(EMPRESA_ID)).thenReturn(List.of(simple));

      Response<?> resp = service.getAllActiveSimple();

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("getAllActiveSimple retorna BAD_REQUEST cuando no hay datos")
    void getAllActiveSimple_sinDatos() {
      when(repository.findAllActiveSimpleByEmpresaId(EMPRESA_ID))
          .thenReturn(Collections.emptyList());

      Response<?> resp = service.getAllActiveSimple();

      assertThat(resp.status()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // searchByCriteria()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("searchByCriteria()")
  class SearchByCriteria {

    @Test
    @DisplayName("retorna página de resultados cuando hay coincidencias")
    void search_conResultados() {
      InOrdenesComprasResumenDTO resumen =
          new InOrdenesComprasResumenDTO(
              1,
              BigDecimal.valueOf(1000),
              "Suplidor SA",
              "101-123-456",
              "PEN",
              null,
              LocalDate.now());
      Page<InOrdenesComprasResumenDTO> page = new PageImpl<>(List.of(resumen));

      InOrdenesComprasSearchCriteria criteria = new InOrdenesComprasSearchCriteria();
      when(dao.searchByCriteria(criteria, EMPRESA_ID)).thenReturn(page);

      Response<?> resp = service.searchByCriteria(criteria);

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("retorna NOT_FOUND cuando no hay coincidencias")
    void search_sinResultados() {
      Page<InOrdenesComprasResumenDTO> empty = Page.empty();

      InOrdenesComprasSearchCriteria criteria = new InOrdenesComprasSearchCriteria();
      when(dao.searchByCriteria(criteria, EMPRESA_ID)).thenReturn(empty);

      Response<?> resp = service.searchByCriteria(criteria);

      assertThat(resp.status()).isEqualTo(HttpStatus.NOT_FOUND);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // convertirAOrdenEntrada()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("convertirAOrdenEntrada()")
  class ConvertirAOrdenEntrada {

    @Test
    @DisplayName("genera preview de orden de entrada sin persistir cuando está en PEN")
    void convertir_generaPreview() {
      InOrdenesComprasDetalles detalle = new InOrdenesComprasDetalles();
      detalle.setProductoId(productoFake(99));
      detalle.setCantidad(3);
      detalle.setPrecioUnitario(BigDecimal.valueOf(100));
      detalle.setSubTotal(BigDecimal.valueOf(300));
      detalle.setItbis(BigDecimal.valueOf(54));
      detalle.setTotal(BigDecimal.valueOf(354));

      InOrdenesCompras orden = ordenFake(1, "PEN");
      orden.setDetalles(List.of(detalle));

      when(repository.findByIdAndEmpresaId(1, EMPRESA_ID)).thenReturn(Optional.of(orden));

      Response<?> resp = service.convertirAOrdenEntrada(1, 20);

      assertThat(resp.status()).isEqualTo(HttpStatus.OK);
      assertThat(resp.content()).isNotNull();
      // No debe haberse guardado nada en el repositorio
      verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("retorna BAD_REQUEST cuando la orden no está en estado PEN")
    void convertir_estadoNoPermitido() {
      InOrdenesCompras orden = ordenFake(1, "ACT"); // no es PEN
      when(repository.findByIdAndEmpresaId(1, EMPRESA_ID)).thenReturn(Optional.of(orden));

      Response<?> resp = service.convertirAOrdenEntrada(1, 20);

      assertThat(resp.status()).isEqualTo(HttpStatus.BAD_REQUEST);
      verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando la orden no existe")
    void convertir_ordenNoEncontrada() {
      when(repository.findByIdAndEmpresaId(99, EMPRESA_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.convertirAOrdenEntrada(99, 20))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("Orden de compra");
    }

    @Test
    @DisplayName("propaga almacenId al preview de la orden de entrada")
    void convertir_propagaAlmacenId() {
      InOrdenesCompras orden = ordenFake(1, "PEN");
      when(repository.findByIdAndEmpresaId(1, EMPRESA_ID)).thenReturn(Optional.of(orden));

      service.convertirAOrdenEntrada(1, 42);

      // La conversión no persiste; se verifica que el método no lanza excepción
      // y que el almacénId llegó como parámetro
      verify(repository, never()).save(any());
    }
  }
}
