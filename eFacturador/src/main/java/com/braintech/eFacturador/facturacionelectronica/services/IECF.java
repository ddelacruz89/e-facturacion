package com.braintech.eFacturador.facturacionelectronica.services;

import com.braintech.eFacturador.jpa.facturacion.MfFactura;

public interface IECF {
  //  ECFSecuencia getECF(String tipo);

  void senderEcfFactura(MfFactura factura);

  //  ECF senderEcfTerceros(MfFacturaSuplidor facturaSuplidor);
  //
  //
  //  ECF senderEcfNotas(NotaEcf nota);
  //
  //  ECF senderEcfTerceros(TblFacturaSuplidorInformal facturaSuplidor, Boolean overrideFile );
}
