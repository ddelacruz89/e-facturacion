package com.braintech.eFacturador.util;

import com.braintech.eFacturador.exceptions.InvalidCredentialException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class TenantContext {

  @Autowired private JwtUtil jwtUtil;

  public Integer getCurrentEmpresaId() {
    try {
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication == null || authentication.getCredentials() == null) {
        throw new InvalidCredentialException("Token de autenticación no encontrado");
      }
      String token = authentication.getCredentials().toString();
      Claims claims =
          Jwts.parser().setSigningKey(jwtUtil.getSecretKey()).parseClaimsJws(token).getBody();
      return claims.get("empresaId", Integer.class);
    } catch (JwtException | IllegalArgumentException e) {
      log.error("Token JWT inválido o mal formado", e);
      throw new InvalidCredentialException("Token de autenticación inválido");
    }
  }

  public Integer getCurrentSucursalId() {
    try {
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication == null || authentication.getCredentials() == null) {
        throw new InvalidCredentialException("Token de autenticación no encontrado");
      }
      String token = authentication.getCredentials().toString();
      Claims claims =
          Jwts.parser().setSigningKey(jwtUtil.getSecretKey()).parseClaimsJws(token).getBody();
      return claims.get("sucursalId", Integer.class);
    } catch (JwtException | IllegalArgumentException e) {
      log.error("Token JWT inválido o mal formado", e);
      throw new InvalidCredentialException("Token de autenticación inválido");
    }
  }

  public String getCurrentUsername() {
    try {
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication == null || authentication.getCredentials() == null) {
        throw new InvalidCredentialException("Token de autenticación no encontrado");
      }
      String token = authentication.getCredentials().toString();
      Claims claims =
          Jwts.parser().setSigningKey(jwtUtil.getSecretKey()).parseClaimsJws(token).getBody();
      return claims.getSubject();
    } catch (JwtException | IllegalArgumentException e) {
      log.error("Token JWT inválido o mal formado", e);
      throw new InvalidCredentialException("Token de autenticación inválido");
    }
  }
}
