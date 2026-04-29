package com.braintech.eFacturador.views;

/**
 * Clases de vistas para controlar qué campos se serializan en cada endpoint con @JsonView.
 *
 * <p>Uso: - Anotar campos con @JsonView(Views.ConInventarios.class) para que solo aparezcan cuando
 * el endpoint tenga esa vista. - En el controller method: @JsonView(Views.ConInventarios.class)
 */
public class Views {

  /** Vista base — todos los campos sin restricción. */
  public static class Base {}

  /**
   * Vista que incluye la lista de inventarios dentro de MgProducto. Usar en endpoints donde se
   * necesite ver el stock por almacén del producto.
   */
  public static class ConInventarios extends Base {}
}
