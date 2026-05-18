package com.braintech.eFacturador.jpa.facturacion;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Descuento aplicado a un renglón de factura suplidor. tipo = '$' → monto fijo; tipo = '%' →
 * porcentaje del monto del ítem.
 */
@Entity
@Table(name = "mf_factura_suplidor_detalle_descuento", schema = "facturacion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MfFacturaSuplidorDetalleDescuento implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "detalle_id", nullable = false)
  @JsonIgnoreProperties({"descuentos", "hibernateLazyInitializer", "handler"})
  private MfFacturaSuplidorDetalle detalle;

  /** '$' = monto fijo | '%' = porcentaje */
  @Column(name = "tipo", nullable = false, length = 1)
  private String tipo;

  /** Valor ingresado: si tipo='%' es el porcentaje; si tipo='$' es el monto directo. */
  @Column(name = "valor", precision = 16, scale = 4, nullable = false)
  private BigDecimal valor;

  /** Monto calculado en RD$ que se aplica al subtotal del renglón. */
  @Column(name = "monto", precision = 16, scale = 2, nullable = false)
  private BigDecimal monto;

  @Column(name = "empresa_id")
  private Integer empresaId;
}
