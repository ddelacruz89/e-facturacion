package com.braintech.eFacturador.seguridad.model;

public class LoginResponse {
  private String token;
  private String username;
  private Integer empresaId;
  private Integer sucursalId;

  // getters y setters
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
}
