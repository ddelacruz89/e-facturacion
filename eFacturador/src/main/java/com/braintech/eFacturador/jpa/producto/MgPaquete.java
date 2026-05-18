package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import com.braintech.eFacturador.jpa.general.MgItbis;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Un paquete es un conjunto de productos y/o servicios que se venden juntos a un precio único. Al
 * vender un paquete, el sistema genera el movimiento de inventario de cada ítem incluido.
 */
@Entity
@Table(
    name = "mg_paquete",
    schema = "producto",
    uniqueConstraints = {
      @UniqueConstraint(columnNames = {"empresa_id", "secuencia"}),
      @UniqueConstraint(columnNames = {"empresa_id", "nombre"})
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MgPaquete extends BaseEntity implements Serializable {

  public MgPaquete(Integer id) {
    this.id = id;
  }

  @Serial private static final long serialVersionUID = 1L;

  @NotNull
  @Column(name = "nombre", nullable = false)
  private String nombre;

  @Column(name = "descripcion")
  private String descripcion;

  @Column(name = "codigo_barra")
  private String codigoBarra;

  /** Precio de venta del paquete completo. */
  @NotNull
  @Column(name = "precio_venta", nullable = false)
  private BigDecimal precioVenta;

  @Column(name = "precio_minimo")
  private BigDecimal precioMinimo;

  /** ITBIS aplicable al paquete en su conjunto. */
  @JoinColumn(name = "itbis_id")
  @ManyToOne(optional = false)
  private MgItbis itbisId;

  @Column(name = "notas")
  private String notas;

  /** Ítems que componen el paquete (productos y/o servicios). */
  @OneToMany(
      cascade = CascadeType.ALL,
      mappedBy = "paqueteId",
      fetch = FetchType.EAGER,
      orphanRemoval = true)
  @JsonManagedReference
  private List<MgPaqueteItem> items;
}
