package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.SuperClass.BaseDgII;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "mf_cotizacion", schema = "facturacion")
@Getter
@Setter
@JsonIdentityInfo(
    scope = MfCotizacion.class,
    generator = ObjectIdGenerators.PropertyGenerator.class,
    property = "id")
@EqualsAndHashCode(callSuper = false)
public class MfCotizacion extends BaseDgII implements Serializable {
  @Serial private static final long serialVersionUID = 1L;

  @Column(name = "tipo_factura_id")
  private Integer tipoFacturaId;

  @Column(name = "retencion_id")
  private String retenciionId;

  @Column(name = "cliente_id")
  private Integer clienteId;

  @Column(name = "fecha_limite_pago")
  private LocalDate fechaLimitePago;

  @Column(name = "razon_social")
  private String razonSocial;

  @Column(name = "rnc")
  private String rnc;

  @Column(name = "estado_id")
  private String estadoId;

  @Column(name = "monto")
  private BigDecimal monto;

  @Column(name = "descuento")
  private BigDecimal descuento;

  @Column(name = "itbis")
  private BigDecimal itbis;

  @Column(name = "retencion_itbis")
  private BigDecimal retencionItbis;

  @Column(name = "retencion_isr")
  private BigDecimal retencionIsr;

  @Column(name = "total")
  private BigDecimal total;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "cotizacionId", fetch = FetchType.LAZY)
  @OrderBy("id asc")
  private List<MfCotizacionDetalle> detalles;

  public MfCotizacion(int i) {
    super(i);
  }

  public MfCotizacion() {
    super();
  }

  public void sumTotal() {
    this.total = this.monto.subtract(this.descuento).add(this.itbis);
  }
}
