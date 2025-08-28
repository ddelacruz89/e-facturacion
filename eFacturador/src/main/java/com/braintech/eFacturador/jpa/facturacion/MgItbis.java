package com.braintech.eFacturador.jpa.facturacion;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "mg_itbis",schema = "facturacion")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MgItbis extends BaseEntity {

    @Id
    @Column(name = "id")
    private Integer id;
    private String nombre;
    private BigDecimal itbis;
}
