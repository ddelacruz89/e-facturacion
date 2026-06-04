package com.braintech.eFacturador.security;

import com.braintech.eFacturador.dao.seguridad.SgMenuRepository;
import com.braintech.eFacturador.dao.seguridad.SgPermisoRepository;
import com.braintech.eFacturador.exceptions.AccesoDenegadoException;
import com.braintech.eFacturador.interfaces.seguridad.LicenciaService;
import com.braintech.eFacturador.jpa.seguridad.SgPermiso;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

/**
 * Intercepta métodos anotados con {@link RequierePermiso} y verifica que el usuario autenticado
 * tenga el flag de permiso correspondiente en al menos uno de sus roles activos para la sucursal
 * actual.
 *
 * <p>Si no tiene permiso se lanza {@link AccesoDenegadoException}, que el {@code
 * GlobalDatabaseExceptionHandler} convierte en HTTP 403.
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class PermisoAspect {

  private final SgPermisoRepository permisoRepository;
  private final SgMenuRepository menuRepository;
  private final LicenciaService licenciaService;
  private final TenantContext tenantContext;

  @Before("@annotation(requierePermiso)")
  public void verificarPermiso(RequierePermiso requierePermiso) {

    String username = tenantContext.getCurrentUsername();
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Integer sucursalId = tenantContext.getCurrentSucursalId();
    String menuUrl = requierePermiso.menuUrl();
    Accion accion = requierePermiso.accion();

    List<SgPermiso> permisos =
        permisoRepository.findPermisosForMenu(username, empresaId, sucursalId, menuUrl);

    boolean autorizado =
        permisos.stream()
            .anyMatch(
                p ->
                    switch (accion) {
                      case LEER -> Boolean.TRUE.equals(p.getPuedeLeer());
                      case ESCRIBIR -> Boolean.TRUE.equals(p.getPuedeEscribir());
                      case ELIMINAR -> Boolean.TRUE.equals(p.getPuedeEliminar());
                      case IMPRIMIR -> Boolean.TRUE.equals(p.getPuedeImprimir());
                    });

    if (!autorizado) {
      log.warn(
          "Acceso denegado — usuario={} empresaId={} sucursalId={} menuUrl={} accion={}",
          username,
          empresaId,
          sucursalId,
          menuUrl,
          accion);
      String accionLabel =
          switch (accion) {
            case LEER -> "consultar";
            case ESCRIBIR -> "guardar";
            case ELIMINAR -> "eliminar";
            case IMPRIMIR -> "imprimir";
          };
      throw new AccesoDenegadoException(
          "No tiene permiso para "
              + accionLabel
              + " en este módulo. "
              + "Contacte al administrador para solicitar acceso.");
    }

    // Verificar que el módulo esté habilitado en la licencia
    Optional<String> moduloId = menuRepository.findModuloIdByUrl(menuUrl);
    if (moduloId.isPresent() && !licenciaService.isModuloHabilitado(empresaId, moduloId.get())) {
      log.warn(
          "Módulo no licenciado — usuario={} empresaId={} moduloId={} menuUrl={}",
          username,
          empresaId,
          moduloId.get(),
          menuUrl);
      throw new AccesoDenegadoException(
          "El módulo '"
              + moduloId.get()
              + "' no está habilitado en su licencia. Contacte al administrador.");
    }

    log.debug("Permiso OK — usuario={} menuUrl={} accion={}", username, menuUrl, accion);
  }
}
