package com.braintech.eFacturador.services.general;

import com.braintech.eFacturador.jpa.general.MgRetencion;
import com.braintech.eFacturador.models.Response;
import java.util.List;

public interface ITipoRetenciones {

  Response<List<MgRetencion>> getAllActive();

  Response<MgRetencion> createRetencion(MgRetencion retencion);
}
