package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.*;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sg_usuario_sucursal", schema = "seguridad")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SgUsuarioSucursal extends BaseEntity implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "username", referencedColumnName = "username")
  private SgUsuario usuario;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "sucursal_id")
  private SgSucursal sucursal;

  @Column(name = "activo")
  private Boolean activo = true;

  @Column(name = "es_principal")
  private Boolean esPrincipal = false;
}
