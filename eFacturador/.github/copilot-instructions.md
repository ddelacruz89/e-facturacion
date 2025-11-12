

1. Allways use contructor implementation for services instead of @Autowired. Prefer AllArgumentsConstructor.
2. Todos los  create tienen que tener empresas:
     a. con esta implementacion: _private final TenantContext tenantContext;_
3. For all the save, secuencias should be implemented follow the example from Categroria Create. Secuence que not be misused, thats means if secuence is comming with value means was generated, you can not call secuense again.
