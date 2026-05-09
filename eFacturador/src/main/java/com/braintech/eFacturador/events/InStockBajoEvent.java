package com.braintech.eFacturador.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Evento publicado cada vez que se registra un movimiento de inventario. El listener lo procesa de
 * forma asíncrona para verificar si el stock resultante está por debajo del límite configurado.
 */
@Getter
public class InStockBajoEvent extends ApplicationEvent {

  private final Integer productoId;
  private final Integer almacenId;
  private final Integer empresaId;
  private final Integer sucursalId;

  /** Stock DESPUÉS de aplicar el movimiento (ya calculado por el trigger). */
  private final Integer cantidadActual;

  public InStockBajoEvent(
      Object source,
      Integer productoId,
      Integer almacenId,
      Integer empresaId,
      Integer sucursalId,
      Integer cantidadActual) {
    super(source);
    this.productoId = productoId;
    this.almacenId = almacenId;
    this.empresaId = empresaId;
    this.sucursalId = sucursalId;
    this.cantidadActual = cantidadActual;
  }
}
