package com.braintech.eFacturador.jpa.general;

import com.braintech.eFacturador.jpa.contabilidad.McCatalogoCuenta;
import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Catálogo global de retenciones de ITBIS/ISR.
 * No pertenece a ningún tenant — es compartido por todas las empresas.
 */
@Entity
@Table(name = "mg_retenciones_itbis", schema = "general")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class MgRetencionItbis implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @Column(name = "descripcion", length = 50)
  private String descripcion;

  /** Valor de la retención (porcentaje, ej. 30 = 30%). */
  @Column(name = "valor", nullable = false, precision = 10, scale = 0)
  private BigDecimal valor;

  /**
   * Cuenta contable que retiene (quien descuenta).
   * FK → contabilidad.mc_catalago_cuenta
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "retener_cuenta_id")
  private McCatalogoCuenta retenerCuenta;

  /**
   * Cuenta contable del retenido (a quien se le descuenta).
   * FK → contabilidad.mc_catalago_cuenta
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "retenido_cuenta_id")
  private McCatalogoCuenta retenidoCuenta;

  /** Texto que aparece en el pie de la factura como nota de retención. */
  @Column(name = "comentario_factura", length = 500)
  private String comentarioFactura;

  /**
   * true → la retención se aplica sobre el total de la factura.
   * false → se aplica solo sobre el ITBIS.
   */
  @Column(name = "al_total")
  private Boolean alTotal = false;

  /** Tipo de retención: "ITBIS" | "ISR". */
  @Column(name = "tipo_retencion", length = 45)
  private String tipoRetencion = "ITBIS";
}
