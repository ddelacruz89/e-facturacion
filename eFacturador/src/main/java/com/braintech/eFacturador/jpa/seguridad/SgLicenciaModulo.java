package com.braintech.eFacturador.jpa.seguridad;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
    name = "sg_licencia_modulo",
    schema = "seguridad",
    uniqueConstraints = @UniqueConstraint(columnNames = {"empresa_id", "modulo_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SgLicenciaModulo implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "empresa_id", nullable = false)
  private Integer empresaId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "modulo_id", nullable = false)
  private SgModulo modulo;

  @Column(name = "activo", nullable = false)
  private Boolean activo = true;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "usuario_reg", nullable = false, length = 100)
  private String usuarioReg;
}
