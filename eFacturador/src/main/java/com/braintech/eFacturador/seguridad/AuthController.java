package com.braintech.eFacturador.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgRecuperacionTokenRepository;
import com.braintech.eFacturador.dao.seguridad.SgUsuarioRepository;
import com.braintech.eFacturador.dao.seguridad.SgUsuarioRolRepository;
import com.braintech.eFacturador.jpa.seguridad.SgRecuperacionToken;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import com.braintech.eFacturador.seguridad.model.CambiarPasswordRequest;
import com.braintech.eFacturador.seguridad.model.LoginRequest;
import com.braintech.eFacturador.seguridad.model.LoginResponse;
import com.braintech.eFacturador.seguridad.model.SelectSucursalRequest;
import com.braintech.eFacturador.seguridad.model.SolicitarRecuperacionRequest;
import com.braintech.eFacturador.seguridad.model.SucursalOpcionDTO;
import com.braintech.eFacturador.seguridad.model.VerificarRecuperacionRequest;
import com.braintech.eFacturador.services.EmailService;
import com.braintech.eFacturador.util.JwtUtil;
import com.braintech.eFacturador.util.TenantContext;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
  private final SgUsuarioRepository usuarioRepository;
  private final SgUsuarioRolRepository usuarioRolRepository;
  private final SgRecuperacionTokenRepository recuperacionTokenRepository;
  private final JwtUtil jwtUtil;
  private final PasswordEncoder passwordEncoder;
  private final TenantContext tenantContext;
  private final EmailService emailService;

  private static final SecureRandom RNG = new SecureRandom();

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

  @PostMapping("/recuperar-password/solicitar")
  public ResponseEntity<?> solicitarRecuperacion(@RequestBody SolicitarRecuperacionRequest req) {
    log.info("[RecuperarPassword] Solicitud recibida para email: {}", req.getEmail());
    SgUsuario usuario = usuarioRepository.findByLoginEmail(req.getEmail());
    if (usuario == null) {
      log.warn("[RecuperarPassword] No se encontró usuario con loginEmail: {}", req.getEmail());
      return ResponseEntity.ok().build();
    }
    log.info(
        "[RecuperarPassword] Usuario encontrado: {} — generando código", usuario.getUsername());
    recuperacionTokenRepository.invalidarTokensDeEmail(req.getEmail());
    String codigo = String.format("%06d", RNG.nextInt(1_000_000));
    SgRecuperacionToken token =
        new SgRecuperacionToken(req.getEmail(), codigo, LocalDateTime.now().plusMinutes(15));
    recuperacionTokenRepository.save(token);
    emailService.enviarCodigoRecuperacion(req.getEmail(), codigo);
    log.info("[RecuperarPassword] Token guardado — email en cola async");
    return ResponseEntity.ok().build();
  }

  @PostMapping("/recuperar-password/verificar")
  public ResponseEntity<?> verificarRecuperacion(@RequestBody VerificarRecuperacionRequest req) {
    if (req.getPasswordNueva() == null || req.getPasswordNueva().length() < 6) {
      return ResponseEntity.badRequest()
          .body("La nueva contraseña debe tener al menos 6 caracteres");
    }
    SgRecuperacionToken token =
        recuperacionTokenRepository.findTokenValido(req.getEmail(), req.getCodigo()).orElse(null);
    if (token == null) {
      return ResponseEntity.status(400).body("Código inválido o expirado");
    }
    SgUsuario usuario = usuarioRepository.findByLoginEmail(req.getEmail());
    if (usuario == null) {
      return ResponseEntity.status(404).body("Usuario no encontrado");
    }
    usuario.setPassword(passwordEncoder.encode(req.getPasswordNueva()));
    usuarioRepository.save(usuario);
    recuperacionTokenRepository.invalidarTokensDeEmail(req.getEmail());
    return ResponseEntity.ok().build();
  }

  @PostMapping("/cambiar-password")
  public ResponseEntity<?> cambiarPassword(@RequestBody CambiarPasswordRequest request) {
    String username = tenantContext.getCurrentUsername();
    SgUsuario usuario = usuarioRepository.findByUsername(username);
    if (usuario == null) {
      return ResponseEntity.status(404).body("Usuario no encontrado");
    }
    if (!passwordEncoder.matches(request.getPasswordActual(), usuario.getPassword())) {
      return ResponseEntity.status(400).body("La contraseña actual es incorrecta");
    }
    usuario.setPassword(passwordEncoder.encode(request.getPasswordNueva()));
    usuarioRepository.save(usuario);
    return ResponseEntity.ok().build();
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
