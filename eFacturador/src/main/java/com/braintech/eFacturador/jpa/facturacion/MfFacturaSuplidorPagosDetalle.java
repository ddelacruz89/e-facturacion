package com.braintech.eFacturador.jpa.facturacion;

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
@Table(name = "mf_factura_suplidor_pagos_detalle", schema = "facturacion")
@Getter
@Setter
@NoArgsConstructor
public class MfFacturaSuplidorPagosDetalle implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "factura_suplidor_pagos_header_id", nullable = false)
  @JsonIgnoreProperties({"detalles", "hibernateLazyInitializer", "handler"})
  private MfFacturaSuplidorPagosHeader pagosHeader;

  @Column(name = "numero_referencia")
  private String numeroReferencia;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "forma_pago_id")
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private MfFacturaSuplidorFormaPago formaPago;

  @Column(name = "monto_pagado", nullable = false, precision = 15, scale = 2)
  private BigDecimal montoPagado;

  @Column(name = "fecha_pago")
  private LocalDateTime fechaPago;

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @Column(name = "concepto")
  private String concepto;

  @Column(name = "tipo_pago")
  private Integer tipoPago;

  @Column(name = "estado")
  private String estado;
}
