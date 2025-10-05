package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sg_usuario", schema = "seguridad")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SgUsuario extends BaseEntity {
  @Id
  @Column(unique = true, name = "username", length = 20)
  private String username;

  @Column(name = "empresa_id")
  private Integer empresaId;

  @Column(name = "password", nullable = false)
  private String password;

  @Column(name = "cambio_password")
  private Boolean cambioPassword;

  @Column(name = "nombre", length = 200, nullable = false)
  private String nombre;
}
