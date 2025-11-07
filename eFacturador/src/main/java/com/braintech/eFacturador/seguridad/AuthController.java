package com.braintech.eFacturador.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgUsuarioRepository;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import com.braintech.eFacturador.seguridad.model.LoginRequest;
import com.braintech.eFacturador.seguridad.model.LoginResponse;
import com.braintech.eFacturador.util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
  private final SgUsuarioRepository usuarioRepository;
  private final JwtUtil jwtUtil;
  private final PasswordEncoder passwordEncoder;

  @PostMapping("/login")
  public LoginResponse login(@RequestBody LoginRequest request) {
    SgUsuario usuario = usuarioRepository.findByLoginEmailOrUsernameV1(request.getUsername());
    if (usuario == null || !passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
      throw new RuntimeException("Credenciales inválidas");
    }
    Integer sucursalId = usuario.getSucursalId() != null ? usuario.getSucursalId().getId() : null;
    Integer empresaId =
        usuario.getSucursalId() != null && usuario.getSucursalId().getEmpresa() != null
            ? usuario.getSucursalId().getEmpresa().getId()
            : null;
    String token = jwtUtil.generateToken(usuario.getUsername(), empresaId, sucursalId);
    LoginResponse response = new LoginResponse();
    response.setToken(token);
    response.setUsername(usuario.getUsername());
    response.setEmpresaId(empresaId);
    response.setSucursalId(sucursalId);
    return response;
  }

  @GetMapping("/validate")
  public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
    try {
      if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        return ResponseEntity.badRequest().body("Invalid authorization header");
      }

      String token = authHeader.substring(7); // Remove "Bearer " prefix
      Claims claims =
          Jwts.parser().setSigningKey(jwtUtil.getSecretKey()).parseClaimsJws(token).getBody();

      // Extract user information from token
      String username = claims.getSubject();
      Integer empresaId = claims.get("empresaId", Integer.class);
      Integer sucursalId = claims.get("sucursalId", Integer.class);

      // Create response with user info
      LoginResponse response = new LoginResponse();
      response.setUsername(username);
      response.setEmpresaId(empresaId);
      response.setSucursalId(sucursalId);
      response.setToken(token);

      return ResponseEntity.ok(response);
    } catch (JwtException | IllegalArgumentException e) {
      return ResponseEntity.status(401).body("Invalid or expired token");
    }
  }
}
