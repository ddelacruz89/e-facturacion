package com.braintech.eFacturador.dao.seguridad;

import com.braintech.eFacturador.jpa.seguridad.SgModulo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModuloDao extends JpaRepository<SgModulo, String> {}
