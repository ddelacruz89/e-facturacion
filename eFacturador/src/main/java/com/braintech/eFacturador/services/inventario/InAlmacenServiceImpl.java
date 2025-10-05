package com.braintech.eFacturador.services.inventario;

import com.braintech.eFacturador.dao.inventario.InAlmacenDao;
import com.braintech.eFacturador.interfaces.inventario.InAlmacenService;
import com.braintech.eFacturador.jpa.inventario.InAlmacen;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InAlmacenServiceImpl implements InAlmacenService {
  @Autowired private InAlmacenDao inAlmacenDao;

  @Override
  @Transactional
  public InAlmacen save(InAlmacen almacen) {
    return inAlmacenDao.save(almacen);
  }

  @Override
  public InAlmacen findById(Integer id) {
    Optional<InAlmacen> almacenOpt = inAlmacenDao.findById(id);
    return almacenOpt.orElse(null);
  }

  @Override
  public List<InAlmacen> findAll() {
    Iterable<InAlmacen> iterable = inAlmacenDao.findAll();
    return StreamSupport.stream(iterable.spliterator(), false).collect(Collectors.toList());
  }

  @Override
  @Transactional
  public void deleteById(Integer id) {
    inAlmacenDao.deleteById(id);
  }
}
