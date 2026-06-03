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
    name = "sg_empresa_feature_config",
    schema = "seguridad",
    uniqueConstraints = @UniqueConstraint(columnNames = {"empresa_id", "feature_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SgEmpresaFeatureConfig implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "empresa_id", nullable = false)
  private Integer empresaId;

  @Column(name = "feature_id", nullable = false, length = 50)
  private String featureId;

  /** true = la empresa tiene el feature activo (aún requiere habilitado=true en FeaturePlan). */
  @Column(name = "activo", nullable = false)
  private Boolean activo = false;

  /** Proveedor de almacenamiento elegido: AWS_S3 | AZURE_BLOB | LOCAL */
  @Column(name = "storage_tipo", length = 20)
  private String storageTipo;

  /**
   * JSON con las credenciales del proveedor. AWS_S3: bucketName, region, accessKeyId,
   * secretAccessKey AZURE_BLOB: connectionString, containerName LOCAL: (vacío — usa
   * app.storage.local.base-path)
   */
  @Column(name = "storage_config", columnDefinition = "TEXT")
  private String storageConfig;

  @Column(name = "fecha_reg", nullable = false)
  private LocalDateTime fechaReg;

  @Column(name = "usuario_reg", nullable = false, length = 100)
  private String usuarioReg;
}
