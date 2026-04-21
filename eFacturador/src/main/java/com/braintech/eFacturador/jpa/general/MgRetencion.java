package com.braintech.eFacturador.jpa.general;

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
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  private int tipoRetencion;

  private String nombre;

  private BigDecimal valor;

  private Boolean activo;
}
