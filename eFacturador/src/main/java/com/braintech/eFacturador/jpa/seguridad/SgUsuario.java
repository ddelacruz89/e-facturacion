package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.SuperClass.BaseSucursal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sg_usuario", schema = "seguridad")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SgUsuario extends BaseSucursal implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @Column(unique = true, name = "username", length = 20)
  private String username;

  @Column(unique = true, name = "login_email", length = 100)
  private String loginEmail;

  @Column(name = "password", nullable = false)
  private String password;

  @Column(name = "cambio_password")
  private Boolean cambioPassword;

  @Column(name = "nombre", length = 200, nullable = false)
  private String nombre;

  @Column(name = "es_chofer")
  private Boolean esChofer = false;

  /**
   * Indica que esta cuenta pertenece al equipo de soporte del SaaS. Los usuarios soporte solo
   * existen en empresa_id = 1 y nunca aparecen en los listados ni selectores de los tenants. Los
   * grants de acceso a cada tenant se gestionan en la tabla sg_acceso_soporte (escrita por el
   * sistema de management).
   */
  @Column(name = "es_soporte")
  private Boolean esSoporte = false;

  @Column(name = "login_locked_until")
  private LocalDateTime loginLockedUntil;

  @Column(name = "login_escalated")
  private Boolean loginEscalated = false;

  @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<SgUsuarioSucursal> sucursalesAsignadas = new ArrayList<>();

  /**
   * Manager directo del usuario (relación self-referencial, opcional). Se ignoran
   * sucursalesAsignadas, password y manager del manager para evitar ciclos JSON y recursión
   * infinita.
   */
  @ManyToOne(fetch = FetchType.LAZY, optional = true)
  @JoinColumn(name = "manager_username", nullable = true)
  @JsonIgnoreProperties({"sucursalesAsignadas", "password", "manager"})
  private SgUsuario manager;
}
