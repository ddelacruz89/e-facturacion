package com.braintech.eFacturador.jpa.general;

import jakarta.persistence.*;
import java.io.Serializable;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "mg_secuencias", schema = "general")
@Getter
@Setter
@IdClass(MgSecuenciasPk.class)
public class MgSecuencias implements Serializable {
  private static final long serialVersionUID = 1L;

  @Id
  @Column(name = "empresa_id")
  private Integer empresaId;

  @Id
  @Column(name = "aplicacion_id")
  private String aplicacionId;

  @Column(name = "numero")
  private Integer numero;
}
