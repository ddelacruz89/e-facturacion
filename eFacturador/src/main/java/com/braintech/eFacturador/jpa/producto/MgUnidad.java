package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mg_unidades", schema = "producto")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class MgUnidad extends BaseEntity implements Serializable {
  private static final long serialVersionUID = 1L;

  public MgUnidad(Integer id) {
    this.id = id;
  }

  @Basic(optional = false)
  @Column(name = "nombre")
  private String nombre;

  @Basic(optional = false)
  @Column(name = "sigla")
  private String sigla;
}
