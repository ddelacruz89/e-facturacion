package com.braintech.eFacturador.facturacionelectronica.mapper;

import com.braintech.eFacturador.facturacionelectronica.models.ECF;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidor;
import com.braintech.eFacturador.jpa.seguridad.SgEmpresa;
import jakarta.annotation.Nonnull;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = ConvertFacturaMapperAbstract.class)
public interface ConvertFacturaMapper {

  @BeanMapping(ignoreByDefault = true)
  @Mapping(
      target = "encabezado",
      expression = "java(convertFacturaMapperAbstract.mapEncabezado41(mfFacturaSuplidor, empresa))")
  @Mapping(
      target = "detallesItems",
      source = "mfFacturaSuplidor",
      qualifiedByName = "mapDetallesItems41")
  ECF mapFactura41(@Nonnull MfFacturaSuplidor mfFacturaSuplidor, SgEmpresa empresa);

  @BeanMapping(ignoreByDefault = true)
  @Mapping(
      target = "encabezado",
      expression = "java(convertFacturaMapperAbstract.mapEncabezado43(mfFacturaSuplidor, empresa))")
  @Mapping(
      target = "detallesItems",
      source = "mfFacturaSuplidor",
      qualifiedByName = "mapDetallesItems43")
  ECF mapFactura43(@Nonnull MfFacturaSuplidor mfFacturaSuplidor, SgEmpresa empresa);

  @BeanMapping(ignoreByDefault = true)
  @Mapping(
      target = "encabezado",
      expression = "java(convertFacturaMapperAbstract.mapEncabezado47(mfFacturaSuplidor, empresa))")
  @Mapping(
      target = "detallesItems",
      source = "mfFacturaSuplidor",
      qualifiedByName = "mapDetallesItems47")
  ECF mapFactura47(@Nonnull MfFacturaSuplidor mfFacturaSuplidor, SgEmpresa empresa);
}
