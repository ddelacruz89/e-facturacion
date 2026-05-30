package com.braintech.eFacturador.jpa.despacho;

import com.braintech.eFacturador.jpa.SuperClass.BaseSucursal;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(
    name = "de_orden_despacho",
    schema = "despacho",
    uniqueConstraints = @UniqueConstraint(columnNames = {"factura_id", "empresa_id"}))
@EqualsAndHashCode(callSuper = false)
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class DeOrdenDespacho extends BaseSucursal implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Basic(optional = false)
  private Integer id;

  private Integer secuencia;

  @Column(name = "factura_id", nullable = false)
  @NotNull(message = "La factura no debe estar vacía")
  private Integer facturaId;

  @Column(name = "factura_secuencia")
  private Integer facturaSecuencia;

  @Column(name = "cliente_id")
  private Integer clienteId;

  @Column(name = "cliente_nombre")
  private String clienteNombre;

  @Column(name = "cliente_telefono")
  private String clienteTelefono;

  @Column(name = "direccion_entrega")
  private String direccionEntrega;

  @Column(name = "fecha_compromiso")
  @NotNull(message = "La fecha de compromiso no debe estar vacía")
  private LocalDateTime fechaCompromiso;

  @Column(name = "ruta_id")
  private Integer rutaId;

  @Column(name = "notas")
  private String notas;

  @Column(name = "fecha_entrega")
  private LocalDateTime fechaEntrega;

  @Column(name = "usuario_entrego")
  private String usuarioEntrego;
}
