-   Im using React 18
-   im using typescript
-   im using node 22
-   im using materiaUI 7.3.1

Reglas:

1. Cuando tenga un campo que sea llame secuencia sigue el siguiente patron
   <TextInputPk
                           control={control}
                           name="secuencia"
                           label="Codigo"
                           error={errors.secuencia}
                           size={2}
                       />
2. No crear componete para el campo id si existe el de secuencia

3. Para dinero total, subtotal, itbis, etc usa NumericFormat as example
   <NumericFormat
   decimalScale={2}
   fixedDecimalScale
   value={field?.value}
   displayType={"text"}
   thousandSeparator=","
   type="text"
   prefix={ "RD$ "}
   renderText={(value: any) => (
   <Input disabled={true} className="fw-bold text-end" bsSize="sm" value={value ?? 0} />
   )}
   />
