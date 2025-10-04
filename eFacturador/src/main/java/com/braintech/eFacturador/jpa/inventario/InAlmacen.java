package com.braintech.eFacturador.jpa.inventario;

import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import jakarta.persistence.*;

import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "in_almacenes", schema = "inventario")
public class InAlmacen implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    private Integer id;

    @Basic(optional = false)
    private String nombre;

    @Column(name = "ubicacion")
    private String ubicacion;

    @Column(name = "usuario_reg")
    private String usuarioReg;

    @Column(name = "fecha_reg", insertable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaReg;

    private String estado;

    @JoinColumn(name = "sucursal_id")
    @ManyToOne(optional = false)
    private SgSucursal sucursalId;


    }