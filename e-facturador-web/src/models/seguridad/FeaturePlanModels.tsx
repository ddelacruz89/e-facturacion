export const FEATURE_RECIBO_ENTREGA = "RECIBO_ENTREGA";

export const STORAGE_TIPOS = ["AWS_S3", "AZURE_BLOB", "LOCAL"] as const;
export type StorageTipo = (typeof STORAGE_TIPOS)[number];

export interface SgFeaturePlan {
  id?: number;
  empresaId: number;
  featureId: string;
  habilitado: boolean;
}

export interface EmpresaFeatureConfigDTO {
  id?: number;
  empresaId?: number;
  featureId?: string;
  activo: boolean;
  storageTipo?: StorageTipo;
  /** Credenciales con campos sensibles enmascarados (GET). Al PUT enviar valores reales. */
  storageConfig?: AwsS3Config | AzureBlobConfig | LocalConfig | Record<string, string>;
  /** true si el feature está habilitado comercialmente en el plan de la empresa. */
  habilitadoComercialmente?: boolean;
}

export interface AwsS3Config {
  bucketName: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  pathPrefix?: string;
}

export interface AzureBlobConfig {
  connectionString: string;
  containerName: string;
}

export interface LocalConfig {
  // Sin campos: la ruta la configura el administrador del servidor via app.storage.local.base-path
  [key: string]: never;
}
