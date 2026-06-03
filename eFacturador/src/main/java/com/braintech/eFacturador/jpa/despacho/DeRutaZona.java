package com.braintech.eFacturador.jpa.despacho;

import jakarta.persistence.*;
import java.io.Serializable;
import lombok.Data;

@Data
@Entity
@Table(name = "de_ruta_zona", schema = "despacho")
public class DeRutaZona implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "ruta_id", nullable = false)
  private Integer rutaId;

  @Column(name = "cod_provincia", nullable = false, length = 2)
  private String codProvincia;

  @Column(name = "municipio_id", nullable = false)
  private Integer municipioId;

  @Column(name = "barrio_id")
  private Integer barrioId;
}
