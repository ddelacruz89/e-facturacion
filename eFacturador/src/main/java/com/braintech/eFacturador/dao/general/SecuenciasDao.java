package com.braintech.eFacturador.dao.general;

import com.braintech.eFacturador.exceptions.ComprobanteSecuenciaException;
import com.braintech.eFacturador.exceptions.ComprobanteSecuenciaException.Motivo;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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

  public String getNextSecuenciaEcfValidada(int empresaId, String tipoComprobante) {
    Integer nextNumero =
        (Integer)
            entityManager
                .createNativeQuery(
                    "SELECT general.get_next_secuencia_ecf_validada(:empresaId, :tipoComprobante)")
                .setParameter("empresaId", empresaId)
                .setParameter("tipoComprobante", tipoComprobante)
                .getSingleResult();

    if (nextNumero == null || nextNumero == -1) {
      throw new ComprobanteSecuenciaException(
          Motivo.FECHA_EXPIRADA,
          "El comprobante tipo " + tipoComprobante + " tiene la fecha de vigencia expirada.");
    }
    if (nextNumero == -2) {
      throw new ComprobanteSecuenciaException(
          Motivo.COMPROBANTES_AGOTADOS,
          "No hay comprobantes disponibles para el tipo " + tipoComprobante + ".");
    }

    String serie = "E";
    String paddedNumber = String.format("%010d", nextNumero);

    return serie.concat(tipoComprobante).concat(paddedNumber);
  }
}
