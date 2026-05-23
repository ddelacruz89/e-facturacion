package com.braintech.eFacturador.jpa.inventario;

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
    name = "in_alerta_visto",
    schema = "inventario",
    uniqueConstraints = @UniqueConstraint(columnNames = {"alerta_id", "username"}))
public class InAlertaVisto implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "alerta_id", nullable = false)
  private InAlertaInventario alerta;

  @Column(name = "username", length = 45, nullable = false)
  private String username;

  @Column(name = "fecha_visto", nullable = false)
  private LocalDateTime fechaVisto;

  public InAlertaVisto(InAlertaInventario alerta, String username) {
    this.alerta = alerta;
    this.username = username;
    this.fechaVisto = LocalDateTime.now();
  }
}
