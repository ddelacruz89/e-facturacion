package com.braintech.eFacturador.jpa.inventario;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Catálogo global de tipos de movimiento de inventario. No filtra por tenant. */
@Data
@Entity
@NoArgsConstructor
@Table(name = "in_movimientos_tipos", schema = "inventario")
public class InMovimientoTipo implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @Column(name = "tipo_movimiento", length = 45)
  private String tipoMovimiento;

  /**
   * Indica el efecto sobre el stock: {@code 1} = crédito (entrada, aumenta stock), {@code 0} =
   * débito (salida, disminuye stock).
   */
  @Column(name = "cr")
  private Boolean cr;

  @Column(name = "modulo", length = 50)
  private String modulo;

  @Column(name = "modificable")
  private Boolean modificable;

  @Column(name = "usuario_reg", length = 45)
  private String usuarioReg;

  @Column(name = "fecha_reg")
  private LocalDateTime fechaReg;
}
