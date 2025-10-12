package com.braintech.eFacturador.seguridad;

import com.braintech.eFacturador.dao.seguridad.SgUsuarioRepository;
import com.braintech.eFacturador.jpa.seguridad.SgUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
  @Autowired private SgUsuarioRepository usuarioRepository;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    SgUsuario usuario = usuarioRepository.findByLoginEmailOrUsernameV1(username);
    if (usuario == null) {
      throw new UsernameNotFoundException("Usuario no encontrado");
    }
    return User.withUsername(usuario.getUsername())
        .password(usuario.getPassword())
        .authorities("USER")
        .build();
  }
}
