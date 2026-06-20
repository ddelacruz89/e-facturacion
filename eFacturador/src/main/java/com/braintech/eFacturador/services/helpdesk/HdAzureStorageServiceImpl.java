package com.braintech.eFacturador.services.helpdesk;

import com.azure.storage.blob.*;
import com.azure.storage.blob.models.BlobHttpHeaders;
import java.io.InputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "helpdesk.storage.provider", havingValue = "AZURE")
public class HdAzureStorageServiceImpl implements HdStorageService {

  private final BlobContainerClient containerClient;

  public HdAzureStorageServiceImpl(
      @Value("${helpdesk.storage.azure.connection-string}") String connectionString,
      @Value("${helpdesk.storage.azure.container}") String container) {
    this.containerClient =
        new BlobServiceClientBuilder()
            .connectionString(connectionString)
            .buildClient()
            .getBlobContainerClient(container);
  }

  @Override
  public String upload(String key, InputStream inputStream, String mimeType, long tamanioBytes) {
    BlobClient blob = containerClient.getBlobClient(key);
    blob.upload(inputStream, tamanioBytes, true);
    blob.setHttpHeaders(new BlobHttpHeaders().setContentType(mimeType));
    return key;
  }

  @Override
  public InputStream download(String key) {
    return containerClient.getBlobClient(key).openInputStream();
  }

  @Override
  public String getProviderName() {
    return "AZURE";
  }
}
