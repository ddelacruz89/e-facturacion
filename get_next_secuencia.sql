CREATE OR REPLACE FUNCTION general.get_next_secuencia(
    p_empresa_id INT,
    p_aplicacion_id VARCHAR
)
RETURNS INT AS $$
DECLARE
    v_numero INT;
BEGIN
    -- Bloquea la fila para evitar race conditions
    SELECT numero
    INTO v_numero
    FROM general.mg_secuencias
    WHERE empresa_id = p_empresa_id
      AND aplicacion_id = p_aplicacion_id
    FOR UPDATE;

    IF v_numero IS NULL THEN
        -- Si no existe la fila, insertamos con valor inicial 1
        INSERT INTO general.mg_secuencias(empresa_id, aplicacion_id, numero)
        VALUES (p_empresa_id, p_aplicacion_id, 1)
        RETURNING numero INTO v_numero;
    ELSE
        -- Incrementamos el valor
        v_numero := v_numero + 1;
        UPDATE general.mg_secuencias
        SET numero = v_numero
        WHERE empresa_id = p_empresa_id
          AND aplicacion_id = p_aplicacion_id;
    END IF;

    RETURN v_numero;
END;
$$ LANGUAGE plpgsql;


-- DROP FUNCTION "general".get_next_secuencia(int4, varchar);

CREATE OR REPLACE FUNCTION general.get_next_secuencia_ecf(p_empresa_id integer, p_tipo_comprobante character varying)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_secuencia INT;
BEGIN
    -- Bloquea la fila para evitar race conditions
    SELECT secuencia
    INTO v_secuencia
    FROM general.mg_secuencia_comprobante
    WHERE empresa_id = p_empresa_id
      AND tipo_comprobante_id = p_tipo_comprobante
    FOR UPDATE;

    IF v_secuencia IS NULL THEN
        -- Si no existe la fila, insertamos con valor inicial 1
        INSERT INTO general.mg_secuencia_comprobante(empresa_id, tipo_comprobante_id, secuencia)
        VALUES (p_empresa_id, p_tipo_comprobante, 1)
        RETURNING secuencia INTO v_secuencia;
    ELSE
        -- Incrementamos el valor
        v_secuencia := v_secuencia + 1;
        UPDATE general.mg_secuencia_comprobante
        SET secuencia = v_secuencia
        WHERE empresa_id = p_empresa_id
          AND tipo_comprobante_id = p_tipo_comprobante;
    END IF;

    RETURN v_secuencia ;
END;
$function$
;
