package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.SuperClass.BaseSucursal;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "in_cotizacion", schema = "inventario")
@EqualsAndHashCode(callSuper = false)
public class InCotizacion extends BaseSucursal implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  @Column(name = "id")
  private Integer id;

  @Column(name = "descripcion")
  private String descripcion;

  @Column(name = "prioridad")
  private String prioridad;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "cotizacionId", fetch = FetchType.EAGER)
  private List<InCotizacionDetalle> inCotizacionesDetallesCollection;
}
