package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Date;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@Table(name = "in_lote", schema = "inventario")
public class InLote implements Serializable {

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

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @Column(name = "fecha_reg", insertable = false)
  @Temporal(TemporalType.TIMESTAMP)
  @JsonFormat(pattern = "dd/MM/yyyy")
  private Date fechaReg;

  private String estado;
}
