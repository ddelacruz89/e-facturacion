package com.braintech.eFacturador.services.inventario;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.braintech.eFacturador.dao.inventario.InAlmacenDao;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dto.inventario.InAlmacenRequestDTO;
import com.braintech.eFacturador.dto.inventario.InAlmacenResumenDTO;
import com.braintech.eFacturador.dto.inventario.InAlmacenSearchCriteria;
import com.braintech.eFacturador.exceptions.RecordNotFoundException;
import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.util.TenantContext;
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

@ExtendWith(MockitoExtension.class)
class InAlmacenServiceImplTest {

  @Mock private InAlmacenDao inAlmacenDao;
  @Mock private TenantContext tenantContext;
  @Mock private SgSucursalRepository sucursalRepository;

  @InjectMocks private InAlmacenServiceImpl service;

  private static final Integer EMPRESA_ID = 1;
  private static final Integer SUCURSAL_ID = 10;
  private static final String USERNAME = "testuser";
  private static final Integer ALMACEN_ID = 20;

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
    s.setNombre("Sucursal Principal");
    return s;
  }

  private InAlmacen almacenFake(Integer id, String estadoId) {
    InAlmacen a = new InAlmacen();
    a.setId(id);
    a.setEmpresaId(EMPRESA_ID);
    a.setSucursalId(sucursalFake());
    a.setUsuarioReg(USERNAME);
    a.setNombre("Almacén " + id);
    a.setUbicacion("Ubicación " + id);
    a.setEstadoId(estadoId);
    return a;
  }

  private InAlmacenRequestDTO requestFake() {
    InAlmacenRequestDTO r = new InAlmacenRequestDTO();
    r.setNombre("Almacén Central");
    r.setUbicacion("Km 5 Autopista Duarte");
    r.setSucursalId(SUCURSAL_ID);
    return r;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // create()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("create()")
  class Create {

    @Test
    @DisplayName("happy path: crea el almacén y retorna el guardado")
    void create_happyPath() {
      InAlmacenRequestDTO req = requestFake();
      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inAlmacenDao.save(any())).thenReturn(almacenFake(ALMACEN_ID, "ACT"));

      InAlmacen result = service.create(req);

      assertThat(result).isNotNull();
      assertThat(result.getId()).isEqualTo(ALMACEN_ID);
      verify(inAlmacenDao).save(any());
    }

    @Test
    @DisplayName("tenant se estampa desde el JWT, nunca del cliente")
    void create_tenantDesdeJwt() {
      InAlmacenRequestDTO req = requestFake();
      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inAlmacenDao.save(any())).thenReturn(almacenFake(ALMACEN_ID, "ACT"));

      service.create(req);

      ArgumentCaptor<InAlmacen> captor = ArgumentCaptor.forClass(InAlmacen.class);
      verify(inAlmacenDao).save(captor.capture());
      InAlmacen guardado = captor.getValue();

      assertThat(guardado.getEmpresaId()).isEqualTo(EMPRESA_ID);
      assertThat(guardado.getSucursalId().getId()).isEqualTo(SUCURSAL_ID);
      assertThat(guardado.getUsuarioReg()).isEqualTo(USERNAME);
      assertThat(guardado.getFechaReg()).isNotNull();
    }

    @Test
    @DisplayName("estadoId siempre es 'ACT' al crear")
    void create_estadoSiempreACT() {
      InAlmacenRequestDTO req = requestFake();
      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inAlmacenDao.save(any())).thenReturn(almacenFake(ALMACEN_ID, "ACT"));

      service.create(req);

      ArgumentCaptor<InAlmacen> captor = ArgumentCaptor.forClass(InAlmacen.class);
      verify(inAlmacenDao).save(captor.capture());
      assertThat(captor.getValue().getEstadoId()).isEqualTo("ACT");
    }

    @Test
    @DisplayName("nombre y ubicación se copian del request")
    void create_copiaNombreYUbicacion() {
      InAlmacenRequestDTO req = requestFake();
      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inAlmacenDao.save(any())).thenReturn(almacenFake(ALMACEN_ID, "ACT"));

      service.create(req);

      ArgumentCaptor<InAlmacen> captor = ArgumentCaptor.forClass(InAlmacen.class);
      verify(inAlmacenDao).save(captor.capture());
      assertThat(captor.getValue().getNombre()).isEqualTo(req.getNombre());
      assertThat(captor.getValue().getUbicacion()).isEqualTo(req.getUbicacion());
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando la sucursal no existe")
    void create_sucursalNoEncontrada() {
      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.create(requestFake()))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("Sucursal");
      verify(inAlmacenDao, never()).save(any());
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // update()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("update()")
  class Update {

    @Test
    @DisplayName("happy path: actualiza nombre, ubicación y sucursal")
    void update_happyPath() {
      InAlmacenRequestDTO req = requestFake();
      InAlmacen existente = almacenFake(ALMACEN_ID, "ACT");
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ID, EMPRESA_ID))
          .thenReturn(Optional.of(existente));
      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inAlmacenDao.save(any())).thenReturn(existente);

      InAlmacen result = service.update(ALMACEN_ID, req);

      assertThat(result).isNotNull();
      assertThat(result.getNombre()).isEqualTo(req.getNombre());
      assertThat(result.getUbicacion()).isEqualTo(req.getUbicacion());
      verify(inAlmacenDao).save(existente);
    }

    @Test
    @DisplayName("busca el registro existente por empresaId del JWT, no por sucursal")
    void update_buscaPorEmpresaDelJwt() {
      InAlmacen existente = almacenFake(ALMACEN_ID, "ACT");
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ID, EMPRESA_ID))
          .thenReturn(Optional.of(existente));
      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.of(sucursalFake()));
      when(inAlmacenDao.save(any())).thenReturn(existente);

      service.update(ALMACEN_ID, requestFake());

      verify(inAlmacenDao).findByIdAndEmpresaId(eq(ALMACEN_ID), eq(EMPRESA_ID));
    }

    @Test
    @DisplayName("permite cambiar de sucursal según el request")
    void update_permiteCambiarSucursal() {
      Integer nuevaSucursalId = 99;
      InAlmacenRequestDTO req = requestFake();
      req.setSucursalId(nuevaSucursalId);

      InAlmacen existente = almacenFake(ALMACEN_ID, "ACT");
      SgSucursal nuevaSucursal = new SgSucursal();
      nuevaSucursal.setId(nuevaSucursalId);
      nuevaSucursal.setNombre("Sucursal Nueva");

      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ID, EMPRESA_ID))
          .thenReturn(Optional.of(existente));
      when(sucursalRepository.findById(nuevaSucursalId)).thenReturn(Optional.of(nuevaSucursal));
      when(inAlmacenDao.save(any())).thenReturn(existente);

      InAlmacen result = service.update(ALMACEN_ID, req);

      assertThat(result.getSucursalId().getId()).isEqualTo(nuevaSucursalId);
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando el almacén no existe o es de otra empresa")
    void update_almacenNoEncontrado() {
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ID, EMPRESA_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.update(ALMACEN_ID, requestFake()))
          .isInstanceOf(RecordNotFoundException.class);
      verify(inAlmacenDao, never()).save(any());
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando la nueva sucursal no existe")
    void update_sucursalNoEncontrada() {
      InAlmacen existente = almacenFake(ALMACEN_ID, "ACT");
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ID, EMPRESA_ID))
          .thenReturn(Optional.of(existente));
      when(sucursalRepository.findById(SUCURSAL_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.update(ALMACEN_ID, requestFake()))
          .isInstanceOf(RecordNotFoundException.class)
          .hasMessageContaining("Sucursal");
      verify(inAlmacenDao, never()).save(any());
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // getById()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("getById()")
  class GetById {

    @Test
    @DisplayName("retorna el almacén cuando existe y pertenece al tenant")
    void getById_encontrado() {
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ID, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ID, "ACT")));

      InAlmacen result = service.getById(ALMACEN_ID);

      assertThat(result).isNotNull();
      assertThat(result.getId()).isEqualTo(ALMACEN_ID);
    }

    @Test
    @DisplayName("lanza RecordNotFoundException cuando no existe")
    void getById_noEncontrado() {
      when(inAlmacenDao.findByIdAndEmpresaId(99, EMPRESA_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.getById(99)).isInstanceOf(RecordNotFoundException.class);
    }

    @Test
    @DisplayName("usa el empresaId del JWT, no un parámetro externo")
    void getById_usaTenantDelJwt() {
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ID, EMPRESA_ID))
          .thenReturn(Optional.of(almacenFake(ALMACEN_ID, "ACT")));

      service.getById(ALMACEN_ID);

      verify(inAlmacenDao).findByIdAndEmpresaId(eq(ALMACEN_ID), eq(EMPRESA_ID));
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // getAll() / getAllActive()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("getAll() / getAllActive()")
  class GetAll {

    @Test
    @DisplayName("getAll() delega al DAO con empresaId y sucursalId del JWT")
    void getAll_delegaAlDao() {
      List<InAlmacen> lista = List.of(almacenFake(ALMACEN_ID, "ACT"));
      when(inAlmacenDao.findAllByEmpresaIdAndSucursalId(EMPRESA_ID, SUCURSAL_ID)).thenReturn(lista);

      List<InAlmacen> result = service.getAll();

      assertThat(result).hasSize(1);
      verify(inAlmacenDao).findAllByEmpresaIdAndSucursalId(EMPRESA_ID, SUCURSAL_ID);
    }

    @Test
    @DisplayName("getAll() retorna lista vacía cuando no hay almacenes")
    void getAll_sinAlmacenes() {
      when(inAlmacenDao.findAllByEmpresaIdAndSucursalId(EMPRESA_ID, SUCURSAL_ID))
          .thenReturn(Collections.emptyList());

      assertThat(service.getAll()).isEmpty();
    }

    @Test
    @DisplayName("getAllActive() filtra solo los almacenes con estadoId='ACT'")
    void getAllActive_filtraSoloActivos() {
      List<InAlmacen> lista =
          List.of(almacenFake(1, "ACT"), almacenFake(2, "INA"), almacenFake(3, "ACT"));
      when(inAlmacenDao.findAllByEmpresaIdAndSucursalId(EMPRESA_ID, SUCURSAL_ID)).thenReturn(lista);

      List<InAlmacen> result = service.getAllActive();

      assertThat(result).hasSize(2);
      assertThat(result).allMatch(a -> "ACT".equals(a.getEstadoId()));
    }

    @Test
    @DisplayName("getAllActive() retorna lista vacía cuando todos están inactivos")
    void getAllActive_todosInactivos() {
      List<InAlmacen> lista = List.of(almacenFake(1, "INA"), almacenFake(2, "INA"));
      when(inAlmacenDao.findAllByEmpresaIdAndSucursalId(EMPRESA_ID, SUCURSAL_ID)).thenReturn(lista);

      assertThat(service.getAllActive()).isEmpty();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // disable() / enable()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("disable() / enable()")
  class DisableEnable {

    @Test
    @DisplayName("disable() cambia el estadoId a 'INA'")
    void disable_cambiaEstadoAInactivo() {
      InAlmacen existente = almacenFake(ALMACEN_ID, "ACT");
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ID, EMPRESA_ID))
          .thenReturn(Optional.of(existente));

      service.disable(ALMACEN_ID);

      ArgumentCaptor<InAlmacen> captor = ArgumentCaptor.forClass(InAlmacen.class);
      verify(inAlmacenDao).save(captor.capture());
      assertThat(captor.getValue().getEstadoId()).isEqualTo("INA");
    }

    @Test
    @DisplayName("disable() lanza RecordNotFoundException cuando el almacén no existe")
    void disable_noEncontrado() {
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ID, EMPRESA_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.disable(ALMACEN_ID))
          .isInstanceOf(RecordNotFoundException.class);
      verify(inAlmacenDao, never()).save(any());
    }

    @Test
    @DisplayName("enable() cambia el estadoId a 'ACT'")
    void enable_cambiaEstadoAActivo() {
      InAlmacen existente = almacenFake(ALMACEN_ID, "INA");
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ID, EMPRESA_ID))
          .thenReturn(Optional.of(existente));

      service.enable(ALMACEN_ID);

      ArgumentCaptor<InAlmacen> captor = ArgumentCaptor.forClass(InAlmacen.class);
      verify(inAlmacenDao).save(captor.capture());
      assertThat(captor.getValue().getEstadoId()).isEqualTo("ACT");
    }

    @Test
    @DisplayName("enable() lanza RecordNotFoundException cuando el almacén no existe")
    void enable_noEncontrado() {
      when(inAlmacenDao.findByIdAndEmpresaId(ALMACEN_ID, EMPRESA_ID)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.enable(ALMACEN_ID))
          .isInstanceOf(RecordNotFoundException.class);
      verify(inAlmacenDao, never()).save(any());
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // buscar()
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("buscar()")
  class Buscar {

    @Test
    @DisplayName("sin sucursalId en el criteria busca por toda la empresa")
    void buscar_sinSucursalId_buscaPorEmpresa() {
      InAlmacenSearchCriteria criteria = new InAlmacenSearchCriteria();
      when(inAlmacenDao.findAllByEmpresaId(EMPRESA_ID))
          .thenReturn(List.of(almacenFake(ALMACEN_ID, "ACT")));

      List<InAlmacenResumenDTO> result = service.buscar(criteria);

      assertThat(result).hasSize(1);
      verify(inAlmacenDao).findAllByEmpresaId(EMPRESA_ID);
      verify(inAlmacenDao, never()).findAllByEmpresaIdAndSucursalId(anyInt(), anyInt());
    }

    @Test
    @DisplayName("con sucursalId en el criteria busca cross-sucursal por esa sucursal")
    void buscar_conSucursalId_buscaPorSucursal() {
      Integer otraSucursal = 55;
      InAlmacenSearchCriteria criteria = new InAlmacenSearchCriteria();
      criteria.setSucursalId(otraSucursal);
      when(inAlmacenDao.findAllByEmpresaIdAndSucursalId(EMPRESA_ID, otraSucursal))
          .thenReturn(List.of(almacenFake(ALMACEN_ID, "ACT")));

      List<InAlmacenResumenDTO> result = service.buscar(criteria);

      assertThat(result).hasSize(1);
      verify(inAlmacenDao).findAllByEmpresaIdAndSucursalId(EMPRESA_ID, otraSucursal);
      verify(inAlmacenDao, never()).findAllByEmpresaId(anyInt());
    }

    @Test
    @DisplayName("filtra por nombre (contains, case-insensitive)")
    void buscar_filtraPorNombre() {
      InAlmacenSearchCriteria criteria = new InAlmacenSearchCriteria();
      criteria.setNombre("central");
      InAlmacen match = almacenFake(1, "ACT");
      match.setNombre("Almacén Central Norte");
      InAlmacen noMatch = almacenFake(2, "ACT");
      noMatch.setNombre("Depósito Sur");
      when(inAlmacenDao.findAllByEmpresaId(EMPRESA_ID)).thenReturn(List.of(match, noMatch));

      List<InAlmacenResumenDTO> result = service.buscar(criteria);

      assertThat(result).hasSize(1);
      assertThat(result.get(0).getNombre()).isEqualTo("Almacén Central Norte");
    }

    @Test
    @DisplayName("filtra por estadoId exacto")
    void buscar_filtraPorEstado() {
      InAlmacenSearchCriteria criteria = new InAlmacenSearchCriteria();
      criteria.setEstadoId("INA");
      when(inAlmacenDao.findAllByEmpresaId(EMPRESA_ID))
          .thenReturn(List.of(almacenFake(1, "ACT"), almacenFake(2, "INA")));

      List<InAlmacenResumenDTO> result = service.buscar(criteria);

      assertThat(result).hasSize(1);
      assertThat(result.get(0).getEstadoId()).isEqualTo("INA");
    }

    @Test
    @DisplayName("nombre en blanco no filtra (retorna todos)")
    void buscar_nombreEnBlanco_noFiltra() {
      InAlmacenSearchCriteria criteria = new InAlmacenSearchCriteria();
      criteria.setNombre("   ");
      when(inAlmacenDao.findAllByEmpresaId(EMPRESA_ID))
          .thenReturn(List.of(almacenFake(1, "ACT"), almacenFake(2, "ACT")));

      assertThat(service.buscar(criteria)).hasSize(2);
    }

    @Test
    @DisplayName("mapea correctamente el DTO de resumen incluyendo datos de sucursal")
    void buscar_mapeaResumenDTO() {
      InAlmacenSearchCriteria criteria = new InAlmacenSearchCriteria();
      InAlmacen almacen = almacenFake(ALMACEN_ID, "ACT");
      when(inAlmacenDao.findAllByEmpresaId(EMPRESA_ID)).thenReturn(List.of(almacen));

      InAlmacenResumenDTO dto = service.buscar(criteria).get(0);

      assertThat(dto.getId()).isEqualTo(ALMACEN_ID);
      assertThat(dto.getNombre()).isEqualTo(almacen.getNombre());
      assertThat(dto.getUbicacion()).isEqualTo(almacen.getUbicacion());
      assertThat(dto.getSucursalId()).isEqualTo(SUCURSAL_ID);
      assertThat(dto.getSucursalNombre()).isEqualTo("Sucursal Principal");
      assertThat(dto.getEstadoId()).isEqualTo("ACT");
      assertThat(dto.getUsuarioReg()).isEqualTo(USERNAME);
    }

    @Test
    @DisplayName("retorna lista vacía cuando no hay almacenes")
    void buscar_sinResultados() {
      InAlmacenSearchCriteria criteria = new InAlmacenSearchCriteria();
      when(inAlmacenDao.findAllByEmpresaId(EMPRESA_ID)).thenReturn(Collections.emptyList());

      assertThat(service.buscar(criteria)).isEmpty();
    }

    @Test
    @DisplayName("no incluye datos de sucursal cuando sucursalId del almacén es null")
    void buscar_sucursalNull_noRompe() {
      InAlmacenSearchCriteria criteria = new InAlmacenSearchCriteria();
      InAlmacen almacen = almacenFake(ALMACEN_ID, "ACT");
      almacen.setSucursalId(null);
      when(inAlmacenDao.findAllByEmpresaId(EMPRESA_ID)).thenReturn(List.of(almacen));

      InAlmacenResumenDTO dto = service.buscar(criteria).get(0);

      assertThat(dto.getSucursalId()).isNull();
      assertThat(dto.getSucursalNombre()).isNull();
    }
  }
}
