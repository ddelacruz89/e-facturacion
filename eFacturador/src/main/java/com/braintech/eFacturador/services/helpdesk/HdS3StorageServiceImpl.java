package com.braintech.eFacturador.services.helpdesk;

import java.io.InputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

@Service
@ConditionalOnProperty(name = "helpdesk.storage.provider", havingValue = "S3")
public class HdS3StorageServiceImpl implements HdStorageService {

  private final S3Client s3;
  private final String bucket;

  public HdS3StorageServiceImpl(
      @Value("${helpdesk.storage.s3.access-key}") String accessKey,
      @Value("${helpdesk.storage.s3.secret-key}") String secretKey,
      @Value("${helpdesk.storage.s3.bucket}") String bucket,
      @Value("${helpdesk.storage.s3.region}") String region) {
    this.bucket = bucket;
    this.s3 =
        S3Client.builder()
            .region(Region.of(region))
            .credentialsProvider(
                StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
            .build();
  }

  @Override
  public String upload(String key, InputStream inputStream, String mimeType, long tamanioBytes) {
    s3.putObject(
        PutObjectRequest.builder()
            .bucket(bucket)
            .key(key)
            .contentType(mimeType)
            .contentLength(tamanioBytes)
            .build(),
        RequestBody.fromInputStream(inputStream, tamanioBytes));
    return key;
  }

  @Override
  public InputStream download(String key) {
    return s3.getObject(GetObjectRequest.builder().bucket(bucket).key(key).build());
  }

  @Override
  public String getProviderName() {
    return "S3";
  }
}
