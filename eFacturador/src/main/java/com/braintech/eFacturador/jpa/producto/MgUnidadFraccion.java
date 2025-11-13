package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.*;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "mg_unidades_fracciones", schema = "producto")
@Data
@EqualsAndHashCode(callSuper = false)
public class MgUnidadFraccion extends BaseEntity implements Serializable {

  private static final long serialVersionUID = 1L;

  @Basic(optional = false)
  @Column(name = "cantidad")
  private int cantidad;

  @JoinColumn(name = "unidad_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  private MgUnidad unidadId;

  @JoinColumn(name = "unidad_fraccion_id")
  @ManyToOne(optional = false)
  private MgUnidad unidadFraccionId;
}
