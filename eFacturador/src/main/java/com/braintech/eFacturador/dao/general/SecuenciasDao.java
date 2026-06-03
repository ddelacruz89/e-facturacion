package com.braintech.eFacturador.dao.general;

import com.braintech.eFacturador.exceptions.ComprobanteSecuenciaException;
import com.braintech.eFacturador.exceptions.ComprobanteSecuenciaException.Motivo;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import org.springframework.stereotype.Repository;

@Repository
public class SecuenciasDao {

  @PersistenceContext private EntityManager entityManager;

  public int getNextSecuencia(int empresaId, String aplicacionId) {
    Integer nextNumero =
        (Integer)
            entityManager
                .createNativeQuery("SELECT general.get_next_secuencia(:empresaId, :aplicacionId)")
                .setParameter("empresaId", empresaId)
                .setParameter("aplicacionId", aplicacionId)
                .getSingleResult();

    return nextNumero != null ? nextNumero : 0;
  }

  public String getNextSecuenciaEcf(int empresaId, String tipoComprobante) {
    Integer nextNumero =
        (Integer)
            entityManager
                .createNativeQuery(
                    "SELECT general.get_next_secuencia_ecf(:empresaId, :tipoComprobante)")
                .setParameter("empresaId", empresaId)
                .setParameter("tipoComprobante", tipoComprobante)
                .getSingleResult();

    String serie = "E";
    String paddedNumber = String.format("%010d", nextNumero); // left-pad with zeros to 10 chars

    return serie.concat(tipoComprobante).concat(paddedNumber);
  }

  public SecuenciaEcfResult getNextSecuenciaEcfValidada(int empresaId, String tipoComprobante) {
    Object[] row =
        (Object[])
            entityManager
                .createNativeQuery(
                    "SELECT p_secuencia, p_fecha_valida"
                        + " FROM general.get_next_secuencia_ecf_validada(:empresaId, :tipoComprobante)")
                .setParameter("empresaId", empresaId)
                .setParameter("tipoComprobante", tipoComprobante)
                .getSingleResult();

    int secuencia = ((Number) row[0]).intValue();
    LocalDate fechaValida = row[1] != null ? ((java.sql.Date) row[1]).toLocalDate() : null;

    if (secuencia == -1) {
      throw new ComprobanteSecuenciaException(
          Motivo.FECHA_EXPIRADA,
          "El comprobante tipo " + tipoComprobante + " tiene la fecha de vigencia expirada.");
    }
    if (secuencia == -2) {
      throw new ComprobanteSecuenciaException(
          Motivo.COMPROBANTES_AGOTADOS,
          "No hay comprobantes disponibles para el tipo " + tipoComprobante + ".");
    }
    String ncf = "E" + tipoComprobante + String.format("%010d", secuencia);

    return new SecuenciaEcfResult(ncf, fechaValida);
  }
}
