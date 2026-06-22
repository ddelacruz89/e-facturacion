package com.braintech.eFacturador.jpa.notificacion;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "sg_usuario_notif_suscripcion",
    schema = "seguridad",
    uniqueConstraints = @UniqueConstraint(columnNames = {"empresa_id", "username", "tipo_id"}))
public class SgUsuarioNotifSuscripcion {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "empresa_id", nullable = false)
  private Integer empresaId;

  @Column(name = "username", length = 45, nullable = false)
  private String username;

  @Column(name = "tipo_id", length = 50, nullable = false)
  private String tipoId;

  @Column(name = "fecha_reg")
  private LocalDateTime fechaReg;
}
