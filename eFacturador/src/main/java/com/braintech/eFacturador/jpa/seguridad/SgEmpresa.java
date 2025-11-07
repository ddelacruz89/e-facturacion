package com.braintech.eFacturador.jpa.seguridad;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sg_empresa", schema = "seguridad")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SgEmpresa implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @Column(name = "empresa")
  private String empresa;

  @Column(name = "rnc")
  private String rnc;

  @Column(name = "razon_social")
  private String razonSocial;

  @Column(name = "telefono")
  private String telefono;

  @Column(name = "correo")
  private String correo;

  @Column(name = "direccion")
  private String direccion;

  @Column(name = "usuario_reg", nullable = false)
  private String usuarioReg;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "activo")
  private Boolean activo;

  @Basic(optional = true)
  @Column(name = "logo")
  private byte[] logo;

  @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
  private java.util.List<SgSucursal> sucursales = new java.util.ArrayList<>();
}
