package com.braintech.eFacturador.jpa.general;

import jakarta.persistence.*;
import java.io.Serializable;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mg_seccion", schema = "general")
@Data
@NoArgsConstructor
public class MgSeccion implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  /** Código ONE: prv+mun+dm+sec (8 chars) */
  @Column(name = "cod_one", length = 8, nullable = false, unique = true)
  private String codOne;

  @Column(name = "nombre", length = 150, nullable = false)
  private String nombre;

  @Column(name = "municipio_id", nullable = false)
  private Integer municipioId;

  /** U = zona urbana, R = sección rural */
  @Column(name = "tipo", length = 1, nullable = false)
  private String tipo;
}
