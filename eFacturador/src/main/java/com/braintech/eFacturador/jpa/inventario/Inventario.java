package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.producto.MgProducto;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "in_inventarios", schema = "inventario")
@Getter
@Setter
public class Inventario implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    private Integer id;

    private Double cantidad;

    @Column(name = "usuario_reg")
    private String usuarioReg;

    @Column(name = "fecha_reg", insertable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaReg;

    @JoinColumn(name = "almacen_id")
    @ManyToOne(optional = false)
    private InAlmacen almacenId;

    @JoinColumn(name = "producto_id")
    @ManyToOne(optional = false)
    private MgProducto productoId;

    @Column(name = "estado_id")
    private String estadoId;

    @Column(name = "estado_producto_inventario")
    private String estadoProductoInventario;

    @Column(name = "lote")
    private String loteId;

    @JoinColumn(name = "sucursal_id")
    @ManyToOne(optional = false)
    private SgSucursal sucursalId;

    }
