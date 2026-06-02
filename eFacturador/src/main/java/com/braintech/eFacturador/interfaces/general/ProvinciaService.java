package com.braintech.eFacturador.interfaces.general;

import com.braintech.eFacturador.jpa.general.MgProvincia;
import com.braintech.eFacturador.models.Response;
import java.util.List;

public interface ProvinciaService {
  Response<List<MgProvincia>> getAll();
}
