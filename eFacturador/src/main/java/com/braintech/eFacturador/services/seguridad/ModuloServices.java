package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dao.seguridad.ModuloDao;
import com.braintech.eFacturador.dao.seguridad.SgPermisoRepository;
import com.braintech.eFacturador.exceptions.DataNotFoundDTO;
import com.braintech.eFacturador.interfaces.IBaseString;
import com.braintech.eFacturador.interfaces.seguridad.LicenciaService;
import com.braintech.eFacturador.jpa.seguridad.SgModulo;
import com.braintech.eFacturador.jpa.seguridad.dto.MenuDtoImpl;
import com.braintech.eFacturador.jpa.seguridad.dto.ModuloDto;
import com.braintech.eFacturador.jpa.seguridad.dto.ModuloDtoImpl;
import com.braintech.eFacturador.jpa.seguridad.dto.menuDto;
import com.braintech.eFacturador.models.Response;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ModuloServices implements IBaseString<SgModulo> {

  final ModuloDao moduloDao;
  final SgPermisoRepository permisoRepository;
  final TenantContext tenantContext;
  final LicenciaService licenciaService;

  @Override
  public Response<SgModulo> getFindById(String id) {
    Optional<SgModulo> entity = moduloDao.findById(id);
    if (entity.isPresent()) {
      return Response.<SgModulo>builder().content(entity.get()).status(HttpStatus.OK).build();
    } else {
      return Response.<SgModulo>builder()
          .status(HttpStatus.NOT_FOUND)
          .error(new DataNotFoundDTO("Modulo no encontrado"))
          .build();
    }
  }

  @Override
  public Response<List<ModuloDto>> getFindByAll() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();

    // Modo soporte: retornar todos los menús activos de módulos licenciados.
    // El usuario soporte no tiene SgUsuarioRol en el tenant, pero puede
    // ver todo en modo solo-lectura (PermisoAspect garantiza que no puede escribir).
    if (tenantContext.isEsSoporte()) {
      Set<String> modulosLicenciadosSoporte = getModulosLicenciados(empresaId);
      List<ModuloDto> resultSoporte =
          moduloDao.findAll().stream()
              .filter(m -> modulosLicenciadosSoporte.contains(m.getId()))
              .map(
                  modulo -> {
                    List<menuDto> menus =
                        modulo.getMenus().stream()
                            .filter(m -> Boolean.TRUE.equals(m.getActivo()))
                            .map(
                                m ->
                                    (menuDto)
                                        new MenuDtoImpl(
                                            m.getId(), m.getMenu(), m.getUrl(), m.getUrlSql()))
                            .toList();
                    return (ModuloDto)
                        new ModuloDtoImpl(modulo.getId(), modulo.getModulo(), menus, false);
                  })
              .filter(m -> !m.getMenus().isEmpty())
              .toList();
      return Response.<List<ModuloDto>>builder()
          .content(resultSoporte)
          .status(HttpStatus.OK)
          .build();
    }

    String username = tenantContext.getCurrentUsername();
    Integer sucursalId = tenantContext.getCurrentSucursalId();

    Set<Integer> menuIdsPermitidos =
        permisoRepository.findMenuIdsPermitidos(username, empresaId, sucursalId);

    Set<String> modulosLicenciados = getModulosLicenciados(empresaId);

    List<ModuloDto> result =
        moduloDao.findAll().stream()
            .map(
                modulo -> {
                  boolean sinLicencia = !modulosLicenciados.contains(modulo.getId());

                  List<menuDto> menusPermitidos =
                      modulo.getMenus().stream()
                          .filter(
                              m ->
                                  Boolean.TRUE.equals(m.getActivo())
                                      && menuIdsPermitidos.contains(m.getId()))
                          .map(
                              m ->
                                  (menuDto)
                                      new MenuDtoImpl(
                                          m.getId(), m.getMenu(), m.getUrl(), m.getUrlSql()))
                          .toList();

                  return (ModuloDto)
                      new ModuloDtoImpl(
                          modulo.getId(), modulo.getModulo(), menusPermitidos, sinLicencia);
                })
            .filter(m -> !m.getMenus().isEmpty() && !Boolean.TRUE.equals(m.getSinLicencia()))
            .toList();

    if (!result.isEmpty()) {
      return Response.<List<ModuloDto>>builder().content(result).status(HttpStatus.OK).build();
    } else {
      return Response.<List<ModuloDto>>builder()
          .status(HttpStatus.NOT_FOUND)
          .error(new DataNotFoundDTO("Modulos no encontrado"))
          .build();
    }
  }

  /** Todos los módulos y menús sin filtrar — para la pantalla de gestión de roles. */
  public Response<List<ModuloDto>> getTodos() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Set<String> modulosLicenciados = getModulosLicenciados(empresaId);

    List<ModuloDto> result =
        moduloDao.findAll().stream()
            .map(
                modulo -> {
                  boolean sinLicencia = !modulosLicenciados.contains(modulo.getId());

                  List<menuDto> menus =
                      modulo.getMenus().stream()
                          .filter(m -> Boolean.TRUE.equals(m.getActivo()))
                          .map(
                              m ->
                                  (menuDto)
                                      new MenuDtoImpl(
                                          m.getId(), m.getMenu(), m.getUrl(), m.getUrlSql()))
                          .toList();

                  return (ModuloDto)
                      new ModuloDtoImpl(modulo.getId(), modulo.getModulo(), menus, sinLicencia);
                })
            .filter(m -> !m.getMenus().isEmpty())
            .toList();

    if (!result.isEmpty()) {
      return Response.<List<ModuloDto>>builder().content(result).status(HttpStatus.OK).build();
    } else {
      return Response.<List<ModuloDto>>builder()
          .status(HttpStatus.NOT_FOUND)
          .error(new DataNotFoundDTO("Modulos no encontrado"))
          .build();
    }
  }

  @Override
  public Response<SgModulo> save(SgModulo entity) {
    return null;
  }

  private Set<String> getModulosLicenciados(Integer empresaId) {
    return licenciaService.getModulosHabilitados(empresaId).stream()
        .map(lm -> lm.getModulo().getId())
        .collect(Collectors.toSet());
  }
}
