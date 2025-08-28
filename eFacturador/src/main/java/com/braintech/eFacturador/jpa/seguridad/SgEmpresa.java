package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="sg_empresa",schema = "seguridad")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SgEmpresa extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
   private Integer id;
    @Column(name = "empresa")
    private String empresa;
    @Column(name = "rnc")
    private  String rnc;
    @Column(name = "razon_social")
    private String razonSocial;
    @Column(name = "telefono")
    private  String telefono;
    @Column(name = "correo")
    private  String correo;
    @Column(name = "direccion")
    private String direccion;
    @Column(name = "logo")
    private byte[] logo;
}
