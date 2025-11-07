package com.braintech.eFacturador.jpa.facturacion;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "mg_tipo_comprobante", schema = "facturacion")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MgTipoComprobante implements Serializable {
  @Id private String id;
  private String tipoComprobante;
  private Boolean electronico;

  @Column(name = "usuario_reg", nullable = false)
  private String usuarioReg;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "activo")
  private Boolean activo;
}
