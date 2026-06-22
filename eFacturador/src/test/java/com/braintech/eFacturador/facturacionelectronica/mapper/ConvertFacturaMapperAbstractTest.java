package com.braintech.eFacturador.facturacionelectronica.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.braintech.eFacturador.facturacionelectronica.models.DetallesItems;
import com.braintech.eFacturador.facturacionelectronica.models.Encabezado;
import com.braintech.eFacturador.facturacionelectronica.models.Item;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidor;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorDetalle;
import com.braintech.eFacturador.jpa.facturacion.MfFacturaSuplidorDetalleDescuento;
import com.braintech.eFacturador.jpa.general.MgItbis;
import com.braintech.eFacturador.jpa.general.MgRetencionItbis;
import com.braintech.eFacturador.jpa.inventario.InSuplidor;
import com.braintech.eFacturador.jpa.seguridad.SgEmpresa;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Pruebas unitarias de la lógica de mapeo en {@link ConvertFacturaMapperAbstract}.
 *
 * <p>Los métodos públicos se prueban directamente sobre una subclase anónima — sin Spring ni
 * MapStruct generado — para mantener los tests rápidos y sin infraestructura.
 */
class ConvertFacturaMapperAbstractTest {

  // Instancia de prueba: subclase anónima (la clase abstracta no tiene campos de instancia)
  private final ConvertFacturaMapperAbstract mapper = new ConvertFacturaMapperAbstract() {};

  // ─── Constantes de tasa ITBIS (espejo de AppConstants) ──────────────────────
  private static final Integer TASA_1 = 1; // 18%
  private static final Integer TASA_2 = 2; // 16%
  private static final Integer TASA_3 = 3; //  0% reducida
  private static final Integer TASA_4 = 4; // Exento

  // ═══════════════════════════════════════════════════════════════════════════
  // Factories
  // ═══════════════════════════════════════════════════════════════════════════

  private SgEmpresa empresaFake() {
    SgEmpresa e = new SgEmpresa();
    e.setRnc("101-12345-6");
    e.setRazonSocial("Empresa SA");
    e.setDireccion("Av. Principal 123");
    return e;
  }

  private InSuplidor suplidorFake(String rnc, String razonSocial, String nombre) {
    InSuplidor s = new InSuplidor();
    s.setRnc(rnc);
    s.setRazonSocial(razonSocial);
    s.setNombre(nombre);
    return s;
  }

  private MgItbis itbisFake(Integer id) {
    MgItbis itbis = new MgItbis();
    itbis.setId(id);
    return itbis;
  }

  private MfFacturaSuplidor facturaFake() {
    MfFacturaSuplidor f = new MfFacturaSuplidor();
    f.setNcf("E310000000001");
    f.setFechaValido(LocalDateTime.of(2025, 12, 31, 0, 0));
    f.setTotal(BigDecimal.valueOf(1000.00));
    f.setSubTotal(BigDecimal.valueOf(847.46));
    f.setSuplidor(suplidorFake("102-98765-4", "Proveedor SRL", null));
    f.setDetalles(new ArrayList<>());
    return f;
  }

  /**
   * Crea un detalle con los campos mínimos necesarios para el mapper. {@code itbisId} determina la
   * tasa ITBIS; {@code estado} debe ser "ACT" o "INA".
   */
  private MfFacturaSuplidorDetalle detalleFake(
      Integer itbisId, BigDecimal subTotal, BigDecimal itbis, BigDecimal descuento, String estado) {
    MfFacturaSuplidorDetalle d = new MfFacturaSuplidorDetalle();
    d.setItbisObj(itbisFake(itbisId));
    d.setSubTotal(subTotal);
    d.setItbis(itbis);
    d.setMontoDescuento(descuento != null ? descuento : BigDecimal.ZERO);
    d.setEstado(estado);
    d.setConcepto("Servicio de prueba");
    d.setCantidad(1);
    d.setPrecioUnitario(subTotal);
    d.setIndicadorBienServicio(true);
    d.setRetencion(null);
    d.setMontoItbisRetenido(null);
    d.setDescuentos(new ArrayList<>());
    return d;
  }

