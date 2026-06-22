package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntitySucursal;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
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
public class MfCotizacion extends BaseEntitySucursal implements Serializable {

  @Column(name = "activo")
  private Boolean activo;

  @Column(name = "razon_social")
  private String razonSocial;

  @Column(name = "secuencia")
  private Integer secuencia;

  @Column(name = "rnc")
  private String rnc;

  @Column(name = "tipo_comprobante_id")
  private String tipoComprobanteId;

  @Column(name = "nota")
  private String nota;

  @Column(name = "cliente_id")
  private Integer clienteId;

  @Column(name = "monto", precision = 18, scale = 2)
  private BigDecimal monto;

  @Column(name = "descuento", precision = 18, scale = 2)
  private BigDecimal descuento;

  @Column(name = "itbis", precision = 18, scale = 2)
  private BigDecimal itbis;

  @Column(name = "retencion_id")
  private Integer retencionId;

  @Column(name = "retencion_itbis", precision = 18, scale = 2)
  private BigDecimal retencionItbis;

  @Column(name = "retencion_isr", precision = 18, scale = 2)
  private BigDecimal retencionIsr;

  @Column(name = "total", precision = 18, scale = 2)
  private BigDecimal total;

  @OneToMany(mappedBy = "cotizacion", cascade = CascadeType.ALL, orphanRemoval = true)
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
