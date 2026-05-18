package com.braintech.eFacturador.jpa.facturacion;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "mf_factura_suplidor_pagos_header", schema = "facturacion")
@Getter
@Setter
@NoArgsConstructor
public class MfFacturaSuplidorPagosHeader implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "factura_suplidor_id", nullable = false)
  @JsonIgnoreProperties({"detalles", "hibernateLazyInitializer", "handler"})
  private MfFacturaSuplidor facturaSuplidor;

  @Column(name = "monto", precision = 10, scale = 2)
  private BigDecimal monto;

  @Column(name = "pagado", precision = 10, scale = 2)
  private BigDecimal pagado;

  @Column(name = "fecha_pago")
  private LocalDateTime fechaPago;

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @Column(name = "fecha_anulado")
  private LocalDateTime fechaAnulado;

  @Column(name = "usuario_anulacion")
  private String usuarioAnulacion;

  @Column(name = "estado_id")
  private String estadoId;

  @Column(name = "contable_id")
  private Integer contableId;

  @OneToMany(
      mappedBy = "pagosHeader",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  @OrderBy("id ASC")
  @JsonIgnoreProperties("pagosHeader")
  private List<MfFacturaSuplidorPagosDetalle> detalles = new ArrayList<>();
}
