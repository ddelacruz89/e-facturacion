package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntityS;
import jakarta.persistence.*;
import java.io.Serializable;
import lombok.*;

@Entity
@Table(name = "mg_categoria", schema = "producto")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MgCategoria extends BaseEntityS implements Serializable {

  private static final long serialVersionUID = 1L;

  @Column(name = "categoria", nullable = false)
  private String categoria;

  @Column(name = "modificable", nullable = false)
  private Boolean modificable;

  @Column(name = "tieneModulo", nullable = false)
  private Boolean tieneModulo;

  @Column(name = "ingreso_venta_id")
  private Integer ingresoVentaId;
}
