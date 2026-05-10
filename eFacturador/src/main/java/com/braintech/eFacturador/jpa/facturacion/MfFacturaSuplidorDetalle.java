package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.general.MgItbis;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "mf_factura_suplidor_detalle", schema = "facturacion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MfFacturaSuplidorDetalle implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "factura_suplidor_id", nullable = false)
  @JsonIgnoreProperties({"detalles", "hibernateLazyInitializer", "handler"})
  private MfFacturaSuplidor facturaSuplidor;

  @Column(name = "cantidad")
  private Integer cantidad;

  @Column(name = "precio_unitario", precision = 20, scale = 4)
  private BigDecimal precioUnitario;

  @Column(name = "monto_item")
  private BigDecimal montoItem;

  @Column(name = "concepto")
  private String concepto;

  @Column(name = "subtotal")
  private BigDecimal subtotal;

  @Column(name = "retencion")
  private BigDecimal retencion;

  @Column(name = "retencion_porciento")
  private Double retencionPorciento;

  @Column(name = "monto_descuento")
  private BigDecimal montoDescuento;

  @Column(name = "monto_recargo")
  private BigDecimal montoRecargo;

  @Column(name = "itbis")
  private BigDecimal itbis;

  @Column(name = "monto_itbis_retenido")
  private BigDecimal montoItbisRetenido;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "itbis_id", nullable = false)
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private MgItbis itbisObj;

  @Column(name = "itbis_porciento")
  private Double itbisPorciento;

  @Column(name = "total")
  private BigDecimal total;

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @Column(name = "fecha_reg")
  private LocalDateTime fechaReg;

  @Column(name = "indicador_bien_servicio")
  private Boolean indicadorBienServicio;

  @Column(name = "estado")
  private String estado;

  /** FK a mf_factura_suplidor_forma_pagos — solo se guarda el ID, sin entidad mapeada. */
  @Column(name = "forma_pago_id")
  private Integer formaPagoId;

  /** Lista de descuentos aplicados a este renglón ($ o %). */
  @OneToMany(
      mappedBy = "detalle",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  @JsonIgnoreProperties("detalle")
  private List<MfFacturaSuplidorDetalleDescuento> descuentos = new ArrayList<>();
}
