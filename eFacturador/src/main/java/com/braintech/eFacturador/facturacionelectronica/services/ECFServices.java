package com.braintech.eFacturador.facturacionelectronica.services;

import static com.braintech.eFacturador.util.AppConstants.*;

import com.braintech.eFacturador.dao.facturacion.FacturaDao;
import com.braintech.eFacturador.exceptions.AuthenticationException;
import com.braintech.eFacturador.facturacionelectronica.models.*;
import com.braintech.eFacturador.facturacionelectronica.models.subdescuentos.SubDescuento;
import com.braintech.eFacturador.facturacionelectronica.models.subdescuentos.TablaSubDescuento;
import com.braintech.eFacturador.jpa.facturacion.MfFactura;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaDetalle;
import com.braintech.eFacturador.jpa.producto.ProductoResumen;
import com.braintech.eFacturador.jpa.seguridad.SgEmpresa;
import com.braintech.eFacturador.services.producto.impl.MgProductoServiceImpl;
import com.braintech.eFacturador.services.seguridad.EmpresaServices;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
@RequiredArgsConstructor
public class ECFServices implements IECF {
  public static final String NO_ENVIAR_FACTURA_ELECTRONICA_DGII_CONFIG_MISSING_OR_STATUS_FALSE =
      "No Enviar Factura Electronica: DGII config missing or status false";
  private final EmpresaServices empresaServices;
  private final FacturaDao facturaDao;
  private final MgProductoServiceImpl productoService;

  @Value("${dgii.api.url}")
  private String DGII_URL;

  DateTimeFormatter formatDate = DateTimeFormatter.ofPattern("dd-MM-yyyy");

