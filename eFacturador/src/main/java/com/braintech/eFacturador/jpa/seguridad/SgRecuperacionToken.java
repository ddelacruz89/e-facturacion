package com.braintech.eFacturador.jpa.seguridad;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sg_recuperacion_token", schema = "seguridad")
@Getter
@Setter
@NoArgsConstructor
public class SgRecuperacionToken {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "login_email", nullable = false, length = 100)
  private String loginEmail;

  @Column(name = "codigo", nullable = false, length = 6)
  private String codigo;

  @Column(name = "expiracion", nullable = false)
  private LocalDateTime expiracion;

  @Column(name = "usado", nullable = false)
  private Boolean usado = false;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  public SgRecuperacionToken(String loginEmail, String codigo, LocalDateTime expiracion) {
    this.loginEmail = loginEmail;
    this.codigo = codigo;
    this.expiracion = expiracion;
    this.usado = false;
    this.fechaReg = LocalDateTime.now();
  }
}
