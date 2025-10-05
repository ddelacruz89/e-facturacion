package com.braintech.eFacturador.jpa.inventario;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

@Data
@Entity
@Table(name = "in_orden_entrada_detalle_lote", schema = "inventario")
public class InOrdenEntradaDetalleLote implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @Basic(optional = false)
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  private Integer cantidad;

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @Column(name = "fecha_reg", columnDefinition = "TIMESTAMP", insertable = false)
  private Date fechaReg;

  @Column(name = "estado", insertable = false)
  private String estado;

  @JoinColumn(name = "orden_entrada_detalle_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  private InOrdenEntradaDetalle ordenEntradaDetalle;

  @JoinColumns({
    @JoinColumn(name = "producto_id", referencedColumnName = "producto_id"),
    @JoinColumn(name = "lote_id", referencedColumnName = "lote", nullable = false)
  })
  @ManyToOne(cascade = CascadeType.ALL, optional = false)
  private InLote inLotes;
}
