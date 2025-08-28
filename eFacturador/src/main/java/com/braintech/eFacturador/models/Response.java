package com.braintech.eFacturador.models;

import lombok.Builder;
import org.springframework.http.HttpStatus;
@Builder
public record Response<T>(HttpStatus status, T content, Throwable error) {
}
