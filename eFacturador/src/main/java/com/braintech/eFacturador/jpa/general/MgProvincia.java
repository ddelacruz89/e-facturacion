package com.braintech.eFacturador.jpa.general;

import jakarta.persistence.*;
import java.io.Serializable;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mg_provincia", schema = "general")
@Data
@NoArgsConstructor
public class MgProvincia implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @Column(name = "cod_provincia", length = 2)
  private String codProvincia;

  @Column(name = "nombre", length = 80, nullable = false)
  private String nombre;

  @Column(name = "cod_region", length = 2)
  private String codRegion;
}
