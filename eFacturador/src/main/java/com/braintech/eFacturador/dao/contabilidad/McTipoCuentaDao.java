package com.braintech.eFacturador.dao.contabilidad;

import com.braintech.eFacturador.jpa.contabilidad.McTipoCuenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface McTipoCuentaDao extends JpaRepository<McTipoCuenta, Integer> {}
