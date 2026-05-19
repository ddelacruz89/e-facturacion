package com.braintech.eFacturador.facturacionelectronica.mapper;

import static com.braintech.eFacturador.util.AppConstants.*;

import com.braintech.eFacturador.enums.IndicadorFacturacion;
import com.braintech.eFacturador.facturacionelectronica.models.*;
import com.braintech.eFacturador.facturacionelectronica.models.subdescuentos.SubDescuento;
import com.braintech.eFacturador.facturacionelectronica.models.subdescuentos.TablaSubDescuento;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidor;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorDetalle;
import com.braintech.eFacturador.jpa.seguridad.SgEmpresa;
import com.braintech.eFacturador.util.LocalDateZone;
import jakarta.annotation.Nonnull;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
@AllArgsConstructor
public abstract class ConvertFacturaMapperAbstract {
  public static final int INDICADOR_AGENTE_RETENCIONO_PERCEPCION = 1;

  // #region Mapeo de Factura 47
  @Named("mapEncabezado47")
  public Encabezado mapEncabezado47(MfFacturaSuplidor mfFacturaSuplidor, SgEmpresa empresa) {
    if (mfFacturaSuplidor == null || empresa == null) return null;

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    String fechaEmision = LocalDateZone.toLocalDate().format(formatter);

    Documento idDoc =
        Documento.builder()
            .tipoeCF("47")
            .encf(mfFacturaSuplidor.getNcf())
            .fechaLimitePago(
                mfFacturaSuplidor.getFechaLimitePago() != null
                    ? mfFacturaSuplidor.getFechaLimitePago().format(formatter)
                    : null)
            .fechaVencimientoSecuencia(
                mfFacturaSuplidor
                    .getFechaValido()
                    .format(DateTimeFormatter.ofPattern("dd-MM-yyyy")))
            .build();

    Emisor emisor =
        Emisor.builder()
            .rncEmisor(empresa.getRnc())
            .razonSocialEmisor(empresa.getRazonSocial())
            //            .sucursal(empresa.getNombre())
            .direccionEmisor(empresa.getDireccion())
            .fechaEmision(fechaEmision)
            .build();

    Comprador comprador =
        mfFacturaSuplidor.getSuplidor() == null
            ? null
            : Comprador.builder()
                .rncComprador(mfFacturaSuplidor.getSuplidor().getRnc())
                .razonSocialComprador(mfFacturaSuplidor.getSuplidor().getRazonSocial())
                .build();

    BigDecimal montoExcento =
        mfFacturaSuplidor.getSubTotal() != null
            ? mfFacturaSuplidor.getSubTotal().setScale(2, RoundingMode.HALF_UP)
            : null;

    Totales totales =
        Totales.builder()
            .montoExento(montoExcento)
            .montoTotal(
                mfFacturaSuplidor
                    .getTotal()
                    .add(
                        mfFacturaSuplidor.getRetencionIsr() != null
                            ? mfFacturaSuplidor
                                .getMontoRetencionIsr()
                                .setScale(2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO))
            .totalISRRetencion(
                mfFacturaSuplidor.getRetencionIsr() != null
                    ? mfFacturaSuplidor.getMontoRetencionIsr().setScale(2, RoundingMode.HALF_UP)
                    : null)
            .totalITBISRetenido(
                mfFacturaSuplidor.getRetencionIsr() != null
                    ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                    : null)
            .build();

    return Encabezado.builder()
        .version("1.0")
        .idDoc(idDoc)
        .emisor(emisor)
        .comprador(comprador)
        .totales(totales)
        .build();
  }

  @Named("mapDetallesItems47")
  public DetallesItems mapDetallesItems47(MfFacturaSuplidor mfFacturaSuplidor) {
    if (mfFacturaSuplidor == null) return DetallesItems.builder().item(List.of()).build();

    List<Item> items = new ArrayList<>();
    mfFacturaSuplidor.getDetalles().stream()
        .filter(x -> x.getEstado().equals("ACT"))
        .forEach(
            detalle -> {
              BigDecimal montoIsrRetenido = detalle.getRetencion();

              Retencion retencion =
                  montoIsrRetenido == null
                      ? null
                      : Retencion.builder()
                          .indicadorAgenteRetencionoPercepcion(
                              INDICADOR_AGENTE_RETENCIONO_PERCEPCION)
                          .montoISRRetenido(montoIsrRetenido.setScale(2, RoundingMode.HALF_UP))
                          .montoITBISRetenido(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                          .build();

              Item item =
                  Item.builder()
                      .numeroLinea(items.size() + 1)
                      .indicadorFacturacion(IndicadorFacturacion.EXENTO.getCode())
                      //                          .numeroCuenta(detalle.getNumeroCuenta())

                      .retencion(retencion)
                      .nombreItem(detalle.getConcepto())
                      .indicadorBienoServicio(detalle.getIndicadorBienServicio() ? 1 : 2)
                      .precioUnitarioItem(
                          detalle.getPrecioUnitario().setScale(4, RoundingMode.HALF_UP))
                      .cantidadItem(BigDecimal.valueOf(detalle.getCantidad()))
                      .montoItem(detalle.getSubTotal())
                      .build();
              items.add(item);
            });

    return DetallesItems.builder().item(items).build();
  }

  // #endregion

  // #region Mapeo de Factura 43
  @Named("mapEncabezado43")
  public Encabezado mapEncabezado43(MfFacturaSuplidor mfFacturaSuplidor, SgEmpresa empresa) {
    if (mfFacturaSuplidor == null || empresa == null) return null;

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    Documento idDoc =
        Documento.builder()
            .tipoeCF("43")
            .encf(mfFacturaSuplidor.getNcf())
            .tipoPago(mfFacturaSuplidor.getTipoPago())
            .fechaVencimientoSecuencia(
                mfFacturaSuplidor
                    .getFechaValido()
                    .format(DateTimeFormatter.ofPattern("dd-MM-yyyy")))
            .build();

    String fechaEmision = LocalDateZone.toLocalDate().format(formatter);

    Emisor emisor =
        Emisor.builder()
            .rncEmisor(empresa.getRnc())
            .razonSocialEmisor(empresa.getRazonSocial())
            //            .sucursal(empresa.getNombre())
            .direccionEmisor(empresa.getDireccion())
            .fechaEmision(fechaEmision)
            .build();

    Totales totales =
        Totales.builder()
            .montoTotal(mfFacturaSuplidor.getTotal())
            .montoExento(mfFacturaSuplidor.getTotal())
            .build();

    return Encabezado.builder().version("1.0").idDoc(idDoc).emisor(emisor).totales(totales).build();
  }

  @Named("mapDetallesItems43")
  public DetallesItems mapDetallesItems43(MfFacturaSuplidor mfFacturaSuplidor) {
    if (mfFacturaSuplidor == null) return DetallesItems.builder().item(List.of()).build();

    List<Item> items = new ArrayList<>();
    for (int i = 0; i < mfFacturaSuplidor.getDetalles().size(); i++) {
      Item item =
          Item.builder()
              .numeroLinea(i + 1)
              .indicadorFacturacion(IndicadorFacturacion.EXENTO.getCode())
              //
              // .numeroCuenta(mfFacturaSuplidor.getDetalles().get(i).getNumeroCuenta())

              .nombreItem(mfFacturaSuplidor.getDetalles().get(i).getConcepto())
              .indicadorBienoServicio(
                  mfFacturaSuplidor.getDetalles().get(i).getIndicadorBienServicio() ? 1 : 2)
              .precioUnitarioItem(
                  mfFacturaSuplidor
                      .getDetalles()
                      .get(i)
                      .getPrecioUnitario()
                      .setScale(4, RoundingMode.HALF_UP))
              .cantidadItem(
                  BigDecimal.valueOf(mfFacturaSuplidor.getDetalles().get(i).getCantidad()))
              .montoItem(mfFacturaSuplidor.getDetalles().get(i).getSubTotal())
              .build();
      items.add(item);
    }

    return DetallesItems.builder().item(items).build();
  }

  // #endregion

  // #region Mapeo de Factura 41
  @Named("mapEncabezado41")
  public Encabezado mapEncabezado41(MfFacturaSuplidor mfFacturaSuplidor, SgEmpresa empresa) {
    if (mfFacturaSuplidor == null || empresa == null) return null;

    SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy");

    String fechaEmision = formatter.format(new Date());

    Documento idDoc =
        Documento.builder()
            .tipoeCF("41")
            .encf(mfFacturaSuplidor.getNcf())
            .fechaLimitePago(
                mfFacturaSuplidor.getFechaPago() != null
                    ? formatter.format(mfFacturaSuplidor.getFechaPago())
                    : null)
            .indicadorMontoGravado(0)
            .fechaVencimientoSecuencia(
                mfFacturaSuplidor
                    .getFechaValido()
                    .format(DateTimeFormatter.ofPattern("dd-MM-yyyy")))
            .tipoPago(mfFacturaSuplidor.getTipoPago())
            .fechaLimitePago(
                mfFacturaSuplidor.getFechaLimitePago() == null
                    ? null
                    : mfFacturaSuplidor
                        .getFechaLimitePago()
                        .format(DateTimeFormatter.ofPattern("dd-MM-yyyy")))
            .build();

    Emisor emisor =
        Emisor.builder()
            .rncEmisor(empresa.getRnc())
            .razonSocialEmisor(empresa.getRazonSocial())
            .direccionEmisor(empresa.getDireccion())
            .fechaEmision(fechaEmision)
            .build();

    // Validar que el suplidor tenga al menos razón social o nombre
    String razonSocial = getRazonSocial(mfFacturaSuplidor);

    Comprador comprador =
        Comprador.builder()
            .rncComprador(mfFacturaSuplidor.getSuplidor().getRnc())
            .razonSocialComprador(razonSocial)
            .build();

    BigDecimal montoGravadoItbisTasa1 =
        calculateMontoGravadoSinItbis(mfFacturaSuplidor.getDetalles(), ITBIS_TASA_1_ID)
            .setScale(2, RoundingMode.HALF_UP);
    BigDecimal montoGravadoItbisTasa2 =
        calculateMontoGravadoSinItbis(mfFacturaSuplidor.getDetalles(), ITBIS_TASA_2_ID)
            .setScale(2, RoundingMode.HALF_UP);
    BigDecimal montoGravadoItbisTasa3 =
        calculateMontoGravadoSinItbis(mfFacturaSuplidor.getDetalles(), ITBIS_TASA_3_ID)
            .setScale(2, RoundingMode.HALF_UP);
    BigDecimal montoExcento =
        calculateMontoGravadoSinItbis(mfFacturaSuplidor.getDetalles(), ITBIS_TASA_4_ID)
            .setScale(2, RoundingMode.HALF_UP);

    BigDecimal itbisTotal1 = calculateTotalItbis(mfFacturaSuplidor.getDetalles(), ITBIS_TASA_1_ID);
    if (itbisTotal1 != null) itbisTotal1 = itbisTotal1.setScale(2, RoundingMode.HALF_UP);
    BigDecimal itbisTotal2 = calculateTotalItbis(mfFacturaSuplidor.getDetalles(), ITBIS_TASA_2_ID);
    if (itbisTotal2 != null) itbisTotal2 = itbisTotal2.setScale(2, RoundingMode.HALF_UP);
    BigDecimal itbisTotal3 = calculateTotalItbis(mfFacturaSuplidor.getDetalles(), ITBIS_TASA_3_ID);
    if (itbisTotal3 != null) itbisTotal3 = itbisTotal3.setScale(2, RoundingMode.HALF_UP);

    BigDecimal montoGravadoTotal =
        montoGravadoItbisTasa1
            .add(montoGravadoItbisTasa2)
            .add(montoGravadoItbisTasa3)
            .setScale(2, RoundingMode.HALF_UP);

    BigDecimal totalItbis =
        Optional.ofNullable(itbisTotal1)
            .orElse(BigDecimal.ZERO)
            .add(Optional.ofNullable(itbisTotal2).orElse(BigDecimal.ZERO))
            .add(Optional.ofNullable(itbisTotal3).orElse(BigDecimal.ZERO))
            .setScale(2, RoundingMode.HALF_UP);

    Totales totales =
        Totales.builder()
            .montoExento(montoExcento.compareTo(BigDecimal.ZERO) == 0 ? null : montoExcento)
            .montoGravadoTotal(montoGravadoTotal)
            .montoGravadoI1(
                montoGravadoItbisTasa1.compareTo(BigDecimal.ZERO) == 0
                    ? null
                    : montoGravadoItbisTasa1)
            .montoGravadoI2(
                montoGravadoItbisTasa2.compareTo(BigDecimal.ZERO) == 0
                    ? null
                    : montoGravadoItbisTasa2)
            .montoGravadoI3(
                montoGravadoItbisTasa3.compareTo(BigDecimal.ZERO) == 0
                    ? null
                    : montoGravadoItbisTasa3)
            .itbis1(montoGravadoItbisTasa1.compareTo(BigDecimal.ZERO) == 0 ? null : ITBIS_TASA_1)
            .itbis2(montoGravadoItbisTasa2.compareTo(BigDecimal.ZERO) == 0 ? null : ITBIS_TASA_2)
            .itbis3(montoGravadoItbisTasa3.compareTo(BigDecimal.ZERO) == 0 ? null : ITBIS_TASA_3)
            .totalITBIS(totalItbis)
            .totalITBIS1(itbisTotal1)
            .totalITBIS2(itbisTotal2)
            .totalITBIS3(itbisTotal3)
            // Restar los descuentos al monto total
            .montoTotal(
                montoGravadoTotal
                    .add(montoExcento)
                    .add(totalItbis)
                    .setScale(2, RoundingMode.HALF_UP))
            .totalITBISRetenido(
                mfFacturaSuplidor.getRetencionItbis() != null
                    ? mfFacturaSuplidor.getMontoRetencionItbis().setScale(2, RoundingMode.HALF_UP)
                    : null)
            .totalISRRetencion(
                mfFacturaSuplidor.getRetencionIsr() != null
                    ? mfFacturaSuplidor.getMontoRetencionIsr().setScale(2, RoundingMode.HALF_UP)
                    : null)
            .build();

    return Encabezado.builder()
        .version("1.0")
        .idDoc(idDoc)
        .emisor(emisor)
        .comprador(comprador)
        .totales(totales)
        .build();
  }

  @Nonnull
  private static String getRazonSocial(MfFacturaSuplidor mfFacturaSuplidor) {
    String razonSocialProv = mfFacturaSuplidor.getSuplidor().getRazonSocial();
    String nombreProv = mfFacturaSuplidor.getSuplidor().getNombre();

    boolean sinRazonSocial = razonSocialProv == null || razonSocialProv.trim().isEmpty();
    boolean sinNombre = nombreProv == null || nombreProv.trim().isEmpty();

    if (sinRazonSocial && sinNombre) {
      throw new IllegalArgumentException(
          "El suplidor no tiene razón social ni nombre (factura NCF: "
              + mfFacturaSuplidor.getNcf()
              + ")");
    }

    String razonSocial = !sinRazonSocial ? razonSocialProv : nombreProv;
    return razonSocial;
  }

  @Named("mapDetallesItems41")
  public DetallesItems mapDetallesItems41(MfFacturaSuplidor mfFacturaSuplidor) {
    if (mfFacturaSuplidor == null) return DetallesItems.builder().item(List.of()).build();

    List<Item> items = new ArrayList<>();
    for (int i = 0; i < mfFacturaSuplidor.getDetalles().size(); i++) {

      BigDecimal montoItbis = mfFacturaSuplidor.getDetalles().get(i).getMontoItbisRetenido();
      BigDecimal montoIsrRetenido = mfFacturaSuplidor.getDetalles().get(i).getRetencion();

      Retencion retencion =
          Retencion.builder()
              .indicadorAgenteRetencionoPercepcion(INDICADOR_AGENTE_RETENCIONO_PERCEPCION)
              .montoISRRetenido(montoIsrRetenido)
              .montoITBISRetenido(montoItbis)
              .build();

      Item item =
          Item.builder()
              .numeroLinea(i + 1)
              //
              // .numeroCuenta(mfFacturaSuplidor.getDetalles().get(i).getNumeroCuenta())
              .indicadorFacturacion(mfFacturaSuplidor.getDetalles().get(i).getItbisObj().getId())
              .retencion(montoIsrRetenido == null && montoItbis == null ? null : retencion)
              .nombreItem(mfFacturaSuplidor.getDetalles().get(i).getConcepto())
              .indicadorBienoServicio(
                  mfFacturaSuplidor.getDetalles().get(i).getIndicadorBienServicio() ? 1 : 2)
              .precioUnitarioItem(
                  mfFacturaSuplidor
                      .getDetalles()
                      .get(i)
                      .getPrecioUnitario()
                      .setScale(4, RoundingMode.HALF_UP))
              .descuentoMonto(
                  mfFacturaSuplidor
                              .getDetalles()
                              .get(i)
                              .getMontoDescuento()
                              .compareTo(BigDecimal.ZERO)
                          != 0
                      ? mfFacturaSuplidor
                          .getDetalles()
                          .get(i)
                          .getMontoDescuento()
                          .setScale(2, RoundingMode.HALF_UP)
                      : null)
              .tablaSubDescuento(buildTableSubDescuentos(mfFacturaSuplidor.getDetalles().get(i)))
              .cantidadItem(
                  BigDecimal.valueOf(mfFacturaSuplidor.getDetalles().get(i).getCantidad()))
              .montoItem(
                  mfFacturaSuplidor
                      .getDetalles()
                      .get(i)
                      .getSubTotal()
                      .subtract(mfFacturaSuplidor.getDetalles().get(i).getMontoDescuento())
                      .setScale(2, RoundingMode.HALF_UP))
              .build();
      items.add(item);
    }

    return DetallesItems.builder().item(items).build();
  }

  // #endregion

  private TablaSubDescuento buildTableSubDescuentos(
      MfFacturaSuplidorDetalle mfFacturaSuplidorDetalle) {
    List<SubDescuento> subDescuentos = new ArrayList<>();

    mfFacturaSuplidorDetalle
        .getDescuentos()
        .forEach(
            x -> {
              SubDescuento subDescuento =
                  SubDescuento.builder()
                      .tipoSubDescuento(x.getTipo())
                      .subDescuentoPorcentaje(x.getValor())
                      .montoSubDescuento(x.getMonto())
                      .build();
              subDescuentos.add(subDescuento);
            });
    if (subDescuentos.isEmpty()) return null;
    return TablaSubDescuento.builder().subDescuento(subDescuentos).build();
  }

  private BigDecimal calculateMontoGravadoSinItbis(
      List<MfFacturaSuplidorDetalle> detalles, Integer itbisTasaId) {

    return detalles.stream()
        .filter(
            x -> x.getItbisObj().getId().compareTo(itbisTasaId) == 0 && x.getEstado().equals("ACT"))
        .map(
            x -> {
              BigDecimal subtotal = x.getSubTotal() != null ? x.getSubTotal() : BigDecimal.ZERO;
              BigDecimal descuento =
                  x.getMontoDescuento() != null ? x.getMontoDescuento() : BigDecimal.ZERO;
              return subtotal.subtract(descuento);
            })
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private BigDecimal calculateTotalItbis(
      List<MfFacturaSuplidorDetalle> detalles, Integer itbisTasaId) {
    boolean exists =
        detalles.stream()
            .anyMatch(
                x ->
                    x.getItbisObj().getId().compareTo(itbisTasaId) == 0
                        && x.getEstado().equals("ACT"));
    if (!exists) {
      return null;
    }
    return detalles.stream()
        .filter(
            x -> x.getItbisObj().getId().compareTo(itbisTasaId) == 0 && x.getEstado().equals("ACT"))
        .map(MfFacturaSuplidorDetalle::getItbis)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }
}
