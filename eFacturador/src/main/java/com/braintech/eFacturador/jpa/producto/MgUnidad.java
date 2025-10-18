package com.braintech.eFacturador.jpa.producto;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "mg_unidades", schema = "producto")
@Data
@EqualsAndHashCode(callSuper = false)
public class MgUnidad implements Serializable {

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

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @Column(name = "estado_id", insertable = false)
  private String estadoId;

  @Column(name = "fecha_reg", insertable = false)
  @Temporal(TemporalType.TIMESTAMP)
  private Date fechaReg;
}
