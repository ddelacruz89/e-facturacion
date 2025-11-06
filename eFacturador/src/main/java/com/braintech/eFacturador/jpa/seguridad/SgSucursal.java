package com.braintech.eFacturador.jpa.seguridad;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "sg_sucursal", schema = "seguridad")
@Getter
@Setter
public class SgSucursal implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @Column(name = "nombre")
  private String nombre;

  @Column(name = "encargado")
  private String encargado;

  @Column(name = "direccion")
  private String direccion;

  @Column(name = "email")
  private String email;

  @Column(name = "estado_id")
  private String estadoId;

  @Column(name = "usuario_reg", nullable = false)
  private String usuarioReg;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "activo")
  private Boolean activo;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "empresa_id")
  @com.fasterxml.jackson.annotation.JsonIgnoreProperties("sucursales")
  private SgEmpresa empresa;
}
