package com.braintech.eFacturador.jpa.seguridad;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "sg_licencia", schema = "seguridad")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SgLicencia implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "empresa_id", nullable = false, unique = true)
  private Integer empresaId;

  @Column(name = "max_usuarios", nullable = false)
  private Integer maxUsuarios = 5;

  @Column(name = "max_sucursales", nullable = false)
  private Integer maxSucursales = 1;

  @Column(name = "fecha_vencimiento")
  private LocalDate fechaVencimiento;

  @Column(name = "activo", nullable = false)
  private Boolean activo = true;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "usuario_reg", nullable = false, length = 100)
  private String usuarioReg;
}
