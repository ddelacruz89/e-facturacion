package com.braintech.eFacturador.jpa.producto;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import com.braintech.eFacturador.jpa.inventario.InSuplidor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

@Entity
@Table(name = "mg_producto_suplidor", schema = "producto")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@JsonIgnoreProperties(ignoreUnknown = true)
public class MgProductoSuplidor extends BaseEntity implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Integer id;

  @NotNull(message = "Precio no puede ser nulo")
  @Column(name = "precio")
  private BigDecimal precio;

  @NotNull(message = "Debe elegir un itbis")
  @Column(name = "itbis_default")
  @Comment("Indica si este suplidor aplica ITBIS por defecto para esta unidad de fracción")
  private Boolean itbisDefault;

  @JoinColumn(name = "suplidor_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  @NotNull(message = "Suplidor no puede ser null")
  private InSuplidor suplidorId;

  @Column(name = "estado_id")
  private String estadoId;
}
