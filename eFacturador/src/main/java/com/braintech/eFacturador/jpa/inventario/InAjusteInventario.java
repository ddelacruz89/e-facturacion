package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.SuperClass.BaseSucursal;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Comment;

@Data
@Entity
@EqualsAndHashCode(callSuper = false)
@Table(name = "in_ajuste_inventario", schema = "inventario")
public class InAjusteInventario extends BaseSucursal implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "almacen_id", nullable = false)
  @Comment("Almacén sobre el que aplica el ajuste")
  private Integer almacenId;

  @Column(name = "movimiento_tipo_id")
  @Comment("FK a in_movimientos_tipos — tipo de ajuste seleccionado por el usuario")
  private Integer movimientoTipoId;

  @Column(name = "observacion", length = 500)
  @Comment("Motivo libre del ajuste (opcional)")
  private String observacion;

  @Column(name = "estado_id", length = 3, nullable = false)
  @Comment("APL = aplicado; ANU = anulado")
  private String estadoId;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "ajuste", fetch = FetchType.EAGER)
  private List<InAjusteInventarioDetalle> detalles;
}
