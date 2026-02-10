package com.braintech.eFacturador.util;

import com.braintech.eFacturador.models.PagesResult;
import org.springframework.data.domain.Page;

public class PageableUtils {

  public static PagesResult getPagesResult(Page page) {
    page.getTotalPages();

    return PagesResult.builder()
        .page(page.getNumber())
        .size(page.getSize())
        .totalPage(page.getTotalPages())
        .totalElements(page.getTotalElements())
        .content(page.getContent())
        .build();
  }
}
