package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "mg_tipo_comprobante", schema = "facturacion")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MgTipoComprobante extends BaseEntity {
  @Id
  @Column(name = "id")
  private String id;

  private String tipoComprobante;
  private Boolean electronico;
}
