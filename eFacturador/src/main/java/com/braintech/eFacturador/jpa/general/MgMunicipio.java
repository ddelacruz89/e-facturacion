package com.braintech.eFacturador.jpa.general;

import jakarta.persistence.*;
import java.io.Serializable;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mg_municipio", schema = "general")
@Data
@NoArgsConstructor
public class MgMunicipio implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  /** Código ONE: prv(2)+mun(2)+dm(2), ej. "020102" */
  @Column(name = "cod_one", length = 6, nullable = false, unique = true)
  private String codOne;

  @Column(name = "nombre", length = 120, nullable = false)
  private String nombre;

  @Column(name = "cod_provincia", length = 2, nullable = false)
  private String codProvincia;

  /** null = municipio propio; apunta al municipio padre si es DM */
  @Column(name = "parent_id")
  private Integer parentId;

  @Column(name = "es_dm", nullable = false)
  private Boolean esDm = false;
}
