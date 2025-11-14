package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
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
public class MgProductoTag extends BaseEntity implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @ManyToOne(optional = false)
  @JoinColumn(name = "producto_id", nullable = false)
  @JsonBackReference(value = "producto-tags")
  @Comment("Producto al que se le aplica la etiqueta")
  private MgProducto producto;

  @ManyToOne(optional = false)
  @JoinColumn(name = "tag_id", nullable = false)
  @JsonBackReference(value = "tag-productos")
  @Comment("Etiqueta aplicada al producto")
  private MgTag tag;
}
