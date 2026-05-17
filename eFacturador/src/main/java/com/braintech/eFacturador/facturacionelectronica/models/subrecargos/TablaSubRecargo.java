package com.braintech.eFacturador.facturacionelectronica.models.subrecargos;

import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class TablaSubRecargo {
  private List<SubRecargo> subRecargo;
}