  private MfFacturaSuplidorDetalleDescuento descuentoFake(
      String tipo, BigDecimal valor, BigDecimal monto) {
    MfFacturaSuplidorDetalleDescuento desc = new MfFacturaSuplidorDetalleDescuento();
    desc.setTipo(tipo);
    desc.setValor(valor);
    desc.setMonto(monto);
    return desc;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // mapEncabezado47
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("mapEncabezado47()")
  class MapEncabezado47 {

    @Test
    @DisplayName("retorna null cuando la factura es null")
    void retornaNull_facturaNull() {
      assertThat(mapper.mapEncabezado47(null, empresaFake())).isNull();
    }

    @Test
    @DisplayName("retorna null cuando la empresa es null")
    void retornaNull_empresaNull() {
      assertThat(mapper.mapEncabezado47(facturaFake(), null)).isNull();
    }

    @Test
    @DisplayName("tipoeCF es '47'")
    void tipoECF_es_47() {
      Encabezado enc = mapper.mapEncabezado47(facturaFake(), empresaFake());
      assertThat(enc.idDoc().tipoeCF()).isEqualTo("47");
    }

    @Test
    @DisplayName("encf viene del NCF de la factura")
    void encf_desdeNcf() {
      Encabezado enc = mapper.mapEncabezado47(facturaFake(), empresaFake());
      assertThat(enc.idDoc().encf()).isEqualTo("E310000000001");
    }

    @Test
    @DisplayName("emisor usa RNC, razonSocial y dirección de la empresa")
    void emisor_datosDesdeEmpresa() {
      Encabezado enc = mapper.mapEncabezado47(facturaFake(), empresaFake());
      assertThat(enc.emisor().rncEmisor()).isEqualTo("101-12345-6");
      assertThat(enc.emisor().razonSocialEmisor()).isEqualTo("Empresa SA");
      assertThat(enc.emisor().direccionEmisor()).isEqualTo("Av. Principal 123");
    }

    @Test
    @DisplayName("comprador usa RNC y razonSocial del suplidor")
    void comprador_datosDesSuplidor() {
      Encabezado enc = mapper.mapEncabezado47(facturaFake(), empresaFake());
      assertThat(enc.comprador().rncComprador()).isEqualTo("102-98765-4");
      assertThat(enc.comprador().razonSocialComprador()).isEqualTo("Proveedor SRL");
    }

    @Test
    @DisplayName("comprador es null cuando la factura no tiene suplidor")
    void comprador_null_cuandoSuplidorNull() {
      MfFacturaSuplidor f = facturaFake();
      f.setSuplidor(null);
      Encabezado enc = mapper.mapEncabezado47(f, empresaFake());
      assertThat(enc.comprador()).isNull();
    }

    @Test
    @DisplayName("fechaLimitePago es null en el documento cuando no está seteado")
    void fechaLimitePago_null_cuandoNoSeteado() {
      MfFacturaSuplidor f = facturaFake();
      f.setFechaLimitePago(null);
      Encabezado enc = mapper.mapEncabezado47(f, empresaFake());
      assertThat(enc.idDoc().fechaLimitePago()).isNull();
    }

    @Test
    @DisplayName("fechaLimitePago aparece en el documento con formato dd-MM-yyyy")
    void fechaLimitePago_formateada() {
      MfFacturaSuplidor f = facturaFake();
      f.setFechaLimitePago(LocalDate.of(2025, 6, 15));
      Encabezado enc = mapper.mapEncabezado47(f, empresaFake());
      assertThat(enc.idDoc().fechaLimitePago()).isEqualTo("15-06-2025");
    }

    @Test
    @DisplayName("montoTotal = total cuando no hay retencion ISR")
    void montoTotal_sinRetencionIsr() {
      MfFacturaSuplidor f = facturaFake();
      f.setRetencionIsr(null);
      f.setTotal(BigDecimal.valueOf(1000));
      Encabezado enc = mapper.mapEncabezado47(f, empresaFake());
      assertThat(enc.totales().montoTotal()).isEqualByComparingTo("1000");
    }

    @Test
    @DisplayName("montoTotal = total + montoRetencionIsr cuando hay retencion ISR")
    void montoTotal_conRetencionIsr() {
      MfFacturaSuplidor f = facturaFake();
      f.setRetencionIsr(new MgRetencionItbis());
      f.setMontoRetencionIsr(BigDecimal.valueOf(150));
      f.setTotal(BigDecimal.valueOf(850));
      Encabezado enc = mapper.mapEncabezado47(f, empresaFake());
      assertThat(enc.totales().montoTotal()).isEqualByComparingTo("1000.00");
    }

    @Test
    @DisplayName("totalISRRetencion es null cuando retencionIsr es null")
    void totalISRRetencion_null_sinRetencion() {
      MfFacturaSuplidor f = facturaFake();
      f.setRetencionIsr(null);
      Encabezado enc = mapper.mapEncabezado47(f, empresaFake());
      assertThat(enc.totales().totalISRRetencion()).isNull();
    }

    @Test
    @DisplayName("totalISRRetencion = montoRetencionIsr cuando hay retencion ISR")
    void totalISRRetencion_conRetencion() {
      MfFacturaSuplidor f = facturaFake();
      f.setRetencionIsr(new MgRetencionItbis());
      f.setMontoRetencionIsr(BigDecimal.valueOf(150));
      Encabezado enc = mapper.mapEncabezado47(f, empresaFake());
      assertThat(enc.totales().totalISRRetencion()).isEqualByComparingTo("150.00");
    }

    @Test
    @DisplayName("version es '1.0'")
    void version_es_1_0() {
      Encabezado enc = mapper.mapEncabezado47(facturaFake(), empresaFake());
      assertThat(enc.version()).isEqualTo("1.0");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // mapDetallesItems47
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("mapDetallesItems47()")
  class MapDetallesItems47 {

    @Test
    @DisplayName("retorna lista vacía cuando la factura es null")
    void null_retornaItemsVacios() {
      DetallesItems result = mapper.mapDetallesItems47(null);
      assertThat(result.item()).isEmpty();
    }

    @Test
    @DisplayName("solo procesa detalles con estado ACT")
    void soloDetallesACT() {
      MfFacturaSuplidor f = facturaFake();
      f.getDetalles()
          .add(detalleFake(TASA_4, BigDecimal.valueOf(100), BigDecimal.ZERO, null, "ACT"));
      f.getDetalles()
          .add(detalleFake(TASA_4, BigDecimal.valueOf(200), BigDecimal.ZERO, null, "INA"));

      DetallesItems result = mapper.mapDetallesItems47(f);

      assertThat(result.item()).hasSize(1);
    }

    @Test
    @DisplayName("indicadorFacturacion es EXENTO (4) para todos los items del tipo 47")
    void indicadorFacturacion_esExento() {
      MfFacturaSuplidor f = facturaFake();
      f.getDetalles()
          .add(detalleFake(TASA_1, BigDecimal.valueOf(100), BigDecimal.ZERO, null, "ACT"));

      DetallesItems result = mapper.mapDetallesItems47(f);

      assertThat(result.item().get(0).indicadorFacturacion()).isEqualTo(4);
    }

    @Test
    @DisplayName("retencion en el item es null cuando el detalle no tiene retencion")
    void retencion_null_cuandoDetallesinRetencion() {
      MfFacturaSuplidor f = facturaFake();
      MfFacturaSuplidorDetalle d =
          detalleFake(TASA_4, BigDecimal.valueOf(100), BigDecimal.ZERO, null, "ACT");
      d.setRetencion(null);
      f.getDetalles().add(d);

      Item item = mapper.mapDetallesItems47(f).item().get(0);

      assertThat(item.retencion()).isNull();
    }

    @Test
    @DisplayName(
        "retencion en el item se construye con indicador=1 cuando el detalle tiene retencion")
    void retencion_mapeadaConIndicador1() {
      MfFacturaSuplidor f = facturaFake();
      MfFacturaSuplidorDetalle d =
          detalleFake(TASA_4, BigDecimal.valueOf(100), BigDecimal.ZERO, null, "ACT");
      d.setRetencion(BigDecimal.valueOf(15));
      f.getDetalles().add(d);

      Item item = mapper.mapDetallesItems47(f).item().get(0);

      assertThat(item.retencion()).isNotNull();
      assertThat(item.retencion().indicadorAgenteRetencionoPercepcion()).isEqualTo(1);
      assertThat(item.retencion().montoISRRetenido()).isEqualByComparingTo("15.00");
      assertThat(item.retencion().montoITBISRetenido()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("numeroLinea es incremental comenzando en 1")
    void numeroLinea_incremental() {
      MfFacturaSuplidor f = facturaFake();
      f.getDetalles()
          .add(detalleFake(TASA_4, BigDecimal.valueOf(100), BigDecimal.ZERO, null, "ACT"));
      f.getDetalles()
          .add(detalleFake(TASA_4, BigDecimal.valueOf(200), BigDecimal.ZERO, null, "ACT"));

      List<Item> items = mapper.mapDetallesItems47(f).item();

      assertThat(items.get(0).numeroLinea()).isEqualTo(1);
      assertThat(items.get(1).numeroLinea()).isEqualTo(2);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // mapEncabezado43
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("mapEncabezado43()")
  class MapEncabezado43 {

    @Test
    @DisplayName("retorna null cuando la factura es null")
    void retornaNull_facturaNull() {
      assertThat(mapper.mapEncabezado43(null, empresaFake())).isNull();
    }

    @Test
    @DisplayName("retorna null cuando la empresa es null")
    void retornaNull_empresaNull() {
      assertThat(mapper.mapEncabezado43(facturaFake(), null)).isNull();
    }

    @Test
    @DisplayName("tipoeCF es '43'")
    void tipoECF_es_43() {
      Encabezado enc = mapper.mapEncabezado43(facturaFake(), empresaFake());
      assertThat(enc.idDoc().tipoeCF()).isEqualTo("43");
    }

    @Test
    @DisplayName("montoTotal y montoExento son ambos igual al total de la factura")
    void totales_igualesAlTotal() {
      MfFacturaSuplidor f = facturaFake();
      f.setTotal(BigDecimal.valueOf(500));
      Encabezado enc = mapper.mapEncabezado43(f, empresaFake());
      assertThat(enc.totales().montoTotal()).isEqualByComparingTo("500");
      assertThat(enc.totales().montoExento()).isEqualByComparingTo("500");
    }

    @Test
    @DisplayName("no hay comprador en el tipo 43")
    void sinComprador() {
      Encabezado enc = mapper.mapEncabezado43(facturaFake(), empresaFake());
      assertThat(enc.comprador()).isNull();
    }

    @Test
    @DisplayName("emisor usa RNC, razonSocial y dirección de la empresa")
    void emisor_datosDesdeEmpresa() {
      Encabezado enc = mapper.mapEncabezado43(facturaFake(), empresaFake());
      assertThat(enc.emisor().rncEmisor()).isEqualTo("101-12345-6");
      assertThat(enc.emisor().razonSocialEmisor()).isEqualTo("Empresa SA");
    }

    @Test
    @DisplayName("tipoPago se mapea al documento")
    void tipoPago_mapeado() {
      MfFacturaSuplidor f = facturaFake();
      f.setTipoPago(1);
      Encabezado enc = mapper.mapEncabezado43(f, empresaFake());
      assertThat(enc.idDoc().tipoPago()).isEqualTo(1);
    }

    @Test
    @DisplayName("version es '1.0'")
    void version_es_1_0() {
      Encabezado enc = mapper.mapEncabezado43(facturaFake(), empresaFake());
      assertThat(enc.version()).isEqualTo("1.0");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // mapDetallesItems43
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("mapDetallesItems43()")
  class MapDetallesItems43 {

    @Test
    @DisplayName("retorna lista vacía cuando la factura es null")
    void null_retornaItemsVacios() {
      assertThat(mapper.mapDetallesItems43(null).item()).isEmpty();
    }

    @Test
    @DisplayName("mapea todos los detalles sin filtrar por estado")
    void mapeaTodosLosDet_sinFiltroEstado() {
      MfFacturaSuplidor f = facturaFake();
      f.getDetalles()
          .add(detalleFake(TASA_4, BigDecimal.valueOf(100), BigDecimal.ZERO, null, "ACT"));
      f.getDetalles()
          .add(detalleFake(TASA_4, BigDecimal.valueOf(200), BigDecimal.ZERO, null, "INA"));

      // El tipo 43 no filtra por estado — incluye todos
      assertThat(mapper.mapDetallesItems43(f).item()).hasSize(2);
    }

    @Test
    @DisplayName("indicadorFacturacion es siempre EXENTO (4)")
    void indicadorFacturacion_siempreExento() {
      MfFacturaSuplidor f = facturaFake();
      f.getDetalles()
          .add(detalleFake(TASA_1, BigDecimal.valueOf(100), BigDecimal.ZERO, null, "ACT"));
      Item item = mapper.mapDetallesItems43(f).item().get(0);
      assertThat(item.indicadorFacturacion()).isEqualTo(4);
    }

    @Test
    @DisplayName("numeroLinea incremental comenzando en 1")
    void numeroLinea_incremental() {
      MfFacturaSuplidor f = facturaFake();
      f.getDetalles()
          .add(detalleFake(TASA_4, BigDecimal.valueOf(50), BigDecimal.ZERO, null, "ACT"));
      f.getDetalles()
          .add(detalleFake(TASA_4, BigDecimal.valueOf(50), BigDecimal.ZERO, null, "ACT"));

      List<Item> items = mapper.mapDetallesItems43(f).item();
      assertThat(items.get(0).numeroLinea()).isEqualTo(1);
      assertThat(items.get(1).numeroLinea()).isEqualTo(2);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // mapEncabezado41
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("mapEncabezado41()")
  class MapEncabezado41 {

    @Test
    @DisplayName("retorna null cuando la factura es null")
    void retornaNull_facturaNull() {
      assertThat(mapper.mapEncabezado41(null, empresaFake())).isNull();
    }

    @Test
    @DisplayName("retorna null cuando la empresa es null")
    void retornaNull_empresaNull() {
      assertThat(mapper.mapEncabezado41(facturaFake(), null)).isNull();
    }

    @Test
    @DisplayName("tipoeCF es '41'")
    void tipoECF_es_41() {
      MfFacturaSuplidor f = facturaConDetalle41();
      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());
      assertThat(enc.idDoc().tipoeCF()).isEqualTo("41");
    }

    @Test
    @DisplayName("usa razonSocial del suplidor cuando está presente")
    void usaRazonSocial_cuandoPresente() {
      MfFacturaSuplidor f = facturaConDetalle41();
      f.setSuplidor(suplidorFake("111", "Proveedor SA", "Nombre Alt"));
      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());
      assertThat(enc.comprador().razonSocialComprador()).isEqualTo("Proveedor SA");
    }

    @Test
    @DisplayName("usa nombre del suplidor cuando razonSocial es null")
    void usaNombre_cuandoRazonSocialNull() {
      MfFacturaSuplidor f = facturaConDetalle41();
      f.setSuplidor(suplidorFake("111", null, "Nombre Alt"));
      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());
      assertThat(enc.comprador().razonSocialComprador()).isEqualTo("Nombre Alt");
    }

    @Test
    @DisplayName("usa nombre cuando razonSocial está en blanco")
    void usaNombre_cuandoRazonSocialEnBlanco() {
      MfFacturaSuplidor f = facturaConDetalle41();
      f.setSuplidor(suplidorFake("111", "   ", "Nombre Alt"));
      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());
      assertThat(enc.comprador().razonSocialComprador()).isEqualTo("Nombre Alt");
    }

    @Test
    @DisplayName("lanza IllegalArgumentException cuando razonSocial y nombre son ambos null/blank")
    void lanzaExcepcion_sinRazonSocialNiNombre() {
      MfFacturaSuplidor f = facturaConDetalle41();
      f.setSuplidor(suplidorFake("111", null, null));

      assertThatThrownBy(() -> mapper.mapEncabezado41(f, empresaFake()))
          .isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining(f.getNcf());
    }

    @Test
    @DisplayName("montoGravadoI1 refleja subtotal de detalles con tasa 1 menos descuentos")
    void montoGravadoI1_calculadoCorrectamente() {
      MfFacturaSuplidor f = facturaFake();
      f.setSuplidor(suplidorFake("111", "Prov SA", null));
      // subTotal=100, descuento=10, itbis=16.20, estado=ACT, tasa=1
      f.getDetalles()
          .add(
              detalleFake(
                  TASA_1,
                  BigDecimal.valueOf(100),
                  BigDecimal.valueOf(16.20),
                  BigDecimal.valueOf(10),
                  "ACT"));

      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());

      // (100 - 10) = 90.00
      assertThat(enc.totales().montoGravadoI1()).isEqualByComparingTo("90.00");
    }

    @Test
    @DisplayName("montoGravadoI1 es null cuando no hay detalles con tasa 1")
    void montoGravadoI1_null_cuandoSinDetallesTasa1() {
      MfFacturaSuplidor f = facturaFake();
      f.setSuplidor(suplidorFake("111", "Prov SA", null));
      // Solo detalle exento
      f.getDetalles()
          .add(detalleFake(TASA_4, BigDecimal.valueOf(100), BigDecimal.ZERO, null, "ACT"));

      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());

      assertThat(enc.totales().montoGravadoI1()).isNull();
    }

    @Test
    @DisplayName("totalITBIS1 es null cuando no hay detalles activos con tasa 1")
    void totalITBIS1_null_cuandoSinDetallesActivosTasa1() {
      MfFacturaSuplidor f = facturaFake();
      f.setSuplidor(suplidorFake("111", "Prov SA", null));
      f.getDetalles()
          .add(detalleFake(TASA_4, BigDecimal.valueOf(100), BigDecimal.ZERO, null, "ACT"));

      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());

      assertThat(enc.totales().totalITBIS1()).isNull();
    }

    @Test
    @DisplayName("totalITBIS suma el ITBIS de todos los detalles activos de las 3 tasas")
    void totalITBIS_sumaDeTodasLasTasas() {
      MfFacturaSuplidor f = facturaFake();
      f.setSuplidor(suplidorFake("111", "Prov SA", null));
      f.getDetalles()
          .add(detalleFake(TASA_1, BigDecimal.valueOf(100), BigDecimal.valueOf(18), null, "ACT"));
      f.getDetalles()
          .add(detalleFake(TASA_2, BigDecimal.valueOf(100), BigDecimal.valueOf(16), null, "ACT"));

      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());

      assertThat(enc.totales().totalITBIS()).isEqualByComparingTo("34.00");
    }

    @Test
    @DisplayName("montoExento es null cuando es cero (sin detalles exentos)")
    void montoExento_null_cuandoCero() {
      MfFacturaSuplidor f = facturaFake();
      f.setSuplidor(suplidorFake("111", "Prov SA", null));
      f.getDetalles()
          .add(detalleFake(TASA_1, BigDecimal.valueOf(100), BigDecimal.valueOf(18), null, "ACT"));

      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());

      assertThat(enc.totales().montoExento()).isNull();
    }

    @Test
    @DisplayName("montoExento tiene valor cuando hay detalles exentos (tasa 4)")
    void montoExento_cuandoDetallesExentos() {
      MfFacturaSuplidor f = facturaFake();
      f.setSuplidor(suplidorFake("111", "Prov SA", null));
      f.getDetalles()
          .add(detalleFake(TASA_4, BigDecimal.valueOf(200), BigDecimal.ZERO, null, "ACT"));

      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());

      assertThat(enc.totales().montoExento()).isEqualByComparingTo("200.00");
    }

    @Test
    @DisplayName("detalles con estado INA son excluidos de los cálculos de montos")
    void detallesINA_excluidosDeCalcuos() {
      MfFacturaSuplidor f = facturaFake();
      f.setSuplidor(suplidorFake("111", "Prov SA", null));
      f.getDetalles()
          .add(detalleFake(TASA_1, BigDecimal.valueOf(100), BigDecimal.valueOf(18), null, "ACT"));
      f.getDetalles()
          .add(detalleFake(TASA_1, BigDecimal.valueOf(500), BigDecimal.valueOf(90), null, "INA"));

      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());

      // Solo el detalle ACT contribuye
      assertThat(enc.totales().montoGravadoI1()).isEqualByComparingTo("100.00");
      assertThat(enc.totales().totalITBIS1()).isEqualByComparingTo("18.00");
    }

    @Test
    @DisplayName("totalISRRetencion se mapea cuando hay retencion ISR")
    void totalISRRetencion_cuandoRetencionIsr() {
      MfFacturaSuplidor f = facturaConDetalle41();
      f.setRetencionIsr(new MgRetencionItbis());
      f.setMontoRetencionIsr(BigDecimal.valueOf(75));

      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());

      assertThat(enc.totales().totalISRRetencion()).isEqualByComparingTo("75.00");
    }

