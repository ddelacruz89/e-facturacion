package com.braintech.eFacturador.dto.facturacion;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Payload para crear o actualizar una factura suplidor. */
@Data
@NoArgsConstructor
public class MfFacturaSuplidorRequestDTO {

  // ── Identificación ────────────────────────────────────────────────────────
  /** null → todas las sucursales (filtro de búsqueda) | value → sucursal específica al guardar. */
  private Integer sucursalId;

  private String numeroFactura;
  private Integer tipoIngreso;
  private LocalDate fechaEmision;
  private LocalDate fechaLimitePago;
  private LocalDate fechaVencimiento;
  private LocalDateTime fechaPago;
  private LocalDateTime facturaFechaManual;
  private String estadoId;

  // ── DgII ──────────────────────────────────────────────────────────────────
  private String ncf;
  private String tipoCfId;
  private String secuityCode;
  private String trackId;
  private String qrUrl;
  private String fechaFirma;
  private Boolean aprobada;
  private String razonSocial;
  private String rnc;

  // ── Suplidor ──────────────────────────────────────────────────────────────
  private Integer suplidorId;
  private Integer ordenEntradaId;

  // ── Montos ────────────────────────────────────────────────────────────────
  private Integer tipoPago;
  private String concepto;
  private BigDecimal subTotal;
  private BigDecimal itbis;
  private BigDecimal descuento;
  private BigDecimal total;
  private BigDecimal pago;
  private BigDecimal montoAnulado;
  private BigDecimal montoRetencionItbis;

  // ── Retenciones ───────────────────────────────────────────────────────────
  private Integer retencionIsrId;
  private BigDecimal montoRetencionIsr;
  private Integer retencionItbisId;
  private BigDecimal montoRetencionItbisPct;

  // ── Tipo factura ──────────────────────────────────────────────────────────
  private Integer tipoFacturaId;
  private Boolean esFacturadoElectronicamente;
  private Integer esCredito;

  // ── Contabilidad ──────────────────────────────────────────────────────────
  private Integer contableId;
  private Integer cxpId;

  // ── Mora ──────────────────────────────────────────────────────────────────
  private Boolean tieneMora;
  private Integer moraPorciento;
  private LocalDateTime fechaMora;

  // ── Detalles ──────────────────────────────────────────────────────────────
  private List<MfFacturaSuplidorDetalleRequestDTO> detalles;
}
