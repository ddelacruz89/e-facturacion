package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.inventario.InSuplidor;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "mg_producto_suplidor")
@Getter
@Setter
public class MgProductoSuplidor implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  private Integer id;

  @NotNull(message = "Preico no puede ser nulo")
  private BigDecimal precio;

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @NotNull(message = "Debe elegir un itbis")
  @Column(name = "itbis_default")
  private Boolean itbisDefault;

  @Column(name = "fecha_reg", insertable = false)
  @Temporal(TemporalType.TIMESTAMP)
  private Date fechaReg;

  @JoinColumn(name = "suplidor_id")
  @ManyToOne(optional = false)
  @NotNull(message = "Suplidor no puede ser null")
  private InSuplidor suplidor;

  @JoinColumn(name = "producto_id")
  @ManyToOne(optional = false)
  @NotNull(message = "Producto no puede ser null")
  private MgProducto producto;

  private String estadoId;
}
