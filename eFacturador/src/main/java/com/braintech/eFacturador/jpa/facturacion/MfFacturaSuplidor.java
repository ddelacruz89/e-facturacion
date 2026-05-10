package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.SuperClass.BaseDgII;
import com.braintech.eFacturador.jpa.contabilidad.McCatalogoCuenta;
import com.braintech.eFacturador.jpa.general.MgRetencionItbis;
import com.braintech.eFacturador.jpa.inventario.InSuplidor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "mf_factura_suplidor", schema = "facturacion")
@Getter
@Setter
@EqualsAndHashCode(callSuper = false)
public class MfFacturaSuplidor extends BaseDgII implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  // ── Identificación de la factura ──────────────────────────────────────────

  @Column(name = "numero_factura")
  private String numeroFactura;

  @Column(name = "tipo_ingreso")
  private Integer tipoIngreso;

  @Column(name = "fecha_emision")
  private LocalDate fechaEmision;

  @Column(name = "fecha_limite_pago")
  private LocalDate fechaLimitePago;

  @Column(name = "fecha_vencimiento")
  private LocalDate fechaVencimiento;

  @Column(name = "fecha_pago")
  private LocalDateTime fechaPago;

  @Column(name = "factura_fecha_manual")
  private LocalDateTime facturaFechaManual;

  @Column(name = "fecha_creacion")
  private LocalDateTime fechaCreacion;

  @Column(name = "estado_id")
  private String estadoId;

  // ── Suplidor ──────────────────────────────────────────────────────────────

  @Column(name = "orden_entrada_id")
  private Integer ordenEntradaId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "suplidor_id")
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private InSuplidor suplidor;

  // ── Montos ────────────────────────────────────────────────────────────────

  @Column(name = "tipo_pago")
  private Integer tipoPago;

  @Column(name = "concepto")
  private String concepto;

  @Column(name = "subtotal")
  private BigDecimal subtotal;

  @Column(name = "itbis")
  private BigDecimal itbis;

  @Column(name = "descuento")
  private BigDecimal descuento;

  @Column(name = "total")
  private BigDecimal total;

  @Column(name = "pago")
  private BigDecimal pago;

  @Column(name = "monto_anulado")
  private BigDecimal montoAnulado;

  @Column(name = "monto_retencion_itbis")
  private BigDecimal montoRetencionItbis;

  // ── Retenciones ───────────────────────────────────────────────────────────

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "retencion_isr_id")
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private MgRetencionItbis retencionIsr;

  @Column(name = "retencion_isr")
  private BigDecimal montoRetencionIsr;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "retenciones_itbis_id")
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private MgRetencionItbis retencionItbis;

  @Column(name = "retencion_itbis")
  private BigDecimal montoRetencionItbisPct;

  // ── Tipo de factura ───────────────────────────────────────────────────────

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tipo_factura_id")
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private MgTipoFactura tipoFactura;

  @Column(name = "es_facturado_electronicamente")
  private Boolean esFacturadoElectronicamente;

  @Column(name = "es_credito")
  private Boolean esCredito;

  // ── Contabilidad ──────────────────────────────────────────────────────────

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "contable_id")
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private McCatalogoCuenta contable;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "cxp_id")
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private McCatalogoCuenta cxp;

  // ── Mora ──────────────────────────────────────────────────────────────────

  @Column(name = "tiene_mora")
  private Boolean tieneMora;

  @Column(name = "mora_porciento")
  private Integer moraPorciento;

  @Column(name = "fecha_mora")
  private LocalDateTime fechaMora;

  // ── Anulación ─────────────────────────────────────────────────────────────

  @Column(name = "fecha_anulado")
  private LocalDateTime fechaAnulado;

  @Column(name = "usuario_anulacion")
  private String usuarioAnulacion;

  // ── Detalles ──────────────────────────────────────────────────────────────

  @OneToMany(
      mappedBy = "facturaSuplidor",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  @OrderBy("id ASC")
  @JsonIgnoreProperties("facturaSuplidor")
  private List<MfFacturaSuplidorDetalle> detalles = new ArrayList<>();

  public MfFacturaSuplidor() {
    super();
  }

  public MfFacturaSuplidor(int i) {
    super(i);
  }
}
