package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.SuperClass.BaseDgII;
import com.braintech.eFacturador.jpa.SuperClass.BaseEmpesaPk;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;
import lombok.*;

@Entity
@Table(name = "mf_factura", schema = "facturacion")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@IdClass(BaseEmpesaPk.class)
public class MfFactura extends BaseDgII {
  @Id
  @Column(name = "id")
  private Integer id;

  @Id
  @Column(name = "empresa_id")
  private Integer empresaId;

  @Column(name = "numeroFactura")
  private Integer numeroFactura;

  @Column(name = "tipo_factura_id")
  private Integer tipoFacturaId;

  @Column(name = "cliente_id")
  private Integer clienteId;

  @Column(name = "razon_social")
  private String razonSocial;

  @Column(name = "rnc")
  private String rnc;

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

  @OneToMany(mappedBy = "facturaId", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference
  private List<MfFacturaDetalle> detalles;
}
