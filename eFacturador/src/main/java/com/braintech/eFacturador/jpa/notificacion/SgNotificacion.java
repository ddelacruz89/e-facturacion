package com.braintech.eFacturador.jpa.notificacion;

import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Notificación centralizada del sistema. Cubre cualquier módulo (inventario, compras, aprobaciones,
 * etc.) con un payload JSONB flexible por tipo.
 *
 * <p>Módulos: INVENTARIO | COMPRAS | APROBACIONES
 *
 * <p>Tipos: VENCIMIENTO | STOCK_BAJO | LIMITE_PRODUCTO | APROBACION_PENDIENTE | …
 *
 * <p>{@code referenciaKey} es una clave de negocio única por tipo usada para deduplicar:
 * VENCIMIENTO → "lote:productoId", STOCK_BAJO → "productoId:almacenId"
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "sg_notificacion",
    schema = "general",
    indexes = {
      @Index(
          name = "idx_notif_tenant_estado",
          columnList = "empresa_id, sucursal_id, estado_id, fecha_reg"),
      @Index(
          name = "idx_notif_dedup",
          columnList = "modulo, tipo, referencia_key, empresa_id, estado_id")
    })
public class SgNotificacion implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  // ── Tenant ────────────────────────────────────────────────────────────────

  @Column(name = "empresa_id", nullable = false)
  private Integer empresaId;

  @Column(name = "sucursal_id")
  private Integer sucursalId;

  // ── Clasificación ─────────────────────────────────────────────────────────

  @Column(name = "modulo", length = 30, nullable = false)
  private String modulo;

  @Column(name = "tipo", length = 50, nullable = false)
  private String tipo;

  // ── Contenido legible ─────────────────────────────────────────────────────

  @Column(name = "titulo", length = 200, nullable = false)
  private String titulo;

  @Column(name = "descripcion", columnDefinition = "TEXT")
  private String descripcion;

  // ── Referencia al objeto origen ───────────────────────────────────────────

  @Column(name = "referencia_id")
  private Integer referenciaId;

  @Column(name = "referencia_tipo", length = 50)
  private String referenciaTipo;

  /** Clave de negocio para deduplicar: evita crear la misma alerta dos veces. */
  @Column(name = "referencia_key", length = 200)
  private String referenciaKey;

  // ── Payload estructurado ──────────────────────────────────────────────────

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "payload", columnDefinition = "jsonb")
  private Map<String, Object> payload;

  // ── Segregación por permisos ──────────────────────────────────────────────

  /** URL del menú origen (sg_menu.url). NULL = visible para todos. */
  @Column(name = "menu_url_origen", length = 200)
  private String menuUrlOrigen;

  /** Si true, esta notificación aparece como modal bloqueante al iniciar sesión. */
  @Column(name = "para_login")
  private Boolean paraLogin = false;

  // ── Estado ────────────────────────────────────────────────────────────────

  @Column(name = "estado_id", length = 10, nullable = false)
  private String estadoId;

  // ── Auditoría ─────────────────────────────────────────────────────────────

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "usuario_reg", length = 45)
  private String usuarioReg;

  @Column(name = "fecha_cierre")
  private LocalDateTime fechaCierre;

  @Column(name = "usuario_cierre", length = 45)
  private String usuarioCierre;
}