    @Test
    @DisplayName("totalITBISRetenido se mapea cuando hay retencion ITBIS")
    void totalITBISRetenido_cuandoRetencionItbis() {
      MfFacturaSuplidor f = facturaConDetalle41();
      f.setRetencionItbis(new MgRetencionItbis());
      f.setMontoRetencionItbis(BigDecimal.valueOf(30));

      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());

      assertThat(enc.totales().totalITBISRetenido()).isEqualByComparingTo("30.00");
    }

    @Test
    @DisplayName("indicadorMontoGravado es 0 en el documento")
    void indicadorMontoGravado_es0() {
      MfFacturaSuplidor f = facturaConDetalle41();
      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());
      assertThat(enc.idDoc().indicadorMontoGravado()).isEqualTo(0);
    }

    @Test
    @DisplayName("fechaLimitePago es null en el documento cuando no está seteado")
    void fechaLimitePago_null_cuandoNoSeteado() {
      MfFacturaSuplidor f = facturaConDetalle41();
      f.setFechaLimitePago(null);
      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());
      assertThat(enc.idDoc().fechaLimitePago()).isNull();
    }

    @Test
    @DisplayName("fechaLimitePago aparece en el documento con formato dd-MM-yyyy")
    void fechaLimitePago_formateada() {
      MfFacturaSuplidor f = facturaConDetalle41();
      f.setFechaLimitePago(LocalDate.of(2025, 3, 20));
      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());
      assertThat(enc.idDoc().fechaLimitePago()).isEqualTo("20-03-2025");
    }

    @Test
    @DisplayName("montoTotal = montoGravadoTotal + montoExento + totalITBIS")
    void montoTotal_calculadoCorrectamente() {
      MfFacturaSuplidor f = facturaFake();
      f.setSuplidor(suplidorFake("111", "Prov SA", null));
      // Detalle tasa 1: subTotal=100, itbis=18
      f.getDetalles()
          .add(detalleFake(TASA_1, BigDecimal.valueOf(100), BigDecimal.valueOf(18), null, "ACT"));

      Encabezado enc = mapper.mapEncabezado41(f, empresaFake());

      // 100 (gravado) + 0 (exento) + 18 (itbis) = 118
      assertThat(enc.totales().montoTotal()).isEqualByComparingTo("118.00");
    }

    /** Factura con un detalle tasa 1 válido para tests que requieren suplidor. */
    private MfFacturaSuplidor facturaConDetalle41() {
      MfFacturaSuplidor f = facturaFake();
      f.setSuplidor(suplidorFake("102-98765-4", "Proveedor SRL", null));
      f.getDetalles()
          .add(detalleFake(TASA_1, BigDecimal.valueOf(100), BigDecimal.valueOf(18), null, "ACT"));
      return f;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // mapDetallesItems41
  // ═══════════════════════════════════════════════════════════════════════════

  @Nested
  @DisplayName("mapDetallesItems41()")
  class MapDetallesItems41 {

    @Test
    @DisplayName("retorna lista vacía cuando la factura es null")
    void null_retornaItemsVacios() {
      assertThat(mapper.mapDetallesItems41(null).item()).isEmpty();
    }

    @Test
    @DisplayName("descuentoMonto es null en el item cuando montoDescuento es cero")
    void descuentoMonto_null_cuandoCero() {
      MfFacturaSuplidor f = facturaFake();
      f.getDetalles()
          .add(
              detalleFake(
                  TASA_1, BigDecimal.valueOf(100), BigDecimal.valueOf(18), BigDecimal.ZERO, "ACT"));

      Item item = mapper.mapDetallesItems41(f).item().get(0);

      assertThat(item.descuentoMonto()).isNull();
    }

    @Test
    @DisplayName("descuentoMonto está presente cuando montoDescuento es positivo")
    void descuentoMonto_presente_cuandoPositivo() {
      MfFacturaSuplidor f = facturaFake();
      f.getDetalles()
          .add(
              detalleFake(
                  TASA_1,
                  BigDecimal.valueOf(100),
                  BigDecimal.valueOf(18),
                  BigDecimal.valueOf(10),
                  "ACT"));

      Item item = mapper.mapDetallesItems41(f).item().get(0);

      assertThat(item.descuentoMonto()).isEqualByComparingTo("10.00");
    }

    @Test
    @DisplayName("montoItem = subTotal - montoDescuento")
    void montoItem_subTotalMenosDescuento() {
      MfFacturaSuplidor f = facturaFake();
      f.getDetalles()
          .add(
              detalleFake(
                  TASA_1,
                  BigDecimal.valueOf(100),
                  BigDecimal.valueOf(18),
                  BigDecimal.valueOf(15),
                  "ACT"));

      Item item = mapper.mapDetallesItems41(f).item().get(0);

      // 100 - 15 = 85
      assertThat(item.montoItem()).isEqualByComparingTo("85.00");
    }

    @Test
    @DisplayName("retencion en el item es null cuando no hay ISR ni ITBIS retenidos")
    void retencion_null_cuandoSinRetenciones() {
      MfFacturaSuplidor f = facturaFake();
      MfFacturaSuplidorDetalle d =
          detalleFake(TASA_1, BigDecimal.valueOf(100), BigDecimal.valueOf(18), null, "ACT");
      d.setRetencion(null);
      d.setMontoItbisRetenido(null);
      f.getDetalles().add(d);

      Item item = mapper.mapDetallesItems41(f).item().get(0);

      assertThat(item.retencion()).isNull();
    }

    @Test
    @DisplayName("retencion en el item se construye cuando hay ISR retenido")
    void retencion_construida_cuandoIsrRetenido() {
      MfFacturaSuplidor f = facturaFake();
      MfFacturaSuplidorDetalle d =
          detalleFake(TASA_1, BigDecimal.valueOf(100), BigDecimal.valueOf(18), null, "ACT");
      d.setRetencion(BigDecimal.valueOf(20));
      f.getDetalles().add(d);

      Item item = mapper.mapDetallesItems41(f).item().get(0);

      assertThat(item.retencion()).isNotNull();
      assertThat(item.retencion().montoISRRetenido()).isEqualByComparingTo("20.00");
    }

    @Test
    @DisplayName("retencion en el item se construye cuando hay ITBIS retenido")
    void retencion_construida_cuandoItbisRetenido() {
      MfFacturaSuplidor f = facturaFake();
      MfFacturaSuplidorDetalle d =
          detalleFake(TASA_1, BigDecimal.valueOf(100), BigDecimal.valueOf(18), null, "ACT");
      d.setMontoItbisRetenido(BigDecimal.valueOf(5));
      f.getDetalles().add(d);

      Item item = mapper.mapDetallesItems41(f).item().get(0);

      assertThat(item.retencion()).isNotNull();
      assertThat(item.retencion().montoITBISRetenido()).isEqualByComparingTo("5.00");
    }

    @Test
    @DisplayName("tablaSubDescuento es null cuando el detalle no tiene descuentos")
    void tablaSubDescuento_null_cuandoSinDescuentos() {
      MfFacturaSuplidor f = facturaFake();
      MfFacturaSuplidorDetalle d =
          detalleFake(TASA_1, BigDecimal.valueOf(100), BigDecimal.valueOf(18), null, "ACT");
      d.setDescuentos(new ArrayList<>());
      f.getDetalles().add(d);

      Item item = mapper.mapDetallesItems41(f).item().get(0);

      assertThat(item.tablaSubDescuento()).isNull();
    }

    @Test
    @DisplayName("tablaSubDescuento se construye con los descuentos del detalle")
    void tablaSubDescuento_construida_cuandoHayDescuentos() {
      MfFacturaSuplidor f = facturaFake();
      MfFacturaSuplidorDetalle d =
          detalleFake(
              TASA_1,
              BigDecimal.valueOf(100),
              BigDecimal.valueOf(18),
              BigDecimal.valueOf(10),
              "ACT");
      d.setDescuentos(List.of(descuentoFake("%", BigDecimal.valueOf(10), BigDecimal.valueOf(10))));
      f.getDetalles().add(d);

      Item item = mapper.mapDetallesItems41(f).item().get(0);

      assertThat(item.tablaSubDescuento()).isNotNull();
      assertThat(item.tablaSubDescuento().subDescuento()).hasSize(1);
      assertThat(item.tablaSubDescuento().subDescuento().get(0).tipoSubDescuento()).isEqualTo("%");
    }

    @Test
    @DisplayName("precioUnitario se formatea con 4 decimales")
    void precioUnitario_formateadoCon4Decimales() {
      MfFacturaSuplidor f = facturaFake();
      MfFacturaSuplidorDetalle d =
          detalleFake(TASA_1, BigDecimal.valueOf(100), BigDecimal.valueOf(18), null, "ACT");
      d.setPrecioUnitario(new BigDecimal("99.9"));
      f.getDetalles().add(d);

      Item item = mapper.mapDetallesItems41(f).item().get(0);

      assertThat(item.precioUnitarioItem().scale()).isEqualTo(4);
      assertThat(item.precioUnitarioItem()).isEqualByComparingTo("99.9000");
    }

    @Test
    @DisplayName("indicadorFacturacion viene del id del itbisObj del detalle")
    void indicadorFacturacion_desdeItbisObj() {
      MfFacturaSuplidor f = facturaFake();
      f.getDetalles()
          .add(detalleFake(TASA_2, BigDecimal.valueOf(100), BigDecimal.valueOf(16), null, "ACT"));

      Item item = mapper.mapDetallesItems41(f).item().get(0);

      assertThat(item.indicadorFacturacion()).isEqualTo(TASA_2);
    }

    @Test
    @DisplayName("numeroLinea incremental comenzando en 1")
    void numeroLinea_incremental() {
      MfFacturaSuplidor f = facturaFake();
      f.getDetalles()
          .add(detalleFake(TASA_1, BigDecimal.valueOf(50), BigDecimal.valueOf(9), null, "ACT"));
      f.getDetalles()
          .add(detalleFake(TASA_1, BigDecimal.valueOf(50), BigDecimal.valueOf(9), null, "ACT"));
      f.getDetalles()
          .add(detalleFake(TASA_1, BigDecimal.valueOf(50), BigDecimal.valueOf(9), null, "ACT"));

      List<Item> items = mapper.mapDetallesItems41(f).item();

      assertThat(items.get(0).numeroLinea()).isEqualTo(1);
      assertThat(items.get(1).numeroLinea()).isEqualTo(2);
      assertThat(items.get(2).numeroLinea()).isEqualTo(3);
    }
  }
}
