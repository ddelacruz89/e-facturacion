package com.braintech.eFacturador.jpa.contabilidad;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.*;

@Entity
@Table(name = "mc_catalago_cuenta", schema = "contabilidad")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class McCatalogoCuenta extends BaseEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @Column(name = "empresa_id")
  private Integer empresaId;

  @Column(name = "numero_cuenta")
  private String numeroCuenta;

  @Column(name = "nivel")
  private Integer nivelCuenta;

  @Column(name = "general")
  private Integer secuencia;

  @Column(name = "nombre_cuenta")
  private Integer nombreCuenta;

  @Column(name = "saldo")
  private BigDecimal saldoCuenta;

  @Column(name = "cuenta_id")
  private Integer cuentaId;
}
