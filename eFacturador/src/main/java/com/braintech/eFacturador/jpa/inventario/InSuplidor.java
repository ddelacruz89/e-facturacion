package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import com.braintech.eFacturador.jpa.producto.MgProductoSuplidor;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import java.io.Serializable;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "in_suplidor", schema = "inventario")
@EqualsAndHashCode(callSuper = false)
public class InSuplidor extends BaseEntity implements Serializable {

  public InSuplidor() {}

  public InSuplidor(Integer id) {
    this.id = id;
  }

  private static final long serialVersionUID = 1L;

  @Basic(optional = false)
  private String nombre;

  private String rnc;

  private String direccion;

  private String contacto1;

  private String contacto2;

  private String telefono1;

  private String telefono2;

  @Email(message = "Formato de correo debe ser correo@ejemplo ")
  private String correo1;

  @Email(message = "Formato de correo debe ser correo@ejemplo ")
  private String correo2;

  private Boolean servicio;

  private Boolean producto;

  @Column(name = "estado_id")
  private String estadoId;

  @OneToMany(mappedBy = "suplidorId", fetch = FetchType.LAZY)
  @JsonManagedReference
  private List<MgProductoSuplidor> productosSuplidores;
}
