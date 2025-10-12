package com.braintech.eFacturador.services.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgUsuarioRepository;
import com.braintech.eFacturador.interfaces.seguridad.SgUsuarioService;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class SgUsuarioServiceImpl implements SgUsuarioService {
  @Autowired private SgUsuarioRepository usuarioRepository;
  @Autowired private PasswordEncoder passwordEncoder;

  @Override
  public SgUsuario save(SgUsuario usuario) {
    if (usuario.getPassword() != null) {
      usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
    }
    return usuarioRepository.save(usuario);
  }
}
