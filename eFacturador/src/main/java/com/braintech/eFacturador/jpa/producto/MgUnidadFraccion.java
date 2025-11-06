package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntityEmpresa;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Comment;

@Entity
@Table(name = "mg_unidades_fracciones", schema = "producto")
@Data
@EqualsAndHashCode(callSuper = false)
public class MgUnidadFraccion extends BaseEntityEmpresa implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  @Column(name = "id")
  private Integer id;

  @Basic(optional = false)
  @Column(name = "cantidad")
  private int cantidad;

  @JoinColumn(name = "unidad_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  private MgUnidad unidadId;

  @JoinColumn(name = "unidad_fraccion_id")
  @ManyToOne(optional = false)
  private MgUnidad unidadFraccionId;

  @JoinColumn(name = "producto_id")
  @ManyToOne(optional = false)
  @NotNull(message = "Producto no puede ser null")
  private MgProducto productoId;

  @OneToMany(mappedBy = "unidadFraccion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  @JsonManagedReference
  @Comment("Lista de suplidores que venden esta unidad de fracción del producto")
  private List<MgProductoSuplidor> suplidores;
}
