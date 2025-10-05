package com.braintech.eFacturador.jpa.SuperClass;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class BaseDgII extends BaseEntity {
  @Column(nullable = false, name = "empresa_id")
  private Integer empresaId;

  @Column(name = "secuity_code")
  private String secuityCode;

  @Column(name = "track_id")
  private String trackId;

  @Column(name = "qr_url")
  private String qrUrl;

  @Column(name = "aprobada")
  private Boolean aprobada;

  @Column(name = "razon_social")
  private String razonSocial;

  @Column(name = "rnc")
  private String rnc;

  @Column(name = "tipo_cf_id")
  private String tipoComprobanteId;

  @Column(name = "ncf")
  private String ncf;
}
