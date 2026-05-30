package com.braintech.eFacturador.jpa.despacho;

import com.braintech.eFacturador.jpa.SuperClass.BaseSucursal;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "de_ruta_entrega", schema = "despacho")
@EqualsAndHashCode(callSuper = false)
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class DeRutaEntrega extends BaseSucursal implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  private Integer id;

  private Integer secuencia;

  @Column(name = "fecha", nullable = false)
  @NotNull(message = "La fecha de ruta no debe estar vacía")
  private LocalDate fecha;

  @Column(name = "vehiculo_id", nullable = false)
  @NotNull(message = "El vehículo no debe estar vacío")
  private Integer vehiculoId;

  @Column(name = "conductor_username", nullable = false)
  @NotNull(message = "El conductor no debe estar vacío")
  private String conductorUsername;

  @Column(name = "notas")
  private String notas;
}
