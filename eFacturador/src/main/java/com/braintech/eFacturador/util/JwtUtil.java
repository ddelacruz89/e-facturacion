package com.braintech.eFacturador.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Getter
@Component
public class JwtUtil {
  @Value("${jwt.secret}")
  private String secretKey;

  /** Token completo con sucursal y empresa seleccionadas. Duración: 24 horas. */
  public String generateToken(
      String username,
      Integer empresaId,
      Integer sucursalId,
      String empresaNombre,
      String sucursalNombre) {
    return Jwts.builder()
        .setSubject(username)
        .claim("empresaId", empresaId)
        .claim("sucursalId", sucursalId)
        .claim("empresaNombre", empresaNombre)
        .claim("sucursalNombre", sucursalNombre)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 día
        .signWith(SignatureAlgorithm.HS256, secretKey)
        .compact();
  }

  /**
   * Token de pre-autenticación: confirma que el usuario validó credenciales, pero aún no eligió
   * sucursal. Duración: 5 minutos.
   */
  public String generatePreAuthToken(String username) {
    return Jwts.builder()
        .setSubject(username)
        .claim("preAuth", true)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 300000)) // 5 min
        .signWith(SignatureAlgorithm.HS256, secretKey)
        .compact();
  }
}
