package com.braintech.eFacturador.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgUsuarioRepository;
import com.braintech.eFacturador.dao.seguridad.SgUsuarioRolRepository;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import com.braintech.eFacturador.seguridad.model.LoginRequest;
import com.braintech.eFacturador.seguridad.model.LoginResponse;
import com.braintech.eFacturador.seguridad.model.SelectSucursalRequest;
import com.braintech.eFacturador.seguridad.model.SucursalOpcionDTO;
import com.braintech.eFacturador.util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
  private final SgUsuarioRepository usuarioRepository;
  private final SgUsuarioRolRepository usuarioRolRepository;
  private final JwtUtil jwtUtil;
  private final PasswordEncoder passwordEncoder;

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    SgUsuario usuario = usuarioRepository.findByLoginEmailOrUsernameV1(request.getUsername());
    if (usuario == null || !passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
      return ResponseEntity.status(401).body(null);
    }

    List<SgSucursal> sucursales =
        usuarioRolRepository.findSucursalesActivasByUsername(usuario.getUsername());

    if (sucursales.isEmpty()) {
      return ResponseEntity.status(403).body(null);
    }

    // Eliminar duplicados por id de sucursal (en caso de múltiples roles en la misma sucursal)
    List<SucursalOpcionDTO> opciones =
        sucursales.stream()
            .collect(
                Collectors.toMap(
                    SgSucursal::getId,
                    s ->
                        new SucursalOpcionDTO(
                            s.getId(),
                            s.getNombre(),
                            s.getEmpresa() != null ? s.getEmpresa().getId() : null,
                            s.getEmpresa() != null ? s.getEmpresa().getEmpresa() : null),
                    (a, b) -> a))
            .values()
            .stream()
            .collect(Collectors.toList());

    LoginResponse response = new LoginResponse();
    response.setUsername(usuario.getUsername());

    if (opciones.size() == 1) {
      // Auto-selección: única sucursal disponible
      SucursalOpcionDTO opcion = opciones.get(0);
      String token =
          jwtUtil.generateToken(
              usuario.getUsername(),
              opcion.getEmpresaId(),
              opcion.getSucursalId(),
              opcion.getEmpresaNombre(),
              opcion.getSucursalNombre());
      response.setToken(token);
      response.setEmpresaId(opcion.getEmpresaId());
      response.setSucursalId(opcion.getSucursalId());
      response.setEmpresaNombre(opcion.getEmpresaNombre());
      response.setSucursalNombre(opcion.getSucursalNombre());
      response.setRequiresSucursalSelection(false);
    } else {
      // Múltiples sucursales: emitir pre-auth token y devolver opciones
      response.setPreAuthToken(jwtUtil.generatePreAuthToken(usuario.getUsername()));
      response.setSucursalesDisponibles(opciones);
      response.setRequiresSucursalSelection(true);
    }

    return ResponseEntity.ok(response);
  }

  @PostMapping("/select-sucursal")
  public ResponseEntity<LoginResponse> selectSucursal(@RequestBody SelectSucursalRequest request) {

    // Validar el pre-auth token
    String username;
    try {
      Claims claims =
          Jwts.parser()
              .setSigningKey(jwtUtil.getSecretKey())
              .parseClaimsJws(request.getPreAuthToken())
              .getBody();
      Boolean isPreAuth = claims.get("preAuth", Boolean.class);
      if (!Boolean.TRUE.equals(isPreAuth)) {
        return ResponseEntity.status(401).build();
      }
      username = claims.getSubject();
    } catch (JwtException | IllegalArgumentException e) {
      return ResponseEntity.status(401).build();
    }

    // Verificar que el usuario tiene acceso a la sucursal solicitada
    List<SgSucursal> sucursales = usuarioRolRepository.findSucursalesActivasByUsername(username);

    SucursalOpcionDTO opcion =
        sucursales.stream()
            .filter(s -> s.getId().equals(request.getSucursalId()))
            .findFirst()
            .map(
                s ->
                    new SucursalOpcionDTO(
                        s.getId(),
                        s.getNombre(),
                        s.getEmpresa() != null ? s.getEmpresa().getId() : null,
                        s.getEmpresa() != null ? s.getEmpresa().getEmpresa() : null))
            .orElse(null);

    if (opcion == null) {
      return ResponseEntity.status(403).build();
    }

    String token =
        jwtUtil.generateToken(
            username,
            opcion.getEmpresaId(),
            opcion.getSucursalId(),
            opcion.getEmpresaNombre(),
            opcion.getSucursalNombre());

    LoginResponse response = new LoginResponse();
    response.setToken(token);
    response.setUsername(username);
    response.setEmpresaId(opcion.getEmpresaId());
    response.setSucursalId(opcion.getSucursalId());
    response.setEmpresaNombre(opcion.getEmpresaNombre());
    response.setSucursalNombre(opcion.getSucursalNombre());
    response.setRequiresSucursalSelection(false);

    return ResponseEntity.ok(response);
  }

  @GetMapping("/validate")
  public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
    try {
      if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        return ResponseEntity.badRequest().body("Invalid authorization header");
      }

      String token = authHeader.substring(7);
      Claims claims =
          Jwts.parser().setSigningKey(jwtUtil.getSecretKey()).parseClaimsJws(token).getBody();

      LoginResponse response = new LoginResponse();
      response.setUsername(claims.getSubject());
      response.setEmpresaId(claims.get("empresaId", Integer.class));
      response.setSucursalId(claims.get("sucursalId", Integer.class));
      response.setEmpresaNombre(claims.get("empresaNombre", String.class));
      response.setSucursalNombre(claims.get("sucursalNombre", String.class));
      response.setToken(token);

      return ResponseEntity.ok(response);
    } catch (JwtException | IllegalArgumentException e) {
      return ResponseEntity.status(401).body("Invalid or expired token");
    }
  }
}
