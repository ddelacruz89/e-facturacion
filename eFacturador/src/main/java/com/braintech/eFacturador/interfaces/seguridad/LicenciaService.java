package com.braintech.eFacturador.interfaces.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgLicencia;
import com.braintech.eFacturador.jpa.seguridad.SgLicenciaModulo;
import java.util.List;

public interface LicenciaService {

  List<SgLicencia> getAll();

  SgLicencia getLicencia(Integer empresaId);

  SgLicencia save(SgLicencia licencia);

  SgLicencia update(Integer empresaId, SgLicencia licencia);

  /** Lanza LicenciaExcedidaException si la empresa alcanzó el tope de usuarios activos. */
  void validarLimiteUsuarios(Integer empresaId);

  /** Lanza LicenciaExcedidaException si la empresa alcanzó el tope de sucursales. */
  void validarLimiteSucursales(Integer empresaId);

  /** Devuelve true si el módulo está habilitado para la empresa (o si empresaId == 1). */
  boolean isModuloHabilitado(Integer empresaId, String moduloId);

  List<SgLicenciaModulo> getModulosHabilitados(Integer empresaId);

  SgLicenciaModulo habilitarModulo(Integer empresaId, String moduloId);

  void deshabilitarModulo(Integer empresaId, String moduloId);
}
