package com.braintech.eFacturador.jpa.notificacion;

import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "sg_notificacion_visto",
    schema = "general",
    uniqueConstraints = @UniqueConstraint(columnNames = {"notificacion_id", "username"}))
public class SgNotificacionVisto implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "notificacion_id", nullable = false)
  private SgNotificacion notificacion;

  @Column(name = "username", length = 45, nullable = false)
  private String username;

  @Column(name = "fecha_visto", nullable = false)
  private LocalDateTime fechaVisto;

  public SgNotificacionVisto(SgNotificacion notificacion, String username) {
    this.notificacion = notificacion;
    this.username = username;
    this.fechaVisto = LocalDateTime.now();
  }
}
