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

  private Integer FacturaId;
  private BigDecimal Efectivo;
  private BigDecimal Transferencia;
  private BigDecimal Cheque;
  private BigDecimal Tarjeta;
  private BigDecimal NotaCredito;
  private BigDecimal Otros;
  private BigDecimal Total;
  private String Comentario;
  private String usuarioReg;
  private LocalDate fechaReg;
  private Boolean activo;
}
