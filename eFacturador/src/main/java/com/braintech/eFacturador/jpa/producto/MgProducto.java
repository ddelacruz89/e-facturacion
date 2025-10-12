package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEmpesaPk;
import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name = "mg_producto", schema = "producto")
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@IdClass(BaseEmpesaPk.class)
public class MgProducto extends BaseEntity implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @Column(name = "id")
  private Integer id;

  @Id
  @Column(name = "empresa_id")
  private Integer empresaId;

  @Column(name = "codigoBarra")
  private String codigoBarra;

  @Column(name = "categoria_id")
  private String categoriaId;

  @Column(name = "nombre_producto")
  private String nombreProducto;

  @Column(name = "descripcion")
  private String descripcion;

  @Column(name = "unidad_id")
  private String unidadId;

  @Column(name = "itbis_id")
  private Integer itbisId;

  @Column(name = "existencia")
  private Integer existencia;

  @Column(name = "precio_venta")
  private BigDecimal precioVenta;

  @Column(name = "precio_minimo")
  private BigDecimal precioMinimo;

  @Column(name = "precio_costo_avg")
  private BigDecimal precioCostoAvg;

  @Column(name = "trabajador")
  private Boolean trabajador;

  @Column(name = "comision")
  private BigDecimal comision;
}
