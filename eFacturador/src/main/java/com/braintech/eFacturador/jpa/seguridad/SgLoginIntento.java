package com.braintech.eFacturador.jpa.seguridad;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sg_login_intento", schema = "seguridad")
@Getter
@Setter
@NoArgsConstructor
public class SgLoginIntento {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "username", nullable = false, length = 20)
  private String username;

  @Column(name = "ip_origen", length = 45)
  private String ipOrigen;

  @Column(name = "fecha_intento", nullable = false)
  private LocalDateTime fechaIntento;

  @Column(name = "exitoso", nullable = false)
  private Boolean exitoso;

  @Column(name = "motivo_rechazo", length = 30)
  private String motivoRechazo;

  public SgLoginIntento(String username, String ipOrigen, boolean exitoso, String motivoRechazo) {
    this.username = username;
    this.ipOrigen = ipOrigen;
    this.fechaIntento = LocalDateTime.now();
    this.exitoso = exitoso;
    this.motivoRechazo = motivoRechazo;
  }
}
