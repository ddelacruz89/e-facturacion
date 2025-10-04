package com.braintech.eFacturador.jpa.inventario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InLotePK implements Serializable {

    private String lote;
    private Integer productoId;
}