  //    @Override
  //    public ECF senderEcfNotas(NotaEcf nota) {
  //        TenantConfigurationProperties.DgiiConfig dgiiConfig = getCurrentTenantDgiiConfig();
  //        if (dgiiConfig == null || dgiiConfig.getStatus() == null || !dgiiConfig.getStatus()) {
  //            log.warn("No Enviar Nota Electronica: DGII config missing or status false");
  //            return ECF.builder().build();
  //        }
  //        log.warn("Enviar Nota Electronica");
  //        Optional<InformacionSistema> oEmpresa = empresaDao.findById(1);
  //
  //        BigDecimal tasaReferencia = nota.getTasaReferencia();
  //
  //        Map<Integer, DoubleSummaryStatistics> montoItbis =
  //                nota.getDetalles().stream()
  //                        .collect(
  //                                Collectors.groupingBy(
  //                                        NotasClientesDetalle::getItbisId,
  //                                        Collectors.summarizingDouble(detalle ->
  // detalle.getItbis().multiply(tasaReferencia).doubleValue())));
  //        Map<Integer, DoubleSummaryStatistics> montoGrabado =
  //                nota.getDetalles().stream()
  //                        .collect(
  //                                Collectors.groupingBy(
  //                                        NotasClientesDetalle::getItbisId,
  //                                        Collectors.summarizingDouble(detalle ->
  // detalle.getMonto().multiply(tasaReferencia).doubleValue())));
  //
  //        BigDecimal montoItbis1 =
  //                montoItbis.get(1) != null
  //                        ? BigDecimal.valueOf(montoItbis.get(1).getSum()).setScale(2,
  // RoundingMode.HALF_UP)
  //                        : null;
  //        BigDecimal montoItbis2 =
  //                montoItbis.get(2) != null
  //                        ? BigDecimal.valueOf(montoItbis.get(2).getSum()).setScale(2,
  // RoundingMode.HALF_UP)
  //                        : null;
  //        BigDecimal montoItbis3 =
  //                montoItbis.get(3) != null
  //                        ? BigDecimal.valueOf(montoItbis.get(3).getSum()).setScale(2,
  // RoundingMode.HALF_UP)
  //                        : null;
  //        BigDecimal montoNoFacturable =
  //                montoGrabado.get(0) != null
  //                        ? BigDecimal.valueOf(montoGrabado.get(0).getSum()).setScale(2,
  // RoundingMode.HALF_UP)
  //                        : null;
  //
  //        BigDecimal montoGravado1 =
  //                montoGrabado.get(1) != null
  //                        ? BigDecimal.valueOf(montoGrabado.get(1).getSum()).setScale(2,
  // RoundingMode.HALF_UP)
  //                        : null;
  //        BigDecimal montoGravado2 =
  //                montoGrabado.get(2) != null
  //                        ? BigDecimal.valueOf(montoGrabado.get(2).getSum()).setScale(2,
  // RoundingMode.HALF_UP)
  //                        : null;
  //        BigDecimal montoGravado3 =
  //                montoGrabado.get(3) != null
  //                        ? BigDecimal.valueOf(montoGrabado.get(3).getSum()).setScale(2,
  // RoundingMode.HALF_UP)
  //                        : null;
  //        BigDecimal montoExento =
  //                montoGrabado.get(4) != null
  //                        ? BigDecimal.valueOf(montoGrabado.get(4).getSum()).setScale(2,
  // RoundingMode.HALF_UP)
  //                        : null;
  //
  //        DoubleSummaryStatistics sumTotalItbis =
  //                nota.getDetalles().stream()
  //                        .collect(Collectors.summarizingDouble(detalle ->
  // detalle.getItbis().multiply(tasaReferencia).doubleValue()));
  //        DoubleSummaryStatistics sumMonto =
  //                nota.getDetalles().stream()
  //                        .collect(Collectors.summarizingDouble(detalle ->
  // detalle.getMonto().multiply(tasaReferencia).doubleValue()));
  //        DoubleSummaryStatistics sumMontoTotal =
  //                nota.getDetalles().stream()
  //                        .collect(Collectors.summarizingDouble(detalle ->
  // detalle.getTotal().multiply(tasaReferencia).doubleValue()));
  //
  //        Optional<Factura> oFactura = facturasDao.findById(nota.getReferenciaFactura());
  //
  //
  //        if (oEmpresa.isPresent() && oFactura.isPresent()) {
  //
  //            InformacionSistema empresas = oEmpresa.get();
  //            Factura factura = oFactura.get();
  //
  //
  //            Integer indicadorNotaCredito = null;
  //            Integer indicadorMontoGravado = 0;
  //            String fechaValido = nota.getFechaValido();
  //            if (nota.getTipoComprobante().equals(34)) {
  //                long daysBetween =
  //                        ChronoUnit.DAYS.between(factura.getFechaFactura().toLocalDate(),
  // LocalDateZone.toLocalDate());
  //                indicadorNotaCredito = daysBetween > 30 ? 1 : 0;
  //                fechaValido = null;
  //            }
  //
  //
  //            Documento documento =
  //                    Documento.builder()
  //                            .tipoeCF(nota.getTipoComprobante().toString())
  //                            .fechaVencimientoSecuencia(fechaValido)
  //                            .indicadorMontoGravado(indicadorMontoGravado)
  //                            .indicadorNotaCredito(indicadorNotaCredito)
  //                            .encf(nota.getNcfNota())
  //                            .tipoIngresos("01")
  //                            .tipoPago(1)
  //                            .build();
  //
  //            Emisor emisor =
  //                    Emisor.builder()
  //                            .rncEmisor(empresas.getRncEmpresa().replace("-", ""))
  //                            .razonSocialEmisor(empresas.getNombreEmpresa())
  //                            .direccionEmisor(empresas.getDireccionEmpresa())
  //                            .fechaEmision(formatDate.format(LocalDateZone.toLocalDate()))
  //                            .build();
  //            Comprador comprador;
  //
  //            if (isBlackOrNull(factura.getRncClienteF()) ||
  // isBlackOrNull(factura.getClienteContado())) {
  //                comprador = null;
  //                if (factura.getIdCliente() > 0) {
  //                    Optional<Cliente> oCliente =
  // clienteDao.findByIdCliente(factura.getIdCliente());
  //                    if (oCliente.isPresent()) {
  //                        Cliente cliente = oCliente.get();
  //                        comprador =
  //                                Comprador.builder()
  //                                        .rncComprador(cliente.getRncCliente().replace("-", ""))
  //                                        .razonSocialComprador(cliente.getNombreCliente())
  //                                        .build();
  //                    } else {
  //                        comprador = null;
  //                    }
  //                }
  //            } else {
  //                comprador =
  //                        Comprador.builder()
  //                                .rncComprador(factura.getRncClienteF().replace("-", ""))
  //                                .razonSocialComprador(factura.getClienteContado())
  //                                .build();
  //            }
  //
  //            List<Item> items =
  //                    nota.getDetalles().stream()
  //                            .map(
  //                                    detalle -> {
  //                                        Retencion retencion = null;
  //
  //                                        //                                        if
  //                                        // (detalle.getMontoRetencion().doubleValue() > 0
  //                                        //                                                ||
  //                                        // detalle.getMontoRetencionIsr().doubleValue() > 0) {
  //                                        //                                            retencion
  // =
  //                                        //
  // Retencion.builder()
  //                                        //
  //                                        // .montoITBISRetenido(
  //                                        //
  //                                        // detalle.getMontoRetencion().setScale(2,
  // RoundingMode.HALF_UP))
  //                                        //
  //      .montoISRRetenido(
  //                                        //
  //                                        // detalle.getMontoRetencionIsr().setScale(2,
  // RoundingMode.HALF_UP))
  //                                        //
  //                                        // .indicadorAgenteRetencionoPercepcion(1)
  //                                        //
  //      .build();
  //                                        //                                        }
  //
  //                                        return Item.builder()
  //                                                .numeroLinea(detalle.getItemNotaC())
  //                                                .nombreItem(detalle.getProducto())
  //
  // .indicadorBienoServicio(detalle.getReferenciaArticulo() > 0 ? 1 : 2)
  //
  // .cantidadItem(detalle.getCantidadVenta().setScale(2, RoundingMode.HALF_UP))
  //
  // .precioUnitarioItem(detalle.getValorNotaC().multiply(tasaReferencia).setScale(4,
  // RoundingMode.HALF_UP))
  //
  // .montoItem(detalle.getMonto().multiply(tasaReferencia).setScale(2, RoundingMode.HALF_UP))
  //                                                .indicadorFacturacion(detalle.getItbisId())
  //                                                .retencion(retencion)
  //                                                .build();
  //                                    })
  //                            .toList();
  //
  //            List<DescuentoORecargo> descuentoORecargos = new ArrayList<>();
  //            //                    nota.getDetalles().stream()
  //            //                            .filter(detalle ->
  // detalle.getMontoDescuento().doubleValue() >
  //            // 0)
  //            //                            .map(
  //            //                                    detalle ->
  //            //                                            DescuentoORecargo.builder()
  //            //
  //            // .numeroLinea(detalle.getDetalleId().getLinea())
  //            //                                                    .tipoAjuste(TipoAjusteType.D)
  //            //
  //            // .descripcionDescuentooRecargo("Descuento")
  //            //                                                    .tipoValor("$")
  //            //                                                    .montoDescuentooRecargo(
  //            //
  //            // detalle.getMontoDescuento().setScale(2, RoundingMode.HALF_UP))
  //            //
  //            // .indicadorFacturacionDescuentooRecargo(detalle.getItbisId())
  //            //                                                    .build())
  //            //                            .toList();
  //            DescuentosORecargos descuentosORecargos = null;
  //            if (!descuentoORecargos.isEmpty()) {
  //                descuentosORecargos =
  //
  // DescuentosORecargos.builder().descuentoORecargo(descuentoORecargos).build();
  //            }
  //            BigDecimal totalITBIS =
  //                    BigDecimal.valueOf(sumTotalItbis.getSum()).setScale(2,
  // RoundingMode.HALF_UP);
  //            if (totalITBIS.doubleValue() <= 0) {
  //                totalITBIS = montoItbis3;
  //            }
  //            BigDecimal montoGravadoTotal =
  //                    BigDecimal.valueOf(sumMonto.getSum())
  //                            //                            .subtract(nota.getMontoDescuento())
  //                            .setScale(2, RoundingMode.HALF_UP);
  //
  //            if ((totalITBIS == null)) {
  //                montoGravadoTotal = null;
  //            }
  //
  //            BigDecimal montoItbisTotal =
  //                    isNullCero(montoItbis1)
  //                            .add(isNullCero(montoItbis2))
  //                            .add(isNullCero(montoItbis3)).setScale(2, RoundingMode.HALF_UP);
  //
  //            BigDecimal montoTotal = isNullCero(montoGravado1)
  //                    .add(isNullCero(montoGravado2))
  //                    .add(isNullCero(montoGravado3))
  //                    .add(isNullCero(montoExento))
  //                    .add(montoItbisTotal).setScale(2, RoundingMode.HALF_UP);
  //
  //            if (isCeroNull(montoItbisTotal)) montoItbisTotal = null;
  //
  //            if (isCeroNull(montoTotal)) montoTotal = null;
  //            Totales totales =
  //                    Totales.builder()
  //                            .montoTotal(montoTotal)
  //                            .itbis1(montoItbis1 != null ? 18 : null)
  //                            .itbis2(montoItbis2 != null ? 16 : null)
  //                            .itbis3(montoItbis3 != null ? 0 : null)
  //                            .totalITBIS1(montoItbis1)
  //                            .totalITBIS2(montoItbis2)
  //                            .totalITBIS3(montoItbis3)
  //                            .totalITBIS(montoItbisTotal)
  //                            .montoGravadoI1(montoGravado1)
  //                            .montoGravadoI2(montoGravado2)
  //                            .montoGravadoI3(montoGravado3)
  //                            .montoGravadoTotal(montoGravadoTotal)
  //                            .montoNoFacturable(montoNoFacturable)
  //                            .montoExento(montoExento)
  //                            //
  // factura.getMonto().subtract(factura.getMontoDescuento()).setScale(2)
  //                            .totalITBISRetenido(null) // Validar Retencion
  //                            //              .totalISRRetencion(BigDecimal.ZERO.setScale(2,
  // RoundingMode.HALF_UP))
  //                            .totalISRRetencion(null)
  //                            .build();
  //
  //            InformacionReferencia informacionReferencia =
  //                    InformacionReferencia.builder()
  //                            .ncfModificado(factura.getNcfFactura())
  //                            .fechaNCFModificado(factura.getFechaFactura().format(formatDate))
  //                            .codigoModificacion(nota.getCodigoModificacion())
  //                            .build();
  //
  //            Encabezado encabezado =
  //                    Encabezado.builder()
  //                            .version("1.0")
  //                            .idDoc(documento)
  //                            .emisor(emisor)
  //                            .comprador(comprador)
  //                            .totales(totales)
  //                            .build();
  //            // URL_DGII
  //
  //            ECF facturaEcf =
  //                    ECF.builder()
  //                            .encabezado(encabezado)
  //                            .detallesItems(DetallesItems.builder().item(items).build())
  //                            .descuentosORecargos(descuentosORecargos)
  //                            .informacionReferencia(informacionReferencia)
  //                            .build();
  //            ObjectMapper objectMapper = new ObjectMapper();
  //            try {
  //                String jsonObject = objectMapper.writeValueAsString(facturaEcf);
  //                FacturaValidateResponse facturaValidateResponse =
  //                        this.sendJson(nota.getTipoComprobante().toString(), nota.getNcfNota(),
  // jsonObject);
  //                nota.setTrackId(facturaValidateResponse.trackingNumber());
  //                nota.setFechaFirma(facturaValidateResponse.fechaFirma());
  //                nota.setSecurityCode(facturaValidateResponse.securityCode());
  //                nota.setQrUrl(facturaValidateResponse.qrUrl());
  //                nota.setAprobada(true); // TODO, logica fija, pues se elimino el aceptado
  //
  //                notaEcfDao.save(nota);
  //                log.info(jsonObject);
  //                log.info(facturaValidateResponse.toString());
  //
  //            } catch (JsonProcessingException e) {
  //                throw new RuntimeException(e);
  //            }
  //        } else {
  //            log.error("Factura No Existe");
  //        }
  //        return null;
  //    }

