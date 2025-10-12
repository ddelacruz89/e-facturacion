package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.SuperClass.BaseSucursal;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
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
public class SgUsuario extends BaseSucursal implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @Column(unique = true, name = "username", length = 20)
  private String username;

  @Column(name = "password", nullable = false)
  private String password;

  @Column(name = "cambio_password")
  private Boolean cambioPassword;

  @Column(name = "nombre", length = 200, nullable = false)
  private String nombre;

  @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<SgUsuarioSucursal> sucursalesAsignadas = new ArrayList<>();
}
