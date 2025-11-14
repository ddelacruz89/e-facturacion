package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import com.braintech.eFacturador.jpa.general.MgItbis;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Table(name = "mg_producto", schema = "producto")
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MgProducto extends BaseEntity implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Column(name = "codigoBarra")
  private String codigoBarra;

  @NotNull
  @Column(name = "nombre_producto")
  private String nombreProducto;

  @Column(name = "descripcion")
  private String descripcion;

  @Column(name = "trabajador")
  private Boolean trabajador;

  @Column(name = "comision")
  private BigDecimal comision;

  @JoinColumn(name = "itbis_id")
  @ManyToOne(optional = false)
  private MgItbis itbisId;

  @JoinColumn(name = "categoria_id")
  @ManyToOne(optional = false)
  private MgCategoria categoriaId;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "productoId", fetch = FetchType.EAGER)
  private List<MgProductoUnidadSuplidor> unidadProductorSuplidor;

  @OneToMany(cascade = CascadeType.ALL)
  @JoinColumn(name = "producto_id", referencedColumnName = "id")
  private List<MgProductoModulo> productosModulos;

  @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  @JsonManagedReference(value = "producto-tags")
  @Comment("Lista de etiquetas/tags asociadas al producto")
  private List<MgProductoTag> tags;
}
