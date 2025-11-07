package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "mg_tipo_factura", schema = "facturacion")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MgTipoFactura extends BaseEntity {
  private String nombre;
}
