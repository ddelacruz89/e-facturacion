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
    return getClaims().get("empresaId", Integer.class);
  }

  public Integer getCurrentSucursalId() {
    return getClaims().get("sucursalId", Integer.class);
  }

  public String getCurrentUsername() {
    return getClaims().getSubject();
  }

  public String getCurrentEmpresaNombre() {
    return getClaims().get("empresaNombre", String.class);
  }

  public String getCurrentSucursalNombre() {
    return getClaims().get("sucursalNombre", String.class);
  }

  private Claims getClaims() {
    try {
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication == null || authentication.getCredentials() == null) {
        throw new InvalidCredentialException("Token de autenticación no encontrado");
      }
      String token = authentication.getCredentials().toString();
      return Jwts.parser().setSigningKey(jwtUtil.getSecretKey()).parseClaimsJws(token).getBody();
    } catch (JwtException | IllegalArgumentException e) {
      log.error("Token JWT inválido o mal formado", e);
      throw new InvalidCredentialException("Token de autenticación inválido");
    }
  }
}
