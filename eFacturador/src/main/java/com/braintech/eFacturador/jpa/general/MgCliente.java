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

  /** Dirección fiscal (texto libre) */
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

  // ── Ubicación de entrega (nuevo schema) ───────────────────────────────────

  @Column(name = "cod_provincia", length = 2)
  private String codProvincia;

  /** FK → mg_municipio.id */
  @Column(name = "municipio_id")
  private Integer municipioId;

  /** FK → mg_barrio_paraje.id */
  @Column(name = "barrio_id")
  private Integer barrioId;

  /** FK → mg_sub_barrio.id (opcional) */
  @Column(name = "sub_barrio_id")
  private Integer subBarrioId;

  /** Calle y número */
  @Column(name = "calle")
  private String calle;

  /** Referencia / indicaciones al conductor */
  @Column(name = "referencia")
  private String referencia;
}
