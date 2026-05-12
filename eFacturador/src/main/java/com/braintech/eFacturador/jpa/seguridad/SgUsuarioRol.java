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
 * Asignación de un rol a un usuario en una sucursal específica.
 *
 * <p>Un usuario puede tener distintos roles según la sucursal (multi-sucursal). La combinación
 * (empresa_id, sucursal_id, username, rol_id) es única.
 */
@Entity
@Table(
    name = "sg_usuario_rol",
    schema = "seguridad",
    uniqueConstraints =
        @UniqueConstraint(columnNames = {"empresa_id", "sucursal_id", "username", "rol_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SgUsuarioRol extends BaseEntity implements Serializable {

  private static final long serialVersionUID = 1L;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  @JoinColumn(name = "username", referencedColumnName = "username", nullable = false)
  private SgUsuario usuario;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "rol_id", nullable = false)
  @JsonBackReference("rol-usuarios")
  private SgRol rol;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  @JoinColumn(name = "sucursal_id", nullable = false)
  private SgSucursal sucursalId;
}
