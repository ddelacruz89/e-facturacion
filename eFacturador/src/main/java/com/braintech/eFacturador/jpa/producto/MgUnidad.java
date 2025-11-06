package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntityEmpresa;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "mg_unidades", schema = "producto")
@Data
@EqualsAndHashCode(callSuper = false)
public class MgUnidad extends BaseEntityEmpresa implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  @Column(name = "id")
  private Integer id;

  @Basic(optional = false)
  @Column(name = "nombre")
  private String nombre;

  @Basic(optional = false)
  @Column(name = "sigla")
  private String sigla;
}
