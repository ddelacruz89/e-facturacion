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

  public String generateToken(String email, Integer empresaId, Integer sucursalId) {
    return Jwts.builder()
        .setSubject(email)
        .claim("empresaId", empresaId)
        .claim("sucursalId", sucursalId)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 día
        .signWith(SignatureAlgorithm.HS256, secretKey)
        .compact();
  }
}
