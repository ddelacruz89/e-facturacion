package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Permiso de un rol sobre un menú específico.
 *
 * <p>Cada registro representa el acceso que un rol tiene sobre un ítem de menú. Si no existe
 * registro, el rol no tiene ningún acceso a ese menú.
 */
@Entity
@Table(
    name = "sg_permiso",
    schema = "seguridad",
    uniqueConstraints = @UniqueConstraint(columnNames = {"empresa_id", "rol_id", "menu_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SgPermiso extends BaseEntity implements Serializable {

  private static final long serialVersionUID = 1L;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "rol_id", nullable = false)
  @JsonBackReference("rol-permisos")
  private SgRol rol;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  @JoinColumn(name = "menu_id", nullable = false)
  private SgMenu menu;

  @Column(name = "puede_leer", nullable = false)
  private Boolean puedeLeer = false;

  @Column(name = "puede_escribir", nullable = false)
  private Boolean puedeEscribir = false;

  @Column(name = "puede_eliminar", nullable = false)
  private Boolean puedeEliminar = false;

  @Column(name = "puede_imprimir", nullable = false)
  private Boolean puedeImprimir = false;
}
