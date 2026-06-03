package com.braintech.eFacturador.controllers.seguridad;

import com.braintech.eFacturador.interfaces.seguridad.FeaturePlanService;
import com.braintech.eFacturador.jpa.seguridad.SgFeaturePlan;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints de administración de features. Solo accesibles por empresa_id = 1 (operador SaaS). Ruta
 * base: /api/v1/admin/feature-plan
 */
@RestController
@RequestMapping("api/v1/admin/feature-plan")
@RequiredArgsConstructor
public class FeaturePlanController {

  private static final Integer SAAS_OPERATOR_EMPRESA_ID = 1;

  private final FeaturePlanService featurePlanService;
  private final TenantContext tenantContext;

  /** Lista todos los planes de features para una empresa. */
  @GetMapping("/empresa/{empresaId}")
  public ResponseEntity<List<SgFeaturePlan>> getByEmpresa(@PathVariable Integer empresaId) {
    requireAdmin();
    return ResponseEntity.ok(featurePlanService.findAllByEmpresa(empresaId));
  }

  /** Lista todas las empresas que tienen un feature específico. */
  @GetMapping("/feature/{featureId}")
  public ResponseEntity<List<SgFeaturePlan>> getByFeature(@PathVariable String featureId) {
    requireAdmin();
    return ResponseEntity.ok(featurePlanService.findAllByFeature(featureId));
  }

  /**
   * Habilita o deshabilita un feature para una empresa. Body: { empresaId, featureId, habilitado }
   */
  @PostMapping
  public ResponseEntity<SgFeaturePlan> save(@RequestBody SgFeaturePlan plan) {
    requireAdmin();
    return ResponseEntity.ok(featurePlanService.save(plan));
  }

  private void requireAdmin() {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    if (!SAAS_OPERATOR_EMPRESA_ID.equals(empresaId)) {
      throw new SecurityException("Acceso restringido al administrador del sistema.");
    }
  }
}
