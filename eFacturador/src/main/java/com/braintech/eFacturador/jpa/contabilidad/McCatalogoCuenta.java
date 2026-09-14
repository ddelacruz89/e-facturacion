package com.braintech.eFacturador.jpa.contabilidad;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntityPk;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Plan de cuentas contables — árbol por empresa (nivel1..nivel4, hasta 4 niveles de profundidad).
 */
@Entity
@Getter
@Setter
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@Table(
    name = "mc_catalogo_cuenta",
    schema = "contabilidad",
    uniqueConstraints = @UniqueConstraint(columnNames = {"empresa_id", "cuenta"}))
public class McCatalogoCuenta extends BaseEntityPk implements Serializable {

  private static final long serialVersionUID = 1L;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "tipo_cuenta_id")
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private McTipoCuenta tipoCuentaId;

  /** Cuenta padre en el árbol. {@code null} = cuenta raíz (nivel 1). */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "cuenta_padre_id")
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private McCatalogoCuenta cuentaPadreId;

  @Column(name = "nivel1", length = 3)
  private String nivel1;

  @Column(name = "nivel2", length = 2)
  private String nivel2;

  @Column(name = "nivel3", length = 1)
  private String nivel3;

  @Column(name = "nivel4", length = 4)
  private String nivel4;

  @Column(name = "nivel")
  private Integer nivel;

  /** Orden de despliegue entre cuentas hermanas dentro del árbol. */
  @Column(name = "orden")
  private Integer orden;

  @Column(name = "cuenta", length = 45)
  private String cuenta;

  @Column(name = "nombre_cuenta", length = 100)
  private String nombreCuenta;

  @Column(name = "permite_movimiento", nullable = false)
  private Boolean permiteMovimiento = true;

  /** Saldo importado del sistema anterior. Histórico — no se recalcula desde el módulo. */
  @Column(name = "saldo_cuenta")
  private BigDecimal saldoCuenta;

  /** Código de cuenta de referencia en la data legacy migrada. Solo informativo, no es FK. */
  @Column(name = "control", length = 45)
  private String control;

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @Column(name = "fecha_reg")
  private LocalDateTime fechaReg;

  @Column(name = "estado_id")
  private String estadoId;
}
