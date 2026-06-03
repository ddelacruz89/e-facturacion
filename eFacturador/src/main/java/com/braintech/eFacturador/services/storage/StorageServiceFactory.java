package com.braintech.eFacturador.services.storage;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobContainerClientBuilder;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Component
@Slf4j
@RequiredArgsConstructor
public class StorageServiceFactory {

  private final ObjectMapper objectMapper;

  @Value("${app.storage.local.base-path:/uploads/recibos}")
  private String localBasePath;

  @Value("${app.storage.local.base-url:}")
  private String localBaseUrl;

  /**
   * Sube un archivo al proveedor configurado y retorna la URL de acceso.
   *
   * @param storageTipo AWS_S3 | AZURE_BLOB | LOCAL
   * @param storageConfigJson JSON con credenciales del proveedor
   * @param empresaId ID de la empresa (usado como subdirectorio en LOCAL)
   * @param data bytes del archivo
   * @param originalFilename nombre original del archivo
   * @param contentType MIME type
   * @return URL pública del archivo subido
   */
  public String upload(
      String storageTipo,
      String storageConfigJson,
      Integer empresaId,
      byte[] data,
      String originalFilename,
      String contentType) {

    String ext = extractExtension(originalFilename);
    String filename = UUID.randomUUID() + ext;

    return switch (storageTipo) {
      case "AWS_S3" -> uploadS3(parseConfig(storageConfigJson), data, filename, contentType);
      case "AZURE_BLOB" ->
          uploadAzureBlob(parseConfig(storageConfigJson), data, filename, contentType);
      case "LOCAL" -> uploadLocal(empresaId, data, filename);
      default -> throw new IllegalArgumentException("Storage tipo no soportado: " + storageTipo);
    };
  }

  /**
   * Resuelve la ruta absoluta del archivo para LOCAL storage. Retorna null para S3/Azure (se accede
   * directamente por URL).
   */
  public Path resolveLocalPath(Integer empresaId, String filename) {
    return Paths.get(localBasePath, String.valueOf(empresaId), filename);
  }

  private String uploadS3(
      Map<String, Object> config, byte[] data, String filename, String contentType) {
    String bucket = (String) config.get("bucketName");
    String region = (String) config.get("region");
    String accessKey = (String) config.get("accessKeyId");
    String secretKey = (String) config.get("secretAccessKey");
    String prefix = config.getOrDefault("pathPrefix", "recibos/").toString();

    try (S3Client s3 =
        S3Client.builder()
            .region(Region.of(region))
            .credentialsProvider(
                StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
            .build()) {

      String key = prefix + filename;
      s3.putObject(
          PutObjectRequest.builder().bucket(bucket).key(key).contentType(contentType).build(),
          RequestBody.fromBytes(data));

      return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }
  }

  private String uploadAzureBlob(
      Map<String, Object> config, byte[] data, String filename, String contentType) {
    String connectionString = (String) config.get("connectionString");
    String containerName = (String) config.get("containerName");

    BlobContainerClient containerClient =
        new BlobContainerClientBuilder()
            .connectionString(connectionString)
            .containerName(containerName)
            .buildClient();

    containerClient.createIfNotExists();

    var blobClient = containerClient.getBlobClient(filename);
    try (InputStream is = new ByteArrayInputStream(data)) {
      blobClient.upload(is, data.length, true);
    } catch (IOException e) {
      throw new IllegalStateException("Error al subir a Azure Blob: " + e.getMessage(), e);
    }

    return blobClient.getBlobUrl();
  }

  private String uploadLocal(Integer empresaId, byte[] data, String filename) {
    try {
      Path dir = Paths.get(localBasePath, String.valueOf(empresaId));
      Files.createDirectories(dir);
      Path filePath = dir.resolve(filename);
      Files.write(filePath, data);
      // URL que el backend sirve via GET /api/v1/despacho/ordenes/{id}/recibo/file
      return "local://" + empresaId + "/" + filename;
    } catch (IOException e) {
      throw new IllegalStateException("Error al guardar archivo local: " + e.getMessage(), e);
    }
  }

  private Map<String, Object> parseConfig(String json) {
    if (json == null || json.isBlank()) return Map.of();
    try {
      return objectMapper.readValue(json, new TypeReference<>() {});
    } catch (IOException e) {
      throw new IllegalArgumentException("storageConfig JSON inválido", e);
    }
  }

  private String extractExtension(String filename) {
    if (filename == null) return "";
    int dot = filename.lastIndexOf('.');
    return dot >= 0 ? filename.substring(dot) : "";
  }
}
