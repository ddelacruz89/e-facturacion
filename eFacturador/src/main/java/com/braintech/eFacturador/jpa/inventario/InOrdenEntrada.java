package com.braintech.eFacturador.jpa.inventario;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "in_orden_entrada", schema = "inventario")
public class InOrdenEntrada  implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    private Integer id;

    @NotNull(message = "Monto no debe estar vacio")
    private BigDecimal monto;

    @NotNull(message = "ITBIS no debe estar vacio")
    private BigDecimal itbis;

    @NotNull(message = "Total no debe estar vacio")
    private BigDecimal total;

    private BigDecimal descuento;
    private BigDecimal descuentoPorciento;

    @Column(name = "usuario_reg")
    private String usuarioReg;

    @Column(name = "fecha_reg", columnDefinition = "TIMESTAMP", insertable = false)
    private LocalDateTime fechaReg;


    @Column(name = "estado_id")
    private String estadoId;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "ordenEntradaId", fetch = FetchType.EAGER)
    private @Valid List<InOrdenEntradaDetalle> inOrdenDetalleList;

    @Column(name = "in_almacen_id")
    @NotNull(message = "Almacen no debe estar vacio no debe estar vacio")
    private Integer almacenId;

    }
