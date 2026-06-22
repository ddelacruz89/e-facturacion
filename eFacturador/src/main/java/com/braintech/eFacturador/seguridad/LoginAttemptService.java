package com.braintech.eFacturador.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgLoginIntentoRepository;
import com.braintech.eFacturador.dao.seguridad.SgUsuarioRepository;
import com.braintech.eFacturador.jpa.seguridad.SgLoginIntento;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Control distribuido de intentos fallidos de login.
 *
 * <p>Estado persistido en BD para funcionar correctamente con múltiples instancias: -
 * sg_login_intento: historial completo de intentos (auditoría) - sg_usuario.login_locked_until /
 * login_escalated: estado activo de bloqueo
 *
 * <p>Reglas: - 5 fallos (CONTRASENA_INCORRECTA) en ventana de 2 min → bloqueo 5 min - Bloqueos
 * posteriores al primero → 1 hora cada uno - clearLockout() al resetear contraseña libera el
 * bloqueo
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class LoginAttemptService {

  private static final int MAX_ATTEMPTS = 5;
  private static final long WINDOW_MINUTES = 2;
  private static final long FIRST_LOCKOUT_MINUTES = 5;
  private static final long ESCALATED_LOCKOUT_HOURS = 1;

  public static final String MOTIVO_CONTRASENA = "CONTRASENA_INCORRECTA";
  public static final String MOTIVO_BLOQUEADO = "USUARIO_BLOQUEADO";
  public static final String MOTIVO_NO_EXISTE = "USUARIO_NO_EXISTE";
  public static final String MOTIVO_IP_NO_AUTORIZADA = "IP_NO_AUTORIZADA";

  private final SgUsuarioRepository usuarioRepository;
  private final SgLoginIntentoRepository intentoRepository;

  /** Chequeo rápido de bloqueo activo — lectura simple sin lock. */
  public Optional<LocalDateTime> getLockedUntil(String username) {
    SgUsuario u = usuarioRepository.findByUsername(username);
    if (u == null || u.getLoginLockedUntil() == null) return Optional.empty();
    if (u.getLoginLockedUntil().isAfter(LocalDateTime.now())) {
      return Optional.of(u.getLoginLockedUntil());
    }
    return Optional.empty();
  }

  /**
   * Registra el intento (siempre) y, si el motivo es CONTRASENA_INCORRECTA, evalúa si se debe
   * aplicar un bloqueo.
   */
  @Transactional
  public void registrarIntento(String username, String ip, boolean exitoso, String motivo) {
    intentoRepository.save(new SgLoginIntento(username, ip, exitoso, motivo));

    if (MOTIVO_CONTRASENA.equals(motivo)) {
      evaluarBloqueo(username);
    }
  }

  /** Elimina el bloqueo activo (llamar al resetear contraseña). */
  @Transactional
  public void clearLockout(String username) {
    SgUsuario u = usuarioRepository.findByUsername(username);
    if (u == null) return;
    u.setLoginLockedUntil(null);
    u.setLoginEscalated(false);
    usuarioRepository.save(u);
    log.info("[Seguridad] Bloqueo eliminado — username={}", username);
  }

  public long minutosRestantes(LocalDateTime lockedUntil) {
    return Math.max(1, Duration.between(LocalDateTime.now(), lockedUntil).toMinutes() + 1);
  }

  /**
   * SELECT FOR UPDATE sobre sg_usuario + COUNT de fallos recientes en sg_login_intento. El flush
   * automático de Hibernate garantiza que el intento recién insertado esté visible en el COUNT
   * dentro de la misma transacción.
   */
  private void evaluarBloqueo(String username) {
    SgUsuario u = usuarioRepository.findByUsernameForUpdate(username).orElse(null);
    if (u == null) return;

    LocalDateTime now = LocalDateTime.now();
    // Si ya está bloqueado (otra instancia lo bloqueó antes), no re-evaluar
    if (u.getLoginLockedUntil() != null && u.getLoginLockedUntil().isAfter(now)) return;

    long fallos =
        intentoRepository.countFallosRecientes(username, now.minusMinutes(WINDOW_MINUTES));

    if (fallos >= MAX_ATTEMPTS) {
      u.setLoginLockedUntil(
          Boolean.TRUE.equals(u.getLoginEscalated())
              ? now.plusHours(ESCALATED_LOCKOUT_HOURS)
              : now.plusMinutes(FIRST_LOCKOUT_MINUTES));
      u.setLoginEscalated(true);
      usuarioRepository.save(u);
      log.warn(
          "[Seguridad] Usuario bloqueado por {} fallos en {}min — username={} hasta={}",
          fallos,
          WINDOW_MINUTES,
          username,
          u.getLoginLockedUntil());
    }
  }
}
