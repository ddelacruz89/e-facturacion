package com.braintech.eFacturador.security;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Verifica que el usuario autenticado tenga el permiso indicado antes de ejecutar el método.
 *
 * <p>El valor de {@code menuUrl} debe coincidir exactamente con el campo {@code url} del registro
 * correspondiente en la tabla {@code seguridad.sg_menu}.
 *
 * <p>Ejemplo de uso:
 *
 * <pre>{@code
 * @RequierePermiso(menuUrl = "/productos", accion = Accion.ESCRIBIR)
 * @PostMapping
 * public ResponseEntity<MgProducto> create(@RequestBody MgProducto producto) { ... }
 * }</pre>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequierePermiso {

  /** URL del menú en {@code sg_menu.url} — p. ej. {@code "/productos"}. */
  String menuUrl();

  /** Acción que se requiere para ejecutar el método. */
  Accion accion();
}
