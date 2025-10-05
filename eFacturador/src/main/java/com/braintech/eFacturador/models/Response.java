package com.braintech.eFacturador.models;

import com.braintech.eFacturador.exceptions.DataNotFondException;
import lombok.Builder;
import org.springframework.http.HttpStatus;

@Builder
public record Response<T>(HttpStatus status, T content, DataNotFondException error) {}
