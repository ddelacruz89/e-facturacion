package com.braintech.eFacturador.jpa.general;

import com.braintech.eFacturador.enums.ITipoRetencion;
import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mg_retencion", schema = "general")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class MgRetencion implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @Basic(optional = false)
  @Column(name = "id")
  private Integer id;

  private ITipoRetencion tipoRetencion;

  private String nombre;

  private BigDecimal valor;

  private Boolean activo;
}
