package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

@Entity
@Table(name = "mg_tag", schema = "producto")
@Data
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class MgTag extends BaseEntity implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Column(name = "nombre", nullable = false, length = 100)
  @Comment("Nombre de la etiqueta (ej: Promoción, Nuevo, Descuento)")
  private String nombre;

  @Column(name = "color", length = 7)
  @Comment("Color hexadecimal para mostrar la etiqueta (ej: #FF5733)")
  private String color;

  @Column(name = "descripcion", length = 255)
  @Comment("Descripción opcional de la etiqueta")
  private String descripcion;

  @OneToMany(mappedBy = "tag", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  @JsonManagedReference
  @Comment("Lista de productos asociados a esta etiqueta")
  private List<MgProductoTag> productos;
}
