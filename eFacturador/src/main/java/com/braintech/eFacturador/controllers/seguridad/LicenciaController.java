package com.braintech.eFacturador.controllers.seguridad;

import com.braintech.eFacturador.interfaces.seguridad.LicenciaService;
import com.braintech.eFacturador.jpa.seguridad.SgLicencia;
import com.braintech.eFacturador.jpa.seguridad.SgLicenciaModulo;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Administración de licencias. Solo accesible por empresa_id = 1 (operador SaaS). Ruta base:
 * /api/v1/admin/licencias
 */
@RestController
@RequestMapping("api/v1/admin/licencias")
@RequiredArgsConstructor
public class LicenciaController {

  private static final Integer SAAS_OPERATOR_EMPRESA_ID = 1;

  private final LicenciaService licenciaService;
  private final TenantContext tenantContext;

  @GetMapping
  public ResponseEntity<List<SgLicencia>> getAll() {
    requireAdmin();
    return ResponseEntity.ok(licenciaService.getAll());
  }

  @GetMapping("/{empresaId}")
  public ResponseEntity<SgLicencia> getLicencia(@PathVariable Integer empresaId) {
    requireAdmin();
    return ResponseEntity.ok(licenciaService.getLicencia(empresaId));
  }

  @PostMapping
  public ResponseEntity<SgLicencia> save(@RequestBody SgLicencia licencia) {
    requireAdmin();
    return ResponseEntity.ok(licenciaService.save(licencia));
  }

  @PutMapping("/{empresaId}")
  public ResponseEntity<SgLicencia> update(
      @PathVariable Integer empresaId, @RequestBody SgLicencia licencia) {
    requireAdmin();
    return ResponseEntity.ok(licenciaService.update(empresaId, licencia));
  }

  @GetMapping("/{empresaId}/modulos")
  public ResponseEntity<List<SgLicenciaModulo>> getModulos(@PathVariable Integer empresaId) {
    requireAdmin();
    return ResponseEntity.ok(licenciaService.getModulosHabilitados(empresaId));
  }

  @PostMapping("/{empresaId}/modulos/{moduloId}")
  public ResponseEntity<SgLicenciaModulo> habilitarModulo(
      @PathVariable Integer empresaId, @PathVariable String moduloId) {
    requireAdmin();
    return ResponseEntity.ok(licenciaService.habilitarModulo(empresaId, moduloId));
  }

  @DeleteMapping("/{empresaId}/modulos/{moduloId}")
  public ResponseEntity<Void> deshabilitarModulo(
      @PathVariable Integer empresaId, @PathVariable String moduloId) {
    requireAdmin();
    licenciaService.deshabilitarModulo(empresaId, moduloId);
    return ResponseEntity.noContent().build();
  }

  private void requireAdmin() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    if (!SAAS_OPERATOR_EMPRESA_ID.equals(empresaId)) {
      throw new SecurityException("Acceso restringido al administrador del sistema.");
    }
  }
}
