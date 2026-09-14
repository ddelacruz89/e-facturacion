package com.braintech.eFacturador.jpa.contabilidad;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Catálogo global del sistema (Activo, Pasivo, Capital, Ingreso, Costo, Gasto). */
@Entity
@Table(name = "mc_tipo_cuenta", schema = "contabilidad")
@Data
@NoArgsConstructor
public class McTipoCuenta implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @Column(name = "tipo_cuenta")
  private String tipoCuenta;

  /** {@code true} = naturaleza crédito (el saldo aumenta con crédito); {@code false} = débito. */
  @Column(name = "cr")
  private Boolean cr;
}
