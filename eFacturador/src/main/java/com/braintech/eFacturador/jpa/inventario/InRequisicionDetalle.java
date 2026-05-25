package com.braintech.eFacturador.jpa.inventario;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "in_requisicion_detalle", schema = "inventario")
@EqualsAndHashCode(callSuper = false)
public class InRequisicionDetalle implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  private Integer id;

  @JoinColumn(name = "requisicion_id")
  @ManyToOne(optional = false)
  @JsonIgnoreProperties({"detalles"})
  private InRequisicion requisicionId;

  @Column(name = "producto_id")
  @NotNull(message = "Producto no debe estar vacío")
  private Integer productoId;

  @Column(name = "cantidad_solicitada")
  @NotNull(message = "Cantidad solicitada no debe estar vacía")
  private BigDecimal cantidadSolicitada;

  @Column(name = "cantidad_aprobada")
  private BigDecimal cantidadAprobada;

  private String observaciones;
}
