package com.braintech.eFacturador.seguridad.model;

import java.util.List;

public class LoginResponse {
  private String token;
  private String username;
  private String message;

  public LoginResponse() {}

  public LoginResponse(String message) {
    this.message = message;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  private Integer empresaId;
  private Integer sucursalId;
  private String sucursalNombre;
  private String empresaNombre;

  // Flujo multi-sucursal: cuando el usuario tiene acceso a más de una sucursal
  private Boolean requiresSucursalSelection;
  private String preAuthToken;
  private List<SucursalOpcionDTO> sucursalesDisponibles;

  // Flujo soporte: el JWT lleva esSoporte=true y el frontend muestra el banner
  private Boolean esSoporte;

  // Flujo soporte multi-empresa: cuando el usuario soporte tiene grants en más de una empresa
  private Boolean requiresEmpresaSoporteSelection;
  private List<EmpresaSoporteOpcionDTO> empresasSoporteDisponibles;

  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public Integer getEmpresaId() {
    return empresaId;
  }

  public void setEmpresaId(Integer empresaId) {
    this.empresaId = empresaId;
  }

  public Integer getSucursalId() {
    return sucursalId;
  }

  public void setSucursalId(Integer sucursalId) {
    this.sucursalId = sucursalId;
  }

  public String getSucursalNombre() {
    return sucursalNombre;
  }

  public void setSucursalNombre(String sucursalNombre) {
    this.sucursalNombre = sucursalNombre;
  }

  public String getEmpresaNombre() {
    return empresaNombre;
  }

  public void setEmpresaNombre(String empresaNombre) {
    this.empresaNombre = empresaNombre;
  }

  public Boolean getRequiresSucursalSelection() {
    return requiresSucursalSelection;
  }

  public void setRequiresSucursalSelection(Boolean requiresSucursalSelection) {
    this.requiresSucursalSelection = requiresSucursalSelection;
  }

  public String getPreAuthToken() {
    return preAuthToken;
  }

  public void setPreAuthToken(String preAuthToken) {
    this.preAuthToken = preAuthToken;
  }

  public List<SucursalOpcionDTO> getSucursalesDisponibles() {
    return sucursalesDisponibles;
  }

  public void setSucursalesDisponibles(List<SucursalOpcionDTO> sucursalesDisponibles) {
    this.sucursalesDisponibles = sucursalesDisponibles;
  }

  public Boolean getEsSoporte() {
    return esSoporte;
  }

  public void setEsSoporte(Boolean esSoporte) {
    this.esSoporte = esSoporte;
  }

  public Boolean getRequiresEmpresaSoporteSelection() {
    return requiresEmpresaSoporteSelection;
  }

  public void setRequiresEmpresaSoporteSelection(Boolean requiresEmpresaSoporteSelection) {
    this.requiresEmpresaSoporteSelection = requiresEmpresaSoporteSelection;
  }

  public List<EmpresaSoporteOpcionDTO> getEmpresasSoporteDisponibles() {
    return empresasSoporteDisponibles;
  }

  public void setEmpresasSoporteDisponibles(
      List<EmpresaSoporteOpcionDTO> empresasSoporteDisponibles) {
    this.empresasSoporteDisponibles = empresasSoporteDisponibles;
  }
}
