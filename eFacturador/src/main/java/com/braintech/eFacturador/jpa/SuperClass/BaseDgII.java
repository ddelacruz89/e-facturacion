package com.braintech.eFacturador.jpa.SuperClass;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class BaseDgII extends BaseEntitySucursal implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Column(name = "secuity_code")
  private String secuityCode;

  @Column(name = "fecha_firma")
  private String fechaFirma;

  @Column(name = "fecha_vencimiento")
  private LocalDate fechaVencimiento;

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

  @JsonProperty("tipoCfId")
  @Column(name = "tipo_cf_id")
  private String tipoComprobanteId;

  @Column(name = "ncf")
  private String ncf;

  public BaseDgII(int i) {
    super(i);
  }

  public BaseDgII() {
    super();
  }

  public String getFechaVencimiento() {
    DateTimeFormatter formatDate = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    if (fechaVencimiento != null) {

      return fechaVencimiento.format(formatDate);
    } else return null;
  }
}
