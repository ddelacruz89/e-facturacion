package com.braintech.eFacturador.dto.inventario;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InOrdenesComprasResponseDTO {
  private Integer id;
  private BigDecimal subTotal;
  private BigDecimal itbis;
  private BigDecimal total;
  private BigDecimal descuento;
  private String usuarioReg;
  private LocalDateTime fechaReg;
  private Integer suplidorId;
  private String suplidorNombre;
  private String suplidorRnc;
  private String estadoId;
  private Integer cotizacionId;
  private List<InOrdenesComprasDetalleResponseDTO> detalles;
}
