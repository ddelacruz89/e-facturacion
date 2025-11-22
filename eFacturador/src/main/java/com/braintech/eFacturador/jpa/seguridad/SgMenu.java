package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.*;
import java.io.Serializable;
import lombok.*;
import org.hibernate.annotations.Comment;

@Entity
@Table(name = "SgMenu", schema = "seguridad")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class SgMenu extends BaseEntity implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @ManyToOne
  @JoinColumn(name = "tipo_menu_id")
  private SgTipoMenu tipoMenuId;

  @ManyToOne
  @JoinColumn(name = "modulo_id")
  private SgModulo moduloId;

  @Column(name = "menu")
  @Comment("Nombre del menú")
  private String menu;

  @Column(name = "url")
  @Comment("URL de navegación del menú")
  private String url;

  @Column(name = "url_sql")
  @Comment("Consulta SQL asociada al menú")
  private String urlSql;

  @Column(name = "activo")
  @Comment("Indica si el menú está activo")
  private Boolean activo;

  @Column(name = "productoAssignable")
  @Comment("Indica si el menú puede ser asignado a productos, en el modulo de productos")
  private Boolean productoAsignable;

  @Column(name = "orden")
  @Comment("Orden de visualización del menú")
  private Integer orden;

  @Transient
  public String getModuloId() {
    return this.moduloId.getId();
  }
}
