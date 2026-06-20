package com.braintech.eFacturador.services.helpdesk;

import java.io.InputStream;

public interface HdStorageService {

  /**
   * Sube el archivo y retorna la clave relativa para guardar en hd_ticket_adjunto.ruta. Ej:
   * "helpdesk/tickets/42/uuid_factura.pdf"
   */
  String upload(String key, InputStream inputStream, String mimeType, long tamanioBytes);

  InputStream download(String key);

  String getProviderName();
}
