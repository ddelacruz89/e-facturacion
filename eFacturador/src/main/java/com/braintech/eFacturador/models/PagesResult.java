package com.braintech.eFacturador.models;

import lombok.Builder;

@Builder
public record PagesResult<T>(
    Integer page, Integer size, Integer totalPage, Long totalElements, T content) {}
