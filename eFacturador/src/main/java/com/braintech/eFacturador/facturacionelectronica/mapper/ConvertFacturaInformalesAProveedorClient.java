// package com.braintech.eFacturador.facturacionelectronica.mapper;
//
// import com.braintech.sigmfe.facturacionelectronica.models.ECF;
// import com.braintech.sigmfe.jpa.TblProveedoresInformales;
// import java.math.BigDecimal;
// import java.time.LocalDate;
// import lombok.experimental.UtilityClass;
//
// @UtilityClass
// public class ConvertFacturaInformalesAProveedorClient {
//
//  public static TblProveedoresInformales build(ECF ecf) {
//    TblProveedoresInformales factura = new TblProveedoresInformales();
//    factura.setSNombreProveedor("Dummy Nombre");
//    factura.setINumeroDGII(1);
//    factura.setSItemProveedor(1);
//    factura.setSDescripcionProveedor("Dummy Descripcion");
//    factura.setSPrecioUnitario(BigDecimal.ONE);
//    factura.setSTipoMonto((short) 1);
//    factura.setSITBISProveedor(BigDecimal.ZERO);
//    factura.setSITBISRetenido(BigDecimal.ZERO);
//    factura.setSITBISProporcional(BigDecimal.ZERO);
//    factura.setSITBISCosto(BigDecimal.ZERO);
//    factura.setSITBISAdelantado(BigDecimal.ZERO);
//    factura.setSITBISCompra(BigDecimal.ZERO);
//    factura.setSRetencionRenta(BigDecimal.ZERO);
//    factura.setSISRCompras(BigDecimal.ZERO);
//    factura.setSPropinaProveedor(BigDecimal.ZERO);
//    factura.setSOtrosProveedor(BigDecimal.ZERO);
//    factura.setSEstatusProveedor((short) 1);
//    factura.setSCedulaProveedor("Dummy Cedula");
//    factura.setSTelefonoProveedor("Dummy Telefono");
//    return factura;
//  }
//
//  public static int buildPeriodoCosto(LocalDate fecha) {
//    int year = fecha.getYear();
//    int month = fecha.getMonth().getValue();
//    return Integer.parseInt(String.format("%d%02d", year, month));
//  }
//
//  /**
//   * Determina el tipo de identificación basado en el RNC/Cédula del comprador
//   *
//   * @param rncComprador El RNC o Cédula del comprador
//   * @return 1 para RNC, 2 para Cédula, 3 para Pasaporte
//   */
//  public static Short determinaTipoId(String rncComprador) {
//    if (rncComprador == null || rncComprador.trim().isEmpty()) {
//      return 2; // Por defecto Cédula
//    }
//
//    // Remover guiones y espacios para analizar
//    String identificacion = rncComprador.replaceAll("[\\s-]", "");
//
//    // RNC: 9 dígitos numéricos
//    if (identificacion.matches("^\\d{9}$")) {
//      return 1; // RNC
//    }
//
//    // Cédula: 11 dígitos numéricos (con o sin guiones)
//    if (identificacion.matches("^\\d{11}$")) {
//      return 2; // Cédula
//    }
//
//    // Si contiene letras o formato no estándar, se asume Pasaporte
//    if (identificacion.matches(".*[a-zA-Z].*")
//        || (!identificacion.matches("^\\d{9}$") && !identificacion.matches("^\\d{11}$"))) {
//      return 3; // Pasaporte
//    }
//
//    // Por defecto retornar Cédula
//    return 2;
//  }
// }
