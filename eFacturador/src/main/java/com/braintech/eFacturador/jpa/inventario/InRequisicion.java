package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.SuperClass.BaseSucursal;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "in_requisicion", schema = "inventario")
@EqualsAndHashCode(callSuper = false)
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class InRequisicion extends BaseSucursal implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  private Integer id;

  private Integer secuencia;

  @Column(name = "almacen_solicitante_id")
  @NotNull(message = "Almacén solicitante no debe estar vacío")
  private Integer almacenSolicitanteId;

  @Column(name = "almacen_origen_id")
  @NotNull(message = "Almacén origen no debe estar vacío")
  private Integer almacenOrigenId;

  @NotNull(message = "Prioridad no debe estar vacía")
  private String prioridad;

  private String observaciones;

  @Column(name = "fecha_requerida")
  private LocalDate fechaRequerida;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "requisicionId", fetch = FetchType.EAGER)
  private @Valid List<InRequisicionDetalle> detalles;
}
