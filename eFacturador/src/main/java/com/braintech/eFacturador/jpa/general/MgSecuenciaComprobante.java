package com.braintech.eFacturador.jpa.general;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntityPk;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mg_secuencia_comprobante", schema = "general")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class MgSecuenciaComprobante extends BaseEntityPk {
  private static final long serialVersionUID = 1L;

  @NotBlank
  @Column(name = "tipo_comprobante_id")
  String tipoComprobanteId;

  @Column(name = "secuencia_inicial")
  @NotBlank
  Integer secuenciaInicial;

  @Column(name = "secuencia_final")
  @NotBlank
  Integer secuenciaFinal;

  @Column(name = "fecha_valida")
  LocalDate fechaIValida;
}
