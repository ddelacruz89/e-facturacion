package com.braintech.eFacturador.jpa.producto;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "mg_unidades_fracciones")
public class MgUnidadFraccion {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  @Column(name = "id")
  private Integer id;

  @Basic(optional = false)
  @Column(name = "cantidad")
  private int cantidad;

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @Column(name = "fecha_reg", insertable = false)
  @Temporal(TemporalType.TIMESTAMP)
  private Date fechaReg;

  @Column(name = "estado_id", insertable = false)
  private String estadoId;

  //  @JoinColumn(name = "unidad_id", referencedColumnName = "id")
  //  @ManyToOne(optional = false)
  //  private MgUnidad unidadId;
  //
  //  @JoinColumn(name = "unidad_fraccion_id")
  //  @ManyToOne(optional = false)
  //  private MgUnidad unidadFraccionId;
}
