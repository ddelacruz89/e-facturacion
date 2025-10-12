package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.SuperClass.BaseSucursal;
import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Date;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Table(name = "in_lote", schema = "inventario")
public class InLote extends BaseSucursal implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id private String lote;

  @ManyToOne
  @Id
  @JoinColumn(name = "producto_id", referencedColumnName = "id")
  private MgProducto productoId;

  private Boolean serie;

  @Column(name = "fecha_vencimiento")
  @JsonFormat(pattern = "yyyy-MM-dd")
  @Temporal(TemporalType.TIMESTAMP)
  private Date fechaVencimiento;

  @Column(name = "fecha_alerta_vencimiento", columnDefinition = "TIMESTAMP")
  private LocalDate fechaAlertaVencimiento;

  @Column(name = "alertas_dias")
  private Integer alertasDias;
}
