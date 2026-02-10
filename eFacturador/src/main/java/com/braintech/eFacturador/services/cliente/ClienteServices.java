package com.braintech.eFacturador.services.cliente;

import com.braintech.eFacturador.dao.general.ClienteDao;
import com.braintech.eFacturador.dao.general.SecuenciasDao;
import com.braintech.eFacturador.jpa.general.MgCliente;
import com.braintech.eFacturador.models.PagesResult;
import com.braintech.eFacturador.util.PageableUtils;
import com.braintech.eFacturador.util.TenantContext;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClienteServices implements ICliente {
  final ClienteDao clienteDao;
  final SecuenciasDao secuenciasDao;
  private final TenantContext tenantContext;

  @Override
  public Optional<MgCliente> getById(Integer id) {
    return Optional.empty();
  }

  @Override
  public MgCliente create(MgCliente entity) {

    if (entity.getSecuencia() == null || entity.getSecuencia().equals(0)) {
      Integer empresaId = tenantContext.getCurrentEmpresaId();
      int nextSecuencia =
          secuenciasDao.getNextSecuencia(
              empresaId, MgCliente.class.getSimpleName().toUpperCase(Locale.ROOT));
      entity.setId(null);
      entity.setEmpresaId(empresaId);
      entity.setSecuencia(nextSecuencia);
    }
    clienteDao.save(entity);
    return entity;
  }

  @Override
  public MgCliente update(Integer id, MgCliente entity) {
    return null;
  }

  @Override
  public PagesResult<List<MgCliente>> getClientes(Integer page, Integer size) {
    Integer empresaId = tenantContext.getCurrentEmpresaId();
    Pageable pageable = PageRequest.of(page, size);
    Page<MgCliente> clientes = clienteDao.findAll(pageable, empresaId);
    PagesResult<List<MgCliente>> list = PageableUtils.getPagesResult(clientes);
    return list;
  }
}
