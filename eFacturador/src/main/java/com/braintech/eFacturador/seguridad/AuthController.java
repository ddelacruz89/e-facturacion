package com.braintech.eFacturador.seguridad;

import com.braintech.eFacturador.dao.seguridad.EmpresaDao;
import com.braintech.eFacturador.dao.seguridad.SgAccesoSoporteRepository;
import com.braintech.eFacturador.dao.seguridad.SgRecuperacionTokenRepository;
import com.braintech.eFacturador.dao.seguridad.SgSucursalRepository;
import com.braintech.eFacturador.dao.seguridad.SgUsuarioRepository;
import com.braintech.eFacturador.dao.seguridad.SgUsuarioRolRepository;
import com.braintech.eFacturador.interfaces.seguridad.SgEmpresaIpPermitidaService;
import com.braintech.eFacturador.jpa.seguridad.SgAccesoSoporte;
import com.braintech.eFacturador.jpa.seguridad.SgEmpresa;
import com.braintech.eFacturador.jpa.seguridad.SgRecuperacionToken;
import com.braintech.eFacturador.jpa.seguridad.SgSucursal;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import com.braintech.eFacturador.seguridad.model.CambiarPasswordRequest;
import com.braintech.eFacturador.seguridad.model.EmpresaSoporteOpcionDTO;
import com.braintech.eFacturador.seguridad.model.LoginRequest;
import com.braintech.eFacturador.seguridad.model.LoginResponse;
import com.braintech.eFacturador.seguridad.model.SelectEmpresaSoporteRequest;
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
import jakarta.servlet.http.HttpServletRequest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
  private final SgAccesoSoporteRepository accesoSoporteRepository;
  private final SgSucursalRepository sucursalRepository;
  private final EmpresaDao empresaDao;
  private final JwtUtil jwtUtil;
  private final PasswordEncoder passwordEncoder;
  private final TenantContext tenantContext;
  private final EmailService emailService;
  private final LoginAttemptService loginAttemptService;
  private final SgEmpresaIpPermitidaService ipPermitidaService;

  private static final SecureRandom RNG = new SecureRandom();

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(
      @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
    String ip = resolverIp(httpRequest);
    SgUsuario usuario = usuarioRepository.findByLoginEmailOrUsernameV1(request.getUsername());
    String trackingUsername = usuario != null ? usuario.getUsername() : request.getUsername();

    Optional<LocalDateTime> lockedUntil = loginAttemptService.getLockedUntil(trackingUsername);
    if (lockedUntil.isPresent()) {
      loginAttemptService.registrarIntento(
          trackingUsername, ip, false, LoginAttemptService.MOTIVO_BLOQUEADO);
      long min = loginAttemptService.minutosRestantes(lockedUntil.get());
      String msg =
          "Cuenta bloqueada por múltiples intentos fallidos. Intente de nuevo en "
              + min
              + " minuto(s).";
      return ResponseEntity.status(429).body(new LoginResponse(msg));
    }

    if (usuario == null) {
      loginAttemptService.registrarIntento(
          trackingUsername, ip, false, LoginAttemptService.MOTIVO_NO_EXISTE);
      return ResponseEntity.status(401).body(null);
    }

    if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
      loginAttemptService.registrarIntento(
          usuario.getUsername(), ip, false, LoginAttemptService.MOTIVO_CONTRASENA);
      return ResponseEntity.status(401).body(null);
    }

    loginAttemptService.registrarIntento(usuario.getUsername(), ip, true, null);

    // ── Flujo especial para usuarios de soporte (exento de restricción IP) ───
    if (Boolean.TRUE.equals(usuario.getEsSoporte())) {
      return loginSoporte(usuario);
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Verificar IP si la empresa tiene lista blanca configurada
    if (!ipPermitidaService.ipAutorizada(usuario.getEmpresaId(), ip)) {
      loginAttemptService.registrarIntento(
          usuario.getUsername(), ip, false, LoginAttemptService.MOTIVO_IP_NO_AUTORIZADA);
      return ResponseEntity.status(403)
          .body(new LoginResponse("Acceso no permitido desde esta dirección IP."));
    }

    List<SgSucursal> sucursales =
        usuarioRolRepository.findSucursalesActivasByUsername(usuario.getUsername());

    if (sucursales.isEmpty()) {
      return ResponseEntity.status(403)
          .body(new LoginResponse("Usuario sin sucursales activas asignadas"));
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

  // ── Soporte ───────────────────────────────────────────────────────────────

  /**
   * Flujo de login para usuarios con {@code es_soporte=true}.
   *
   * <p>Si el usuario tiene exactamente un grant activo se emite el JWT soporte directamente (igual
   * que el flujo de sucursal única en usuarios normales). Si tiene más de uno se devuelve {@code
   * requiresEmpresaSoporteSelection=true} y el frontend llama a {@code /select-empresa-soporte}.
   */
  private ResponseEntity<LoginResponse> loginSoporte(SgUsuario usuario) {
    List<SgAccesoSoporte> accesos =
        accesoSoporteRepository.findAccesosActivosByUsername(
            usuario.getUsername(), java.time.LocalDateTime.now());

    if (accesos.isEmpty()) {
      log.warn("Soporte sin grants activos — username={}", usuario.getUsername());
      return ResponseEntity.status(403).body(null);
    }

    List<EmpresaSoporteOpcionDTO> opciones =
        accesos.stream()
            .map(
                a -> {
                  SgEmpresa empresa = empresaDao.findById(a.getEmpresaId()).orElse(null);
                  return new EmpresaSoporteOpcionDTO(
                      a.getEmpresaId(),
                      empresa != null ? empresa.getEmpresa() : "Empresa " + a.getEmpresaId(),
                      a.getFechaExpiracion());
                })
            .toList();

    LoginResponse response = new LoginResponse();
    response.setUsername(usuario.getUsername());

    if (opciones.size() == 1) {
      // Auto-selección: único grant activo
      return emitirTokenSoporte(response, usuario.getUsername(), opciones.get(0).getEmpresaId());
    }

    // Múltiples grants: el frontend presenta el selector de empresa
    response.setPreAuthToken(jwtUtil.generatePreAuthToken(usuario.getUsername()));
    response.setRequiresEmpresaSoporteSelection(true);
    response.setEmpresasSoporteDisponibles(opciones);
    return ResponseEntity.ok(response);
  }

  /**
   * Segundo paso del login soporte: el usuario elige la empresa y se emite el JWT.
   *
   * <p>Endpoint público (no requiere JWT activo, solo un preAuthToken válido).
   */
  @PostMapping("/select-empresa-soporte")
  public ResponseEntity<LoginResponse> selectEmpresaSoporte(
      @RequestBody SelectEmpresaSoporteRequest request) {

    // 1. Validar preAuthToken
    String username;
    try {
      io.jsonwebtoken.Claims claims =
          Jwts.parser()
              .setSigningKey(jwtUtil.getSecretKey())
              .parseClaimsJws(request.getPreAuthToken())
              .getBody();
      if (!Boolean.TRUE.equals(claims.get("preAuth", Boolean.class))) {
        return ResponseEntity.status(401).build();
      }
      username = claims.getSubject();
    } catch (JwtException | IllegalArgumentException e) {
      return ResponseEntity.status(401).build();
    }

    // 2. Revalidar que el grant sigue activo (puede haber expirado entre los 5 min del preAuth)
    boolean grantValido =
        accesoSoporteRepository
            .findAccesoActivoByUsernameAndEmpresa(
                username, request.getEmpresaIdDestino(), java.time.LocalDateTime.now())
            .isPresent();

    if (!grantValido) {
      log.warn(
          "Grant soporte inválido o expirado — username={} empresaId={}",
          username,
          request.getEmpresaIdDestino());
      return ResponseEntity.status(403).build();
    }

    LoginResponse response = new LoginResponse();
    response.setUsername(username);
    return emitirTokenSoporte(response, username, request.getEmpresaIdDestino());
  }

  /** Emite el JWT soporte y completa el LoginResponse con los datos de empresa/sucursal. */
  private ResponseEntity<LoginResponse> emitirTokenSoporte(
      LoginResponse response, String username, Integer empresaId) {

    List<SgSucursal> sucursales = sucursalRepository.findByEmpresaId(empresaId);
    if (sucursales.isEmpty()) {
      log.error("Empresa sin sucursales — empresaId={}", empresaId);
      return ResponseEntity.status(500).body(null);
    }
    // Tomar la primera sucursal activa; si todas están inactivas usar la primera de la lista.
    SgSucursal sucursal =
        sucursales.stream()
            .filter(s -> Boolean.TRUE.equals(s.getActivo()))
            .findFirst()
            .orElse(sucursales.get(0));

    SgEmpresa empresa = empresaDao.findById(empresaId).orElse(null);
    String empresaNombre = empresa != null ? empresa.getEmpresa() : "Empresa " + empresaId;

    String token =
        jwtUtil.generateSoporteToken(
            username, empresaId, sucursal.getId(), empresaNombre, sucursal.getNombre());

    response.setToken(token);
    response.setEmpresaId(empresaId);
    response.setSucursalId(sucursal.getId());
    response.setEmpresaNombre(empresaNombre);
    response.setSucursalNombre(sucursal.getNombre());
    response.setEsSoporte(true);
    response.setRequiresEmpresaSoporteSelection(false);
    return ResponseEntity.ok(response);
  }

  // ─────────────────────────────────────────────────────────────────────────

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
    loginAttemptService.clearLockout(usuario.getUsername());
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
    loginAttemptService.clearLockout(username);
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
      response.setEsSoporte(Boolean.TRUE.equals(claims.get("esSoporte", Boolean.class)));
      response.setToken(token);

      return ResponseEntity.ok(response);
    } catch (JwtException | IllegalArgumentException e) {
      return ResponseEntity.status(401).body("Invalid or expired token");
    }
  }

  private String resolverIp(HttpServletRequest request) {
    String xfwd = request.getHeader("X-Forwarded-For");
    if (xfwd != null && !xfwd.isBlank()) {
      return xfwd.split(",")[0].trim();
    }
    return request.getRemoteAddr();
  }
}
