package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.SuperClass.BaseSucursal;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Comment;

/**
 * Registro atómico de cada movimiento de inventario (entradas, salidas, ajustes, transferencias,
 * ventas, devoluciones). Tabla de mayor volumen del sistema — los FK se guardan como Integer para
 * evitar joins innecesarios en lecturas masivas.
 */
@Data
@Entity
@EqualsAndHashCode(callSuper = false)
@Table(
    name = "in_movimientos",
    schema = "inventario",
    indexes = {
      @Index(name = "idx_mov_empresa_sucursal", columnList = "empresa_id, sucursal_id"),
      @Index(
          name = "idx_mov_almacen_producto_fecha",
          columnList = "almacen_id, producto_id, fecha_reg"),
      @Index(name = "idx_mov_fecha_reg", columnList = "fecha_reg"),
      @Index(name = "idx_mov_lote", columnList = "lote"),
      @Index(name = "idx_mov_numero_referencia", columnList = "numero_referencia")
    })
public class InMovimiento extends BaseSucursal implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  private Integer id;

  // ── Clasificación ────────────────────────────────────────────────────────────

  @Column(name = "tipo_movimiento_id", nullable = false)
  @Comment("FK a in_tipos_movimientos (entrada, salida, ajuste, etc.)")
  private Integer tipoMovimientoId;

  @Column(name = "numero_referencia")
  @Comment("ID del documento de origen (orden de entrada, factura, transferencia, etc.)")
  private Integer numeroReferencia;

  // ── Ubicación y producto ─────────────────────────────────────────────────────

  @Column(name = "almacen_id", nullable = false)
  @Comment("FK a in_almacenes")
  private Integer almacenId;

  @Column(name = "producto_id", nullable = false)
  @Comment("FK a mg_productos")
  private Integer productoId;

  @Column(name = "lote", length = 45)
  @Comment("Código de lote o serie involucrado en el movimiento")
  private String lote;

  // ── Cantidades ───────────────────────────────────────────────────────────────

  @Column(name = "cantidad", nullable = false)
  @Comment("Unidades movidas (positivo = entrada, negativo = salida)")
  private Double cantidad;

  @Column(name = "cantidad_inventario")
  @Comment("Stock del producto en el almacén DESPUÉS de aplicar este movimiento")
  private Integer cantidadInventario;

  // ── Costos ──────────────────────────────────────────────────────────────────

  @Column(name = "precio_unitario", precision = 16, scale = 4)
  @Comment("Costo unitario en el momento del movimiento (para costo promedio / FIFO)")
  private BigDecimal precioUnitario;

  @Column(name = "costo_total", precision = 16, scale = 4)
  @Comment("cantidad × precio_unitario; almacenado para evitar recalculo en reportes")
  private BigDecimal costoTotal;

  // ── Información adicional ────────────────────────────────────────────────────

  @Column(name = "observacion", length = 255)
  @Comment("Nota libre; requerida en ajustes manuales")
  private String observacion;
}
