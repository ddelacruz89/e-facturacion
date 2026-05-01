package com.braintech.eFacturador.jpa.inventario;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import lombok.Data;
import org.hibernate.annotations.Comment;

@Data
@Entity
@Table(name = "in_ajuste_inventario_detalle", schema = "inventario")
public class InAjusteInventarioDetalle implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "ajuste_id", nullable = false)
  @JsonIgnore
  private InAjusteInventario ajuste;

  @Column(name = "producto_id", nullable = false)
  private Integer productoId;

  @Column(name = "lote", length = 45)
  @Comment("Lote o serie involucrado; null = sin lote")
  private String lote;

  @Column(name = "cantidad_actual", nullable = false)
  @Comment("Snapshot del stock al momento de crear el ajuste")
  private Double cantidadActual;

  @Column(name = "cantidad_nueva", nullable = false)
  @Comment("Stock objetivo tras aplicar el ajuste")
  private Double cantidadNueva;

  @Column(name = "diferencia", nullable = false)
  @Comment("cantidadNueva - cantidadActual; positivo = entrada, negativo = salida")
  private Double diferencia;
}
