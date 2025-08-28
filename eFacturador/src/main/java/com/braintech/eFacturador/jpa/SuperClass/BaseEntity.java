package com.braintech.eFacturador.jpa.SuperClass;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@MappedSuperclass
public class BaseEntity {
    @Column(name = "usuario_reg", nullable = false)
    private String usuarioReg;
    @Column(name = "fecha_reg", nullable = false)
    private LocalDateTime fechaReg;
    @Column(name="activo")
    private Boolean activo;
}
