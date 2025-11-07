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
