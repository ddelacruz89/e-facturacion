package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.SuperClass.BaseSucursal;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Comment;

/**
 * Registro de alertas de inventario generadas automáticamente por el sistema.
 *
 * <p>Tipos:
 *
 * <ul>
 *   <li>{@code STOCK_BAJO} – stock actual cayó por debajo del límite configurado en {@code
 *       mg_producto_almacen_limite}.
 *   <li>{@code VENCIMIENTO} – lote próximo a vencer o ya vencido según {@code
 *       in_lote.fecha_alerta_vencimiento} / {@code alertas_dias}.
 * </ul>
 *
 * <p>Estado heredado de BaseSucursal: {@code ACT} = activa, {@code CER} = cerrada.
 */
@Data
@Entity
@EqualsAndHashCode(callSuper = false)
@Table(
    name = "in_alerta_inventario",
    schema = "inventario",
    indexes = {
      @Index(name = "idx_alerta_empresa_tipo_estado", columnList = "empresa_id, tipo, estado_id"),
      @Index(
          name = "idx_alerta_producto_almacen",
          columnList = "producto_id, almacen_id, empresa_id, sucursal_id")
    })
public class InAlertaInventario extends BaseSucursal implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  // ── Clasificación ─────────────────────────────────────────────────────────

  @Column(name = "tipo", length = 15, nullable = false)
  @Comment("STOCK_BAJO | VENCIMIENTO")
  private String tipo;

  // ── Contexto del producto/lote ────────────────────────────────────────────

  @Column(name = "producto_id", nullable = false)
  private Integer productoId;

  @Column(name = "almacen_id")
  @Comment("Almacén afectado; null para alertas de vencimiento sin almacén específico")
  private Integer almacenId;

  @Column(name = "lote", length = 45)
  @Comment("Lote afectado; null para alertas de STOCK_BAJO sin lote")
  private String lote;

  // ── Datos de STOCK_BAJO ───────────────────────────────────────────────────

  @Column(name = "cantidad_actual")
  @Comment("Stock en el momento de generar la alerta (solo STOCK_BAJO)")
  private Integer cantidadActual;

  @Column(name = "limite")
  @Comment("Límite mínimo configurado en el momento de la alerta (solo STOCK_BAJO)")
  private Integer limite;

  // ── Datos de VENCIMIENTO ──────────────────────────────────────────────────

  @Column(name = "fecha_vencimiento")
  @Comment("Fecha de vencimiento del lote (solo VENCIMIENTO)")
  private LocalDate fechaVencimiento;

  // ── Cierre ────────────────────────────────────────────────────────────────

  @Column(name = "fecha_cierre")
  @Comment("Fecha en que el operador o el sistema cerró la alerta")
  private LocalDateTime fechaCierre;

  @Column(name = "usuario_cierre", length = 45)
  private String usuarioCierre;
}
