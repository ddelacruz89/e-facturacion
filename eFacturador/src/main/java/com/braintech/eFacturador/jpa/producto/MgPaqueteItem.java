package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Representa un ítem dentro de un paquete.
 *
 * <p>Cada ítem referencia un {@link MgProducto} y la unidad concreta ({@link
 * MgProductoUnidadSuplidor}) que se usará al generar el movimiento de inventario cuando el paquete
 * sea vendido.
 */
@Entity
@Table(name = "mg_paquete_item", schema = "producto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MgPaqueteItem extends BaseEntity implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  /** Paquete al que pertenece este ítem. */
  @ManyToOne(optional = false)
  @JoinColumn(name = "paquete_id", nullable = false)
  @JsonBackReference
  private MgPaquete paqueteId;

  /**
   * Producto o servicio incluido. Si la categoría del producto tiene {@code inventario = true}, se
   * genera movimiento de inventario al vender el paquete.
   */
  @ManyToOne(optional = false)
  @JoinColumn(name = "producto_id", nullable = false)
  private MgProducto productoId;

  /**
   * Unidad/fracción específica del producto que aplica para este ítem. Determina la unidad de
   * medida y el precio de referencia.
   */
  @ManyToOne(optional = false)
  @JoinColumn(name = "unidad_producto_suplidor_id", nullable = false)
  private MgProductoUnidadSuplidor unidadProductorSuplidorId;

  /**
   * Cantidad de la unidad seleccionada que forma parte del paquete. Para servicios siempre debe ser
   * 1.
   */
  @NotNull
  @Column(name = "cantidad", nullable = false, precision = 16, scale = 4)
  private BigDecimal cantidad;

  /** Precio de referencia capturado al momento de armar el paquete (opcional, informativo). */
  @Column(name = "precio_ref", precision = 16, scale = 2)
  private BigDecimal precioRef;

  @Column(name = "notas")
  private String notas;
}
