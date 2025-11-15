package com.braintech.eFacturador.jpa.general;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mg_itbis", schema = "general")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class MgItbis implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @Basic(optional = false)
  @Column(name = "id")
  private Integer id;

  private String nombre;

  private BigDecimal itbis;

  private Boolean activo;
}
