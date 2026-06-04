package com.braintech.eFacturador.services;

import com.braintech.eFacturador.util.ReportGeneration;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportServices {
  final ReportGeneration reportGeneration;

  public byte[] getFacturaById(Integer id) {
    var params = new java.util.HashMap<String, Object>();
    params.put("p_id", id);
    return reportGeneration.generateReport(params, "repFactura.jasper");
  }
}
