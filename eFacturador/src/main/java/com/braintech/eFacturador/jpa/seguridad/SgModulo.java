package com.braintech.eFacturador.jpa.seguridad;

import com.braintech.eFacturador.jpa.SuperClass.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "sg_modulo", schema = "seguridad")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class SgModulo extends BaseEntity {
    @Id
    @Column(name = "id",length = 5)
    String id;
    @Column(name = "modulo")
    String modulo;

    @OneToMany(mappedBy = "moduloId",cascade = CascadeType.ALL,orphanRemoval = true)
    List<SgMenu> menus;
}
