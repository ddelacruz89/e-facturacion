package com.braintech.eFacturador.jpa.general;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mg_barrio_paraje", schema = "general")
@Data
@NoArgsConstructor
public class MgBarrioParaje implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  /** Código ONE: prv+mun+dm+sec+brr (11 chars) */
  @Column(name = "cod_one", length = 11, nullable = false, unique = true)
  private String codOne;

  @Column(name = "nombre", length = 150, nullable = false)
  private String nombre;

  @Column(name = "seccion_id", nullable = false)
  private Integer seccionId;

  /** Precio de envío para este barrio/paraje. NULL = sin configurar. */
  @Column(name = "precio_envio", precision = 10, scale = 2)
  private BigDecimal precioEnvio;
}
