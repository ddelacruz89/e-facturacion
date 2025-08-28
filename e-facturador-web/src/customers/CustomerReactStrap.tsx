import React, { forwardRef } from "react";
import { Controller, Control, FieldError } from "react-hook-form";
import { Col, FormGroup, Label, Input, FormFeedback, InputProps } from "reactstrap";
import { NumericFormat, NumberFormatValues } from "react-number-format";
import { JSX } from "react/jsx-runtime";
// Tipo restringido: solo permite del 1 al 12
type Size = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type InputType = "text" | "select" | "number" | "email" | "password";

type BaseProps = {
  name: string;
  label: string;
  control: Control<any>;
  type?: InputType;
  error?: FieldError;
  rules?: object;
  size?: Size;
} & InputProps;

// ───────────────────────────────────────────────
// NumericInput
// ───────────────────────────────────────────────
export function NumericInput({ name, label, control, error, rules, size = 12, ...rest }: BaseProps) {
  return (
    <Col md={size}>
      <FormGroup>
        <Label for={name}>{label}</Label>
        <Controller
          name={name}
          control={control}
          rules={{
            pattern: {
              value: /^[0-9]+$/,
              message: "Solo se permiten números"
            },
            ...rules
          }}
          render={({ field }) => (
            <>
              <Input
                {...field}
                {...rest}
                type="text"
                bsSize='sm'
                id={name}
                invalid={!!error}
                onKeyDown={(e) => {
                  const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"];
                  if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("Text");
                  if (!/^\d+$/.test(text)) e.preventDefault();
                }}
              />
              {error && <FormFeedback>{error.message}</FormFeedback>}
            </>
          )}
        />
      </FormGroup>
    </Col>
  );
}

// ───────────────────────────────────────────────
// AlphanumericInput
// ───────────────────────────────────────────────
export function AlphanumericInput({ type, name, label, control, error, rules, size = 12, ...rest }: BaseProps) {
  return (
    <Col md={size}>
      <FormGroup>
        <Label for={name}>{label}</Label>
        <Controller
          name={name}
          control={control}
          rules={{

            ...rules
          }}
          render={({ field }) => (
            <>
              <Input
                {...field}
                {...rest}
                type={type || "text"}
                bsSize='sm'
                id={name}
                invalid={!!error}
              />
              {error && <FormFeedback>{error.message}</FormFeedback>}
            </>
          )}
        />
      </FormGroup>
    </Col>
  );
}

// ───────────────────────────────────────────────
// SelectInput
// ───────────────────────────────────────────────
type Option = { value: string; label: string };
type SelectProps = BaseProps & { options: Option[] };

export function SelectInput({ name, label, control, error, options, rules, size = 12, ...rest }: SelectProps) {
  return (
    <Col md={size}>
      <FormGroup>
        <Label for={name}>{label}</Label>
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field }) => (
            <>
              <Input
                {...field}
                {...rest}
                type="select"
                bsSize='sm'
                id={name}
                invalid={!!error}
              >
                <option value="">Selecciona una opción</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Input>
              {error && <FormFeedback>{error.message}</FormFeedback>}
            </>
          )}
        />
      </FormGroup>
    </Col>
  );
}

// ───────────────────────────────────────────────
// MoneyInput
// ───────────────────────────────────────────────
export function MoneyInput({
  name,
  label,
  control,
  error,
  rules,
  size = 12,
  ...rest
}: BaseProps) {
  const CustomInput = forwardRef<HTMLInputElement, any>((props, ref) => (
    <Input bsSize='sm' {...props} innerRef={ref} />
  ));
  return (
    <Col md={size}>
      <FormGroup>
        <Label for={name}>{label}</Label>
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field }) => (
            <NumericFormat
              decimalScale={2}
              fixedDecimalScale
              value={field.value}
              // displayType="text"
              thousandSeparator=","
              type="text"
              prefix={"RD$ "}
              customInput={CustomInput}
            />
          )}
        />
      </FormGroup>
    </Col>
  );
}