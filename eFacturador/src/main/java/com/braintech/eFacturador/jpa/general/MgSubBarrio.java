package com.braintech.eFacturador.jpa.general;

import jakarta.persistence.*;
import java.io.Serializable;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mg_sub_barrio", schema = "general")
@Data
@NoArgsConstructor
public class MgSubBarrio implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  /** Código ONE: prv+mun+dm+sec+brr+sub (13 chars) */
  @Column(name = "cod_one", length = 13, nullable = false, unique = true)
  private String codOne;

  @Column(name = "cod_sub", length = 2, nullable = false)
  private String codSub;

  @Column(name = "nombre", length = 150, nullable = false)
  private String nombre;

  @Column(name = "barrio_id", nullable = false)
  private Integer barrioId;
}
