package com.braintech.eFacturador.jpa.seguridad;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "sg_feature_plan",
    schema = "seguridad",
    uniqueConstraints = @UniqueConstraint(columnNames = {"empresa_id", "feature_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SgFeaturePlan implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "empresa_id", nullable = false)
  private Integer empresaId;

  /** Identificador del feature: 'RECIBO_ENTREGA', etc. */
  @Column(name = "feature_id", nullable = false, length = 50)
  private String featureId;

  /** true = la empresa pagó y tiene acceso al feature. */
  @Column(name = "habilitado", nullable = false)
  private Boolean habilitado = false;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "usuario_reg", nullable = false, length = 100)
  private String usuarioReg;
}
