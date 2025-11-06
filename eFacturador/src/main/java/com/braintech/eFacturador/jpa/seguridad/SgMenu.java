package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.*;
import java.io.Serializable;
import lombok.*;

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
  private String menu;

  @Column(name = "url")
  private String url;

  @Column(name = "url_sql")
  private String urlSql;

  @Column(name = "activo")
  private Boolean activo;

  @Column(name = "orden")
  private Integer orden;

  @Transient
  public String getModuloId() {
    return this.moduloId.getId();
  }
}
