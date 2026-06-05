package com.braintech.eFacturador.facturacionelectronica.services;

import com.braintech.eFacturador.facturacionelectronica.models.FacturaValidateResponse;
import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidor;

public interface IECF {
  //  ECFSecuencia getECF(String tipo);

  FacturaValidateResponse senderEcfFactura(MfFactura factura);

  void senderEcfTerceros(MfFacturaSuplidor facturaSuplidor, Boolean override);
  //
  //
  //  ECF senderEcfNotas(NotaEcf nota);
  //
  //  ECF senderEcfTerceros(TblFacturaSuplidorInformal facturaSuplidor, Boolean overrideFile );
}
