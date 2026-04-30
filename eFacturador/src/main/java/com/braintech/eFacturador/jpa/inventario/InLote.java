package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@Table(name = "in_lote", schema = "inventario")
@IdClass(InLotePK.class)
public class InLote implements Serializable {

  private static final long serialVersionUID = 1L;

  // ── Clave primaria compuesta ──────────────────────────────────────────────

  @Id
  @Column(name = "lote")
  private String lote;

  @Id
  @ManyToOne
  @JoinColumn(name = "producto_id", referencedColumnName = "id")
  private MgProducto productoId;

  /** Parte del PK — aísla datos por tenant. */
  @Id
  @Column(name = "empresa_id")
  private Integer empresaId;

  // ── Campos de auditoría / tenant (ex-BaseSucursal) ────────────────────────

  @ManyToOne
  @JoinColumn(name = "sucursal_id")
  private SgSucursal sucursalId;

  @Column(name = "usuario_reg", nullable = false)
  private String usuarioReg;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "estado_id")
  private String estadoId;

  // ── Campos propios del lote ───────────────────────────────────────────────

  @Column(name = "serie")
  private Boolean serie;

  @Column(name = "fecha_vencimiento")
  @JsonFormat(pattern = "yyyy-MM-dd")
  @Temporal(TemporalType.TIMESTAMP)
  private Date fechaVencimiento;

  @Column(name = "fecha_alerta_vencimiento", columnDefinition = "TIMESTAMP")
  private LocalDate fechaAlertaVencimiento;

  @Column(name = "alertas_dias")
  private Integer alertasDias;
}
