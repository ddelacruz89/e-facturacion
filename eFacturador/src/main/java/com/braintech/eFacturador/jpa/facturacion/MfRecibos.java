package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntityPk;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "mf_recibos", schema = "facturacion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MfRecibos extends BaseEntityPk {
  private static final long serialVersionUID = 1L;

  private Integer facturaId;
  private BigDecimal efectivo;
  private BigDecimal transferencia;
  private BigDecimal cheque;
  private BigDecimal tarjeta;
  private BigDecimal notaCredito;
  private BigDecimal otros;
  private BigDecimal total;
  private String comentario;
  private String usuarioReg;
  private LocalDate fechaReg;
  private Boolean activo;
}
