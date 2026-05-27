package com.braintech.eFacturador.services;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class EmailService {

  private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

  private final RestTemplate restTemplate = new RestTemplate();

  @Value("${brevo.api.key}")
  private String apiKey;

  @Value("${brevo.from.email}")
  private String fromEmail;

  @Value("${brevo.from.name}")
  private String fromName;

  @Async
  public void enviarCodigoRecuperacion(String destinatario, String codigo) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("api-key", apiKey);

    Map<String, Object> body =
        Map.of(
            "sender", Map.of("name", fromName, "email", fromEmail),
            "to", List.of(Map.of("email", destinatario)),
            "subject", "Recuperación de contraseña — eFacturador",
            "htmlContent", construirHtml(codigo));

    HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
    restTemplate.postForEntity(BREVO_API_URL, request, String.class);
  }

  private String construirHtml(String codigo) {
    return """
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"></head>
        <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0">
          <table width="100%%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:40px 0">
              <table width="480" cellpadding="0" cellspacing="0"
                     style="background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1)">
                <tr>
                  <td style="background:#272C36;border-radius:8px 8px 0 0;padding:24px 32px">
                    <h2 style="color:#fff;margin:0;font-size:20px">eFacturador</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px">
                    <h3 style="margin:0 0 12px;color:#272C36">Recuperación de contraseña</h3>
                    <p style="color:#555;margin:0 0 24px">
                      Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                      Usa el siguiente código (válido por <strong>15 minutos</strong>):
                    </p>
                    <div style="text-align:center;margin:0 0 24px">
                      <span style="display:inline-block;background:#f0f2f5;border-radius:8px;
                                   padding:16px 40px;font-size:36px;font-weight:bold;
                                   letter-spacing:12px;color:#272C36">%s</span>
                    </div>
                    <p style="color:#888;font-size:13px;margin:0">
                      Si no solicitaste este cambio, ignora este correo. Tu contraseña no será modificada.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 32px;border-top:1px solid #eee">
                    <p style="color:#aaa;font-size:12px;margin:0;text-align:center">
                      © 2025 Braintech · eFacturador
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """
        .formatted(codigo);
  }
}
