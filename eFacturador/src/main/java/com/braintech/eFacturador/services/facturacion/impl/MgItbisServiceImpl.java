package com.braintech.eFacturador.services.facturacion.impl;

import com.braintech.eFacturador.dao.facturacion.MgItbisRepository;
import com.braintech.eFacturador.jpa.general.MgItbis;
import com.braintech.eFacturador.services.facturacion.MgItbisService;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class MgItbisServiceImpl implements MgItbisService {

  private final MgItbisRepository mgItbisRepository;

  @Override
  public List<MgItbis> getAllActive() {
    return mgItbisRepository.findAllActive();
  }
}
