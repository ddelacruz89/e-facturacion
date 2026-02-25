package com.braintech.eFacturador.jpa.inventario;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * @author Aner Santana
 */
@Entity
@Table(name = "in_ordenes_compras", schema = "inventario")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Getter
@Setter
public class InOrdenesCompras implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  private Integer id;

  @Column(name = "subtotal")
  private BigDecimal subTotal;

  private BigDecimal itbis;
  private BigDecimal total;
  private BigDecimal descuento;

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @JsonFormat(pattern = "dd/MM/yyyy hh:mm a")
  @Column(name = "fecha_reg", columnDefinition = "TIMESTAMP", updatable = false)
  private LocalDateTime fechaReg;

  @JoinColumn(name = "suplidor_id")
  @ManyToOne(optional = false)
  private InSuplidor suplidorId;

  @Column(name = "estado_id")
  private String estadoId;

  @Column(name = "cotizacion_id")
  private Integer cotizacionId;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "ordenCompraId", fetch = FetchType.EAGER)
  private List<InOrdenesComprasDetalles> detalles;

  public InOrdenesCompras() {}

  public InOrdenesCompras(Integer id) {
    this.id = id;
  }

  @Override
  public int hashCode() {
    int hash = 0;
    hash += (id != null ? id.hashCode() : 0);
    return hash;
  }

  @Override
  public boolean equals(Object object) {
    // TODO: Warning - this method won't work in the case the id fields are not set
    if (!(object instanceof InOrdenesCompras)) {
      return false;
    }
    InOrdenesCompras other = (InOrdenesCompras) object;
    if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
      return false;
    }
    return true;
  }
}
