package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.contabilidad.McCatalogoCuenta;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "mf_factura_suplidor_forma_pagos", schema = "facturacion")
@Getter
@Setter
@NoArgsConstructor
public class MfFacturaSuplidorFormaPago implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @Column(name = "forma_pago")
  private String formaPago;

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @Column(name = "fecha_reg")
  private LocalDateTime fechaReg;

  @Column(name = "estado_id")
  private String estadoId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "catalogos_cuentas_id")
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private McCatalogoCuenta catalogosCuentas;

  @Column(name = "tipo_forma_pago")
  private String tipoFormaPago;
}
