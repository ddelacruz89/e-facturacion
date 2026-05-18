package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.SuperClass.BaseSucursal;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "in_transferencias", schema = "inventario")
@EqualsAndHashCode(callSuper = false)
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class InTransferencia extends BaseSucursal implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  private Integer id;

  @JoinColumn(name = "origen_almacen_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  @NotNull(message = "Almacén origen no debe estar vacío")
  private InAlmacen origenAlmacenId;

  @JoinColumn(name = "destino_almacen_id", referencedColumnName = "id")
  @ManyToOne(optional = false)
  @NotNull(message = "Almacén destino no debe estar vacío")
  private InAlmacen destinoAlmacenId;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "transferenciaId", fetch = FetchType.EAGER)
  private @Valid List<InTransferenciaDetalle> detalles;
}
