package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.SuperClass.BaseDgII;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import lombok.*;

@Entity
@Table(name = "mf_factura", schema = "facturacion")
@Getter
@Setter
@JsonIdentityInfo(
    scope = MfFactura.class,
    generator = ObjectIdGenerators.PropertyGenerator.class,
    property = "id")
@EqualsAndHashCode(callSuper = false)
public class MfFactura extends BaseDgII implements Serializable {
  @Serial private static final long serialVersionUID = 1L;

  @Column(name = "tipo_factura_id")
  private Integer tipoFacturaId;

  @Column(name = "cliente_id")
  private Integer clienteId;

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

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "facturaId", fetch = FetchType.LAZY)
  @OrderBy("id asc")
  private List<MfFacturaDetalle> detalles;

  public MfFactura(int i) {
    super(i);
  }

  public MfFactura() {
    super();
  }

  public void sumTotal() {
    this.total = this.monto.subtract(this.descuento).add(this.itbis);
  }
}
