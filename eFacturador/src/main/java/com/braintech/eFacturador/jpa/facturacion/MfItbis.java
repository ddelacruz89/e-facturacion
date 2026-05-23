package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntityPk;
import com.braintech.eFacturador.jpa.general.MgItbis;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "mf_itbis", schema = "facturacion")
@Getter
@Setter
@NoArgsConstructor
public class MfItbis extends BaseEntityPk implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "usuario_reg", nullable = false)
  private String usuarioReg;

  @Column(name = "nombre")
  private String nombre;

  @Column(name = "itbis")
  private BigDecimal itbis;

  @Column(name = "cuenta_contable")
  private String cuentaContable;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "mg_itbis_id", nullable = false)
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private MgItbis mgItbis;
}
