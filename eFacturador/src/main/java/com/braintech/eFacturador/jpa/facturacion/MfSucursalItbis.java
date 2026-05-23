package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntityPk;
import com.braintech.eFacturador.jpa.general.MgItbis;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "mf_itbis", schema = "facturacion")
@Getter
@Setter
@EqualsAndHashCode(callSuper = false)
public class MfSucursalItbis extends BaseEntityPk implements Serializable {

  private static final long serialVersionUID = 1L;

  @Column(name = "nombre")
  private String nombre;

  @Column(name = "itbis")
  private BigDecimal itbis;

  @Column(name = "usuario_reg")
  private String usuarioReg;

  @Column(name = "fecha_reg")
  private LocalDateTime fechaReg;

  @Column(name = "activo")
  private Boolean activo;

  @JoinColumn(name = "mg_itbis_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  private MgItbis mgItbisId;

  public MfSucursalItbis(int i) {
    super(i);
  }

  public MfSucursalItbis() {
    super();
  }
}
