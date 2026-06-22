package com.braintech.eFacturador.services.helpdesk;

import java.io.*;
import java.nio.file.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "helpdesk.storage.provider", havingValue = "LOCAL")
public class HdLocalStorageServiceImpl implements HdStorageService {

  private final Path basePath;

  public HdLocalStorageServiceImpl(@Value("${helpdesk.storage.local.base-path}") String basePath) {
    this.basePath = Path.of(basePath);
  }

  @Override
  public String upload(String key, InputStream inputStream, String mimeType, long tamanioBytes) {
    Path destino = basePath.resolve(key);
    try {
      Files.createDirectories(destino.getParent());
      Files.copy(inputStream, destino, StandardCopyOption.REPLACE_EXISTING);
      return key;
    } catch (IOException e) {
      throw new RuntimeException("Error guardando adjunto: " + key, e);
    }
  }

  @Override
  public InputStream download(String key) {
    try {
      return Files.newInputStream(basePath.resolve(key));
    } catch (IOException e) {
      throw new RuntimeException("Adjunto no encontrado: " + key, e);
    }
  }

  @Override
  public String getProviderName() {
    return "LOCAL";
  }
}