  @Override
  public void senderEcfFactura(MfFactura factura) {
    SgEmpresa empresa = empresaServices.getCurrent().content();
    if (!empresa.getApiKeyActivo()) {
      log.warn(NO_ENVIAR_FACTURA_ELECTRONICA_DGII_CONFIG_MISSING_OR_STATUS_FALSE);
      return;
    }
    log.info("Enviando Factura");
    if (factura.getAprobada()) {
      log.info("enviada anteriormente Factura");
      return;
    }
    log.info("Comenza envio Factura");
    List<MfFacturaDetalle> detalles = factura.getDetalles();

    Map<Integer, DoubleSummaryStatistics> collect =
        detalles.stream()
            .collect(
                Collectors.groupingBy(
                    MfFacturaDetalle::getItbisId,
                    Collectors.summarizingDouble(
                        detalle -> detalle.getMontoItbis().doubleValue())));
    Map<Integer, DoubleSummaryStatistics> montoGrabado =
        detalles.stream()
            .collect(
                Collectors.groupingBy(
                    MfFacturaDetalle::getItbisId,
                    Collectors.summarizingDouble(
                        detalle ->
                            detalle
                                .getMontoVenta()
                                .subtract(detalle.getMontoDescuento())
                                .doubleValue())));
    BigDecimal montoNoFacturable =
        montoGrabado.get(0) != null
            ? BigDecimal.valueOf(montoGrabado.get(0).getSum()).setScale(2, RoundingMode.HALF_UP)
            : null;

    BigDecimal montoGravado1 =
        montoGrabado.get(1) != null
            ? BigDecimal.valueOf(montoGrabado.get(1).getSum()).setScale(2, RoundingMode.HALF_UP)
            : null;
    BigDecimal montoGravado2 =
        montoGrabado.get(2) != null
            ? BigDecimal.valueOf(montoGrabado.get(2).getSum()).setScale(2, RoundingMode.HALF_UP)
            : null;
    BigDecimal montoGravado3 =
        montoGrabado.get(3) != null
            ? BigDecimal.valueOf(montoGrabado.get(3).getSum()).setScale(2, RoundingMode.HALF_UP)
            : null;
    BigDecimal montoExento =
        montoGrabado.get(4) != null
            ? BigDecimal.valueOf(montoGrabado.get(4).getSum()).setScale(2, RoundingMode.HALF_UP)
            : null;

    BigDecimal montoItbis1 =
        collect.get(1) != null
            ? BigDecimal.valueOf(collect.get(1).getSum()).setScale(2, RoundingMode.HALF_UP)
            : null;
    BigDecimal montoItbis2 =
        collect.get(2) != null
            ? BigDecimal.valueOf(collect.get(2).getSum()).setScale(2, RoundingMode.HALF_UP)
            : null;
    BigDecimal montoItbis3 =
        collect.get(3) != null
            ? BigDecimal.valueOf(collect.get(3).getSum()).setScale(2, RoundingMode.HALF_UP)
            : null;

    log.info(
        "montoItbis1: {} montoItbis2: {} montoItbis3 :{}", montoItbis1, montoItbis2, montoItbis3);

    // empresa.getItbisIncluido();
    Integer indicadorMontoGravado = 0;
    if (factura.getTipoComprobanteId().equals("44")
        || factura.getTipoComprobanteId().equals("46")) {
      indicadorMontoGravado = null;
    }

    Documento documento =
        Documento.builder()
            .tipoeCF(String.valueOf(factura.getTipoComprobanteId()))
            //            .fechaVencimientoSecuencia(factura.getFechaVencimiento())
            .indicadorMontoGravado(indicadorMontoGravado)
            .encf(factura.getNcf())
            .tipoIngresos("01")
            .tipoPago(factura.getTipoFacturaId())
            .fechaLimitePago(
                factura.getTipoFacturaId().equals(2)
                    ? formatDate.format(factura.getFechaLimitePago())
                    : null)
            .build();

    Emisor emisor =
        Emisor.builder()
            .rncEmisor(empresa.getRnc().replace("-", ""))
            .razonSocialEmisor(empresa.getRazonSocial())
            .direccionEmisor(empresa.getDireccion())
            .fechaEmision(formatDate.format(factura.getFechaReg()))
            .build();

    String rncCliente = factura.getRnc() != null ? factura.getRnc().replace("-", "") : null;

    if (rncCliente != null && rncCliente.length() < 9) {
      rncCliente = null;
    }

    Comprador comprador =
        Comprador.builder()
            .rncComprador(rncCliente)
            .razonSocialComprador(factura.getRazonSocial())
            .build();

    if (isBlackOrNull(factura.getRnc()) || isBlackOrNull(factura.getRazonSocial())) {
      comprador = Comprador.builder().build();
    }

    List<Item> items =
        detalles.stream()
            .map(
                detalle -> {
                  Retencion retencion = null;

                  if (detalle.getRetencionItbis() != null
                      && detalle.getRetencionItbis().doubleValue() > 0) {
                    retencion =
                        Retencion.builder()
                            .montoITBISRetenido(
                                detalle.getRetencionItbis().setScale(2, RoundingMode.HALF_UP))
                            .montoISRRetenido(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                            .indicadorAgenteRetencionoPercepcion(1)
                            .build();
                  }

                  // Descuentoi
                  TablaSubDescuento tablaSubDescuento = null;
                  if (detalle.getMontoDescuento().doubleValue() > 0) {
                    List<SubDescuento> subDescuentos = new ArrayList<>();
                    SubDescuento descuentoItem =
                        SubDescuento.builder()
                            .tipoSubDescuento("$")
                            .montoSubDescuento(
                                detalle.getMontoDescuento().setScale(2, RoundingMode.HALF_UP))
                            .build();
                    subDescuentos.add(descuentoItem);
                    tablaSubDescuento =
                        TablaSubDescuento.builder().subDescuento(subDescuentos).build();
                  }
                  Optional<ProductoResumen> oProducto =
                      productoService.getProductoResumenById(detalle.getProductoId());
                  Integer isProducto = 0;

                  isProducto = oProducto.get().getCategoriaId().getInventario() ? 1 : 2;
                  String nombreItem = oProducto.get().getNombreProducto();

                  return Item.builder()
                      .numeroLinea(detalle.getLinea())
                      .nombreItem(nombreItem)
                      .indicadorBienoServicio(isProducto)
                      .cantidadItem(detalle.getCantidad().setScale(2, RoundingMode.HALF_UP))
                      .precioUnitarioItem(
                          detalle.getPrecioVentaUnd().setScale(4, RoundingMode.HALF_UP))
                      .montoItem(
                          detalle
                              .getMontoVenta()
                              .subtract(detalle.getMontoDescuento())
                              .setScale(2, RoundingMode.HALF_UP))
                      .indicadorFacturacion(detalle.getItbisId())
                      .retencion(retencion)
                      .tablaSubDescuento(tablaSubDescuento)
                      .descuentoMonto(
                          detalle.getMontoDescuento().doubleValue() > 0
                              ? detalle.getMontoDescuento().setScale(2, RoundingMode.HALF_UP)
                              : null)
                      .build();
                })
            .toList();
    //            Map<Integer, DoubleSummaryStatistics> descuentos =
    //                    detalles.stream()
    //                            .filter(detalle -> detalle.getDescuento().doubleValue() > 0)
    //                            .collect(
    //                                    Collectors.groupingBy(
    //                                            FacturaDetalle::getTipoITBIS,
    //                                            Collectors.summarizingDouble(
    //                                                    detalle ->
    // detalle.getDescuento().doubleValue())));
    //            AtomicInteger iLine = new AtomicInteger(0);
    //            List<DescuentoORecargo> descuentoORecargos =
    //                    descuentos.keySet().stream()
    //                            .map(
    //                                    key ->
    //                                            DescuentoORecargo.builder()
    //                                                    .numeroLinea(iLine.incrementAndGet())
    //                                                    .tipoAjuste(TipoAjusteType.D)
    //                                                    .descripcionDescuentooRecargo("Descuento")
    //                                                    .tipoValor("$")
    //                                                    .montoDescuentooRecargo(
    //
    // BigDecimal.valueOf(descuentos.get(key).getSum())
    //                                                                    .setScale(2,
    // RoundingMode.HALF_UP))
    //
    // .indicadorFacturacionDescuentooRecargo(key)
    //                                                    .build())
    //                            .toList();
    //
    //
    //            if (!descuentoORecargos.isEmpty()) {
    //                descuentosORecargos =
    //
    // DescuentosORecargos.builder().descuentoORecargo(descuentoORecargos).build();
    //            }

    Boolean monto1 = this.validarMontoGravado(montoItbis1);
    Boolean monto2 = this.validarMontoGravado(montoItbis2);

    BigDecimal montoItbisTotal =
        isNullCero(montoItbis1)
            .add(isNullCero(montoItbis2))
            .add(isNullCero(montoItbis3))
            .setScale(2, RoundingMode.HALF_UP);

    BigDecimal montoTotal =
        isNullCero(montoGravado1)
            .add(isNullCero(montoGravado2))
            .add(isNullCero(montoGravado3))
            .add(isNullCero(montoExento))
            .add(montoItbisTotal)
            .setScale(2, RoundingMode.HALF_UP);

    BigDecimal montoGravadoTotal =
        isNullCero(montoGravado1)
            .add(isNullCero(montoGravado2))
            .add(isNullCero(montoGravado3))
            .setScale(2, RoundingMode.HALF_UP);

    if (isCeroNull(montoItbisTotal)) montoItbisTotal = null;
    if (isCeroNull(montoTotal)) montoTotal = null;
    if (isCeroNull(montoGravadoTotal)) montoGravadoTotal = null;
    if (montoItbisTotal == null && montoItbis3 != null) {
      montoItbisTotal = BigDecimal.ZERO;
    }

    Totales totales =
        Totales.builder()
            .montoTotal(montoTotal)
            .itbis1(monto1 ? 18 : null) // Ver como eliminar el hardCode
            .itbis2(monto2 ? 16 : null) // Ver como eliminar el hardCode
            .itbis3(montoItbis3 != null ? 0 : null)
            .totalITBIS1(monto1 ? montoItbis1 : null)
            .totalITBIS2(monto2 ? montoItbis2 : null)
            .totalITBIS3(montoItbis3)
            .totalITBIS(montoItbisTotal)
            .montoGravadoI1(montoGravado1)
            .montoGravadoI2(montoGravado2)
            .montoGravadoI3(montoGravado3)
            .montoExento(montoExento)
            .montoNoFacturable(montoNoFacturable)
            .montoGravadoTotal(montoGravadoTotal)
            .build();
    Encabezado encabezado =
        Encabezado.builder()
            .version("1.0")
            .idDoc(documento)
            .emisor(emisor)
            .comprador(comprador)
            .totales(totales)
            .build();
    // URL_DGII

    ECF facturaEcf =
        ECF.builder()
            .encabezado(encabezado)
            .detallesItems(DetallesItems.builder().item(items).build())
            .descuentosORecargos(null)
            .build();

    ObjectMapper objectMapper = new ObjectMapper();
    try {
      String josnObject = objectMapper.writeValueAsString(facturaEcf);
      FacturaValidateResponse facturaValidateResponse =
          this.sendJson(
              String.valueOf(factura.getTipoComprobanteId()), factura.getNcf(), josnObject);

      factura.setTrackId(facturaValidateResponse.trackingNumber());
      factura.setSecuityCode(facturaValidateResponse.securityCode());
      factura.setQrUrl(facturaValidateResponse.qrUrl());
      factura.setFechaFirma(facturaValidateResponse.fechaFirma());
      facturaDao.updateFirmaAndQr(
          factura.getId(),
          empresa.getId(),
          factura.getFechaFirma(),
          factura.getSecuityCode(),
          factura.getQrUrl(),
          factura.getTrackId());
      log.info("Fin envio Factura");
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  //      @Override
  //      public ECF senderEcfTerceros(MfFacturaSuplidor facturaSuplidor, Boolean override) {
  //          TenantConfigurationProperties.DgiiConfig dgiiConfig = getCurrentTenantDgiiConfig();
  //          if (dgiiConfig == null || dgiiConfig.getStatus() == null || !dgiiConfig.getStatus()) {
  //              log.warn(NO_ENVIAR_FACTURA_ELECTRONICA_DGII_CONFIG_MISSING_OR_STATUS_FALSE);
  //              return ECF.builder().build();
  //          }
  //          InformacionSistema oEmpresa =
  //                  empresaDao
  //                          .findById(1)
  //                          .orElseThrow(() -> new ChangeSetPersister.NotFoundException("No se
  // encontro la empresa"));
  //
  //          ECF factura =
  //                  switch (facturaSuplidor.getTipoCfId().getNumeroComprobante()) {
  //                      case COMPROBANTE_PAGOS_EXTERIOR ->
  //   convertFacturaMapper.mapFactura47(facturaSuplidor, oEmpresa);
  //                      case GASTOS_MENORES_ELECTRONICOS ->
  //   convertFacturaMapper.mapFactura43(facturaSuplidor, oEmpresa);
  //
  //
  //                      case COMPRAS_ELECTRONICOS ->
  //   convertFacturaMapper.mapFactura41(facturaSuplidor, oEmpresa);
  //                      default -> throw new IllegalArgumentException(
  //                              "Unsupported factura type: " + facturaSuplidor.getId());
  //                  };
  //          ObjectMapper objectMapper = new ObjectMapper();
  //          try {
  //              String josnObject = objectMapper.writeValueAsString(factura);
  //              FacturaValidateResponse facturaValidateResponse =
  //                      this.sendJson(factura.encabezado().idDoc().tipoeCF(),
  //   factura.encabezado().idDoc().encf(), josnObject, override);
  //              facturaSuplidor.setTrackId(facturaValidateResponse.trackingNumber());
  //              facturaSuplidor.setFechaFirma(facturaValidateResponse.fechaFirma());
  //              facturaSuplidor.setSecurityCode(facturaValidateResponse.securityCode());
  //              facturaSuplidor.setQrUrl(facturaValidateResponse.qrUrl());
  //              facturaSuplidor.setFechaFirma(facturaValidateResponse.fechaFirma());
  //
  //              repository.save(facturaSuplidor);
  //
  //          } catch (JsonProcessingException e) {
  //              throw new RuntimeException(e);
  //          }
  //
  //          return factura;
  //      }

  public Boolean validarMontoGravado(BigDecimal value) {
    return value != null && value.doubleValue() > 0;
  }

  public BigDecimal isNullCero(BigDecimal value) {
    return value != null ? value : BigDecimal.ZERO;
  }

  public Boolean isBlackOrNull(String value) {
    return value == null || value.isBlank();
  }

  public Boolean isCeroNull(BigDecimal value) {
    return value.doubleValue() == 0 ? true : false;
  }

  private FacturaValidateResponse sendJson(String tipoEcf, String ncf, String json) {
    return sendJson(tipoEcf, ncf, json, false);
  }

  private FacturaValidateResponse sendJson(
      String tipoEcf, String ncf, String json, Boolean override) {
    SgEmpresa empresa = empresaServices.getCurrent().content();
    if (!empresa.getApiKeyActivo()) {
      log.warn(NO_ENVIAR_FACTURA_ELECTRONICA_DGII_CONFIG_MISSING_OR_STATUS_FALSE);
      return FacturaValidateResponse.builder()
          .status("ERROR")
          .description("Envio de factura electrónica deshabilitado por configuración de la empresa")
          .requestUrl(tipoEcf)
          .requestType("POST")
          .build();
    }

    String url = String.join("/", DGII_URL, "api/facturacion/electronica/factura", tipoEcf);

    log.info("URL: {}", url);
    log.info("x-cliente-id: {},x-api-key: {}", empresa.getRnc(), empresa.getApikey());
    log.info("PayLoad: {}", json);
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.add("x-cliente-id", empresa.getClienteId());
    headers.add("x-api-key", empresa.getApikey());
    headers.add("x-override-file", String.valueOf(override));

    HttpEntity<String> requestEntity = new HttpEntity<>(json, headers);
    RestTemplate restTemplate = new RestTemplate();
    try {
      ResponseEntity<FacturaValidateResponse> response =
          restTemplate.exchange(url, HttpMethod.POST, requestEntity, FacturaValidateResponse.class);
      if (response.getStatusCode() == HttpStatus.OK) {
        System.out.println("Response: " + response.getBody());
      } else {
        log.error("Error: {}", response.getStatusCode());
      }
      return response.getBody();
    } catch (HttpClientErrorException | HttpServerErrorException ex) {
      log.error("HTTP error when sending JSON: {}", ex.getStatusCode());
      // Guardar log en BD usando el NCF (o algún identificador entero derivado del RNC o NCF)

      // Intentar extraer algún identificador entero a partir del payload JSON
      // Por simplicidad, usamos el número de factura o NCF si está disponible en el JSON
      // Aquí asumimos que el JSON contiene el campo "encabezado" con "idDoc" y "encf" (NCF)
      try {
        String logMessage = ex.getMessage();

        log.info("logs envio: {}", logMessage);
      } catch (Exception logEx) {
        log.error("Error al guardar log de NFC en BD", logEx);
      }
      throw new AuthenticationException("Error de autenticación al comunicarse con DGII");
    }
  }

  public ValidationResponse validateFactJson(String trackId) {
    SgEmpresa empresa = empresaServices.getCurrent().content();

    String url = String.join("/", DGII_URL, "api/facturacion/electronica/track", trackId);
    log.info(
        "URL: {}, PayLoad: {}, x-cliente-id: {},x-api-key: ****",
        url,
        trackId,
        empresa.getClienteId());
    // Set headers
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.add("x-cliente-id", empresa.getClienteId());
    headers.add("x-api-key", empresa.getApikey());
    // Create HttpEntity
    HttpEntity<String> requestEntity = new HttpEntity<>(headers);
    // Instantiate RestTemplate
    RestTemplate restTemplate = new RestTemplate();
    // Send GET request
    ResponseEntity<ValidationResponse> response =
        restTemplate.exchange(url, HttpMethod.GET, requestEntity, ValidationResponse.class);
    // Check response
    if (response.getStatusCode() == HttpStatus.OK) {
      System.out.println("Response: " + response.getBody());
    }
    return response.getBody();
  }

  public boolean validarQr(String url) {
    try {
      RestTemplate restTemplate = new RestTemplate();

      HttpHeaders headers = new HttpHeaders();
      headers.set("User-Agent", "Mozilla/5.0");

      HttpEntity<String> entity = new HttpEntity<>(headers);
      URI uri = new URI(url);
      ResponseEntity<String> response =
          restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);

      String htmlContent = response.getBody();

      if (htmlContent != null && htmlContent.contains("Aceptado")) {
        log.info("Palabra 'Aceptado' encontrada en la URL: {}", url);
        return true;
      } else {
        log.warn("Palabra 'Aceptado' NO encontrada en la URL: {}", url);
        return false;
      }

    } catch (java.net.URISyntaxException e) {
      log.error("URL inválida: {}", url, e);
      return false;
    } catch (org.springframework.web.client.RestClientException e) {
      log.error("Error al llamar a la URL: {}", url, e);
      return false;
    }
  }
}

// NOTE: Ensure your build file includes 'jakarta.servlet:jakarta.servlet-api:6.0.0' for
// ServletContext support in Spring Boot 3.x
