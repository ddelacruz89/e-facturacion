package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntitySucursal;
import com.braintech.eFacturador.jpa.general.MgItbis;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.*;

@Entity
@Table(name = "mf_itbis", schema = "facturacion")
@EqualsAndHashCode(callSuper = false)
public class MfSucursalItbis extends BaseEntitySucursal implements Serializable {

  private static final long serialVersionUID = 1L;

  private String nombre;

  private BigDecimal itbis;

  @JoinColumn(name = "mg_itbis_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  private MgItbis mgItbisId;

  public MfSucursalItbis(int i) {
    super(i);
  }

  public MfSucursalItbis(int i, String nombre, BigDecimal itbis, MgItbis mgItbisId) {
    super(i);
    this.nombre = nombre;
    this.itbis = itbis;
    this.mgItbisId = mgItbisId;
  }

  public MfSucursalItbis() {
    super();
  }
}
