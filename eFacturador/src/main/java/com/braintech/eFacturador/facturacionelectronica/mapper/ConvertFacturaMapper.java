// package com.braintech.eFacturador.facturacionelectronica.mapper;
//
//
//
// import com.braintech.eFacturador.facturacionelectronica.models.ECF;
// import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidor;
// import org.mapstruct.BeanMapping;
// import org.mapstruct.Mapper;
// import org.mapstruct.Mapping;
//
// @Mapper(componentModel = "spring",uses = ConvertFacturaMapperAbstract.class)
// public interface ConvertFacturaMapper {
//
//  @BeanMapping(ignoreByDefault = true)
//  @Mapping(
//      target = "encabezado",
//      expression = "java(convertFacturaMapperAbstract.mapEncabezado41(mfFacturaSuplidor,
// empresa))")
//  @Mapping(
//      target = "detallesItems",
//      source = "mfFacturaSuplidor",
//      qualifiedByName = "mapDetallesItems41")
//  ECF mapFactura41(MfFacturaSuplidor mfFacturaSuplidor, InformacionSistema empresa);
//
//
//  @BeanMapping(ignoreByDefault = true)
//  @Mapping(
//      target = "encabezado",
//      expression = "java(convertFacturaMapperAbstract.mapEncabezado43(mfFacturaSuplidor,
// empresa))")
//  @Mapping(
//      target = "detallesItems",
//      source = "mfFacturaSuplidor",
//      qualifiedByName = "mapDetallesItems43")
//  ECF mapFactura43(MfFacturaSuplidor mfFacturaSuplidor, InformacionSistema empresa);
//
//
//  @BeanMapping(ignoreByDefault = true)
//  @Mapping(
//      target = "encabezado",
//      expression = "java(convertFacturaMapperAbstract.mapEncabezado47(mfFacturaSuplidor,
// empresa))")
//  @Mapping(
//      target = "detallesItems",
//      source = "mfFacturaSuplidor",
//      qualifiedByName = "mapDetallesItems47")
//  ECF mapFactura47(MfFacturaSuplidor mfFacturaSuplidor, InformacionSistema empresa);
//
//
// }
