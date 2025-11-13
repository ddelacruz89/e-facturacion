package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.SuperClass.BaseSucursal;
import com.braintech.eFacturador.jpa.producto.MgProductoSuplidor;
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
public class InSuplidor extends BaseSucursal implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  private Integer id;

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

  //        @JoinColumn(name = "cxp_id")
  //        @ManyToOne(optional = false)
  //        private McCatalogosCuentas cuentaId;

  private Boolean servicio;

  private Boolean producto;

  @Column(name = "gastos_menores")
  private Boolean gastosMenores;

  //        @JoinColumn(name = "retenciones_id", referencedColumnName = "id")
  //        @ManyToOne
  //        private MgRetencionesItbis retencionesId;
  //
  //        @JoinColumn(name = "retenciones_isr_id", referencedColumnName = "id")
  //        @ManyToOne
  //        private MgRetencionesItbis retencionesIsrId;
  //
  //        @JoinColumn(name = "tipo_cf_id", referencedColumnName = "id")
  //        @ManyToOne(optional = false)
  //        @NotNull
  //        private MfTiposCf tiposCfId;

  @OneToMany(mappedBy = "suplidor")
  private List<MgProductoSuplidor> productosSuplidores;
}
