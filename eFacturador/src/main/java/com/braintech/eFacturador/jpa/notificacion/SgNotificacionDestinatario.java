package com.braintech.eFacturador.jpa.notificacion;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Destinatario específico de una notificación. Si una notificación tiene al menos un registro aquí,
 * solo esos usuarios la ven. Si no tiene ninguno, aplica la regla de acceso_restringido del tipo.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "sg_notificacion_destinatario",
    schema = "general",
    uniqueConstraints = @UniqueConstraint(columnNames = {"notificacion_id", "username"}))
public class SgNotificacionDestinatario {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "notificacion_id", nullable = false)
  private SgNotificacion notificacion;

  @Column(name = "username", length = 45, nullable = false)
  private String username;

  public SgNotificacionDestinatario(SgNotificacion notificacion, String username) {
    this.notificacion = notificacion;
    this.username = username;
  }
}
