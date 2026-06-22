package com.braintech.eFacturador.interfaces.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgEmpresaIpPermitida;
import java.util.List;

public interface SgEmpresaIpPermitidaService {

  List<SgEmpresaIpPermitida> getAll();

  SgEmpresaIpPermitida save(SgEmpresaIpPermitida ip);

  SgEmpresaIpPermitida toggleActivo(Integer id);

  void delete(Integer id);

  /**
   * Retorna true si la IP tiene permiso de login para la empresa dada. Si la empresa no tiene
   * ninguna IP configurada (activa), no hay restricción → true. Si tiene IPs configuradas, la IP
   * debe estar en la lista → true/false. Usuarios soporte (esSoporte=true) no deben pasar por aquí.
   */
  boolean ipAutorizada(Integer empresaId, String ip);
}
