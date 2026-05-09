package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InMovimientoTipoRepository;
import com.braintech.eFacturador.interfaces.inventario.InMovimientoTipoService;
import com.braintech.eFacturador.jpa.inventario.InMovimientoTipo;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InMovimientoTipoServiceImpl implements InMovimientoTipoService {

  private final InMovimientoTipoRepository tipoRepository;

  @Override
  public List<InMovimientoTipo> findAll() {
    return tipoRepository.findAll().stream()
        .sorted(
            Comparator.comparing(
                InMovimientoTipo::getTipoMovimiento,
                Comparator.nullsLast(Comparator.naturalOrder())))
        .toList();
  }

  @Override
  public List<InMovimientoTipo> findByCr(Boolean cr) {
    return tipoRepository.findByCrOrderByTipoMovimientoAsc(cr);
  }

  @Override
  public List<InMovimientoTipo> findByModulo(String modulo) {
    return tipoRepository.findByModulo(modulo);
  }
}
