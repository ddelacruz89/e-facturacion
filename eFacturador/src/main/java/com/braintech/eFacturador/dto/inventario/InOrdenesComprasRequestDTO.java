package com.braintech.eFacturador.dto.inventario;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class InOrdenesComprasRequestDTO {
  private BigDecimal subTotal;
  private BigDecimal itbis;
  private BigDecimal total;
  private BigDecimal descuento;

  // Acepta tanto {"id": 4} como simplemente 4
  @JsonProperty("suplidorId")
  private SuplidorIdWrapper suplidorId;

  private String estadoId;
  private Integer cotizacionId;
  private List<InOrdenesComprasDetalleRequestDTO> detalles;

  // Helper para obtener el ID del suplidor
  public Integer getSuplidorIdValue() {
    if (suplidorId == null) {
      return null;
    }
    // Si es un wrapper con id
    if (suplidorId.getId() != null) {
      return suplidorId.getId();
    }
    return null;
  }

  @Data
  public static class SuplidorIdWrapper {
    private Integer id;
    private String nombre; // Opcional, se ignora
  }
}
