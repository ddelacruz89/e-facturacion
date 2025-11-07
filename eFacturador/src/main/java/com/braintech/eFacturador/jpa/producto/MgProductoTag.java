package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntityEmpresa;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

@Entity
@Table(
    name = "mg_producto_tag",
    schema = "producto",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"producto_id", "tag_id", "empresa_id"})})
@Data
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class MgProductoTag extends BaseEntityEmpresa implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "producto_id", nullable = false)
  @JsonBackReference
  @Comment("Producto al que se le aplica la etiqueta")
  private MgProducto producto;

  @ManyToOne(optional = false)
  @JoinColumn(name = "tag_id", nullable = false)
  @JsonBackReference
  @Comment("Etiqueta aplicada al producto")
  private MgTag tag;
}
