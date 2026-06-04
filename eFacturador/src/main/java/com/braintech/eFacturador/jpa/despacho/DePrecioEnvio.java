package com.braintech.eFacturador.jpa.despacho;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "de_precio_envio", schema = "despacho")
public class DePrecioEnvio implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "empresa_id", nullable = false)
  private Integer empresaId;

  @Column(name = "barrio_id", nullable = false)
  private Integer barrioId;

  /** Null = precio aplica a todo el barrio. Not-null = precio específico para ese sub-barrio. */
  @Column(name = "sub_barrio_id")
  private Integer subBarrioId;

  @Column(name = "precio", precision = 10, scale = 2, nullable = false)
  private BigDecimal precio;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "usuario_reg", length = 100, nullable = false)
  private String usuarioReg;
}
