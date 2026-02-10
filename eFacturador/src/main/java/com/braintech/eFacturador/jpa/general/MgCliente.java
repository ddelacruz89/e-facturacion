package com.braintech.eFacturador.jpa.general;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntityPk;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mg_cliente", schema = "general")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class MgCliente extends BaseEntityPk {

  private static final long serialVersionUID = 1L;

  @Column(name = "tipo_identificacion")
  private Integer tipoIdentificacion;

  @Column(name = "numero_identificacion")
  private String numeroIdentificacion;

  @Column(name = "tipo_comprobante_id")
  private String tipoComprobanteId;

  @Column(name = "razon_social")
  private String razonSocial;

  @Column(name = "telefono")
  private String telefono;

  @Column(name = "direccion")
  private String direccion;

  @Column(name = "email")
  private String email;

  @Column(name = "credito")
  private BigDecimal credito;

  @Column(name = "activo")
  private Boolean activo;

  @Column(name = "aplica_credito")
  private Boolean aplicaCredito;

  @Column(name = "porciento_descuento")
  private BigDecimal porcientoDescuento;
}
