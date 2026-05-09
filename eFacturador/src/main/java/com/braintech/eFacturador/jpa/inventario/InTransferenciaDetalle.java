package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import lombok.Data;

@Data
@Entity
@Table(name = "in_transferecias_detalles", schema = "inventario")
public class InTransferenciaDetalle implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  private Integer id;

  @JoinColumn(name = "transferencia_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  @JsonIgnoreProperties({"detalles"})
  private InTransferencia transferenciaId;

  @JoinColumn(name = "producto_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  @NotNull(message = "Producto no debe estar vacio")
  // Excluir colecciones lazy de MgProducto — no se necesitan en el contexto de transferencia
  @JsonIgnoreProperties({"productosModulos", "inventarios", "tags",
      "productosAlmacenesLimites", "unidadProductorSuplidor"})
  private MgProducto productoId;

  /** Cantidad realmente transferida al momento de guardar (puede ser menor que cantSolicitada). */
  @Column(name = "cant")
  @NotNull(message = "Cantidad no debe estar vacia")
  private Integer cant;

  /**
   * Cantidad que el usuario solicito transferir. Se registra para mostrar la diferencia cuando el
   * stock disponible al guardar era menor al solicitado.
   */
  @Column(name = "cant_solicitada")
  private Integer cantSolicitada;

  @Column(name = "lote")
  private String lote;

  @Column(name = "numero_referencia")
  private Integer numeroReferencia;

  @Column(name = "cantidad_unidad")
  private Integer cantidadUnidad;

  @Column(name = "unidad_descripcion",