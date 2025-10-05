package com.braintech.eFacturador.jpa.inventario;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InLotePK implements Serializable {

  private String lote;
  private Integer productoId;
}
