package com.braintech.eFacturador.util;

import com.braintech.eFacturador.services.seguridad.EmpresaServices;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.util.JRLoader;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportGeneration {
  final JdbcTemplate jdbcTemplate;
  final EmpresaServices empresa;
  ;

  public byte[] generateReport(Map<String, Object> params, String rep) {
    try {

      String headerReporte = empresa.getCurrent().content().getReportePath();
      params.put("SUBREPORT_DIR", headerReporte);
      Connection conexion = Objects.requireNonNull(jdbcTemplate.getDataSource()).getConnection();
      String rutaReporte = String.join("\\", headerReporte, rep);
      log.info(rutaReporte);
      JasperReport jasperReport = (JasperReport) JRLoader.loadObjectFromFile(rutaReporte);
      JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, conexion);
      byte[] report = JasperExportManager.exportReportToPdf(jasperPrint);
      conexion.close();
      return report;
    } catch (JRException | SQLException ex) {
      log.error(ex.getMessage());
    }
    return null;
  }
}
