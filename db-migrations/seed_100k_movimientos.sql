-- =============================================================================
-- Seed: 100 000 movimientos de inventario
-- Schema: inventario.in_movimientos
-- El trigger trg_actualiza_inventario actualiza in_inventarios automaticamente.
--
-- Relacion almacen->sucursal se respeta: cada almacen lleva su sucursal_id
-- tal como esta registrado en inventario.in_almacenes.sucursal_id.
--
--   Sucursal 1 -> Almacenes 1, 2
--   Sucursal 2 -> Almacenes 3, 4
--
-- Fases:
--   Fase 1 — Ajuste Inicial (tipo 10): todos los productos x todos los almacenes
--            (la sucursal se toma del almacen). Stock base 3000-7000 uds.
--   Fase 2 — Hasta 100 000 movimientos mixtos (2023-02 a 2026-07).
-- =============================================================================

DO $$
DECLARE
    -- Productos
    v_prod_ids   INTEGER[];
    v_prod_count INTEGER;

    -- Arrays paralelos almacen <-> sucursal (mismo indice = mismo almacen)
    v_alm_ids     INTEGER[];
    v_alm_suc_ids INTEGER[];   -- sucursal_id del almacen en el mismo indice
    v_alm_count   INTEGER;

    -- Variables de trabajo
    v_idx          INTEGER;
    v_alm_idx      INTEGER;
    v_alm_idx_dest INTEGER;
    v_prod_id      INTEGER;
    v_sucursal_id  INTEGER;
    v_almacen_id   INTEGER;
    v_almacen_dest INTEGER;
    v_suc_dest     INTEGER;
    v_tipo         INTEGER;
    v_qty          INTEGER;
    v_fecha        TIMESTAMP;
    v_lote         VARCHAR(45);
    v_ref_id       INTEGER;
    v_obs          TEXT;
    v_roll         DOUBLE PRECISION;
    v_roll2        DOUBLE PRECISION;
    i              INTEGER;

    -- Contadores
    v_total  INTEGER := 0;
    v_target CONSTANT INTEGER := 100000;

    -- Rango de fechas
    v_fecha_min CONSTANT TIMESTAMP := '2023-02-01 08:00:00';
    v_fecha_max CONSTANT TIMESTAMP := '2026-07-28 18:00:00';
    v_rango     INTERVAL;

BEGIN
    v_rango := v_fecha_max - v_fecha_min;

    -- -----------------------------------------------------------------------
    -- Cargar catalogos
    -- -----------------------------------------------------------------------
    SELECT ARRAY(SELECT id FROM producto.mg_producto WHERE empresa_id = 1 ORDER BY id)
    INTO v_prod_ids;
    v_prod_count := COALESCE(array_length(v_prod_ids, 1), 0);

    -- Carga paralela: almacen y su sucursal correspondiente
    SELECT
        ARRAY(SELECT id          FROM inventario.in_almacenes WHERE empresa_id = 1 ORDER BY id),
        ARRAY(SELECT sucursal_id FROM inventario.in_almacenes WHERE empresa_id = 1 ORDER BY id)
    INTO v_alm_ids, v_alm_suc_ids;
    v_alm_count := COALESCE(array_length(v_alm_ids, 1), 0);

    RAISE NOTICE '--- Catalogos ---';
    RAISE NOTICE 'Productos : %', v_prod_count;
    RAISE NOTICE 'Almacenes : % -> ids=%  sucs=%', v_alm_count, v_alm_ids::TEXT, v_alm_suc_ids::TEXT;

    IF v_prod_count = 0 THEN RAISE EXCEPTION 'Sin productos para empresa_id=1.'; END IF;
    IF v_alm_count  = 0 THEN RAISE EXCEPTION 'Sin almacenes para empresa_id=1.'; END IF;

    -- =========================================================================
    -- FASE 1: Ajuste Inicial (tipo 10) — base de inventario
    --         1000 productos x N almacenes  (sucursal segun el almacen)
    -- =========================================================================
    FOR i IN 1..v_prod_count LOOP
        FOR v_alm_idx IN 1..v_alm_count LOOP
            v_fecha       := '2023-01-01 08:00:00'::TIMESTAMP + (RANDOM() * INTERVAL '25 days');
            v_qty         := 3000 + FLOOR(RANDOM() * 4001)::INTEGER;
            v_almacen_id  := v_alm_ids[v_alm_idx];
            v_sucursal_id := v_alm_suc_ids[v_alm_idx];

            INSERT INTO inventario.in_movimientos (
                empresa_id, sucursal_id, usuario_reg, fecha_reg, estado_id,
                tipo_movimiento_id,
                almacen_id, producto_id,
                cantidad, precio_unitario, costo_total, observacion, lote
            ) VALUES (
                1, v_sucursal_id, 'admin', v_fecha, 'ACT',
                10,
                v_almacen_id, v_prod_ids[i],
                v_qty, 0, 0, 'Inventario inicial seed', NULL
            );

            v_total := v_total + 1;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Fase 1 OK: % ajustes iniciales.', v_total;

    -- =========================================================================
    -- FASE 2: movimientos mixtos hasta 100 000
    -- Para cada movimiento se elige un almacen al azar y se toma su sucursal.
    -- =========================================================================
    WHILE v_total < v_target LOOP

        -- Elegir almacen al azar y tomar su sucursal correcta
        v_alm_idx     := 1 + FLOOR(RANDOM() * v_alm_count)::INTEGER;
        v_almacen_id  := v_alm_ids[v_alm_idx];
        v_sucursal_id := v_alm_suc_ids[v_alm_idx];

        -- Producto al azar
        v_idx     := 1 + FLOOR(RANDOM() * v_prod_count)::INTEGER;
        v_prod_id := v_prod_ids[v_idx];

        -- Fecha aleatoria en el rango
        v_fecha := v_fecha_min + (RANDOM() * v_rango);

        -- Lote (15% de los movimientos)
        v_lote := CASE
            WHEN RANDOM() < 0.15
            THEN 'L' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0')
            ELSE NULL
        END;

        v_ref_id := 1000 + FLOOR(RANDOM() * 89001)::INTEGER;
        v_roll   := RANDOM();

        -- ── 40% Salida por venta (tipo 1) ────────────────────────────────
        IF v_roll < 0.40 THEN
            v_qty := 1 + FLOOR(RANDOM() * 20)::INTEGER;
            INSERT INTO inventario.in_movimientos (
                empresa_id, sucursal_id, usuario_reg, fecha_reg, estado_id,
                tipo_movimiento_id, numero_referencia,
                almacen_id, producto_id, cantidad, lote
            ) VALUES (
                1, v_sucursal_id, 'admin', v_fecha, 'ACT',
                1, v_ref_id,
                v_almacen_id, v_prod_id, v_qty, v_lote
            );
            v_total := v_total + 1;

        -- ── 20% Orden Entrada (tipo 13) ───────────────────────────────────
        ELSIF v_roll < 0.60 THEN
            v_qty := 50 + FLOOR(RANDOM() * 251)::INTEGER;
            INSERT INTO inventario.in_movimientos (
                empresa_id, sucursal_id, usuario_reg, fecha_reg, estado_id,
                tipo_movimiento_id, numero_referencia,
                almacen_id, producto_id, cantidad, lote
            ) VALUES (
                1, v_sucursal_id, 'admin', v_fecha, 'ACT',
                13, v_ref_id,
                v_almacen_id, v_prod_id, v_qty, v_lote
            );
            v_total := v_total + 1;

        -- ── 15% Transferencia entre almacenes (tipos 3 + 2) ─────────────
        -- El almacen destino pertenece a otra sucursal si es posible,
        -- o al mismo indice +1 en el array (circular).
        ELSIF v_roll < 0.75 THEN
            v_alm_idx_dest := 1 + ((v_alm_idx % v_alm_count));
            v_almacen_dest := v_alm_ids[v_alm_idx_dest];
            v_suc_dest     := v_alm_suc_ids[v_alm_idx_dest];
            v_qty          := 10 + FLOOR(RANDOM() * 91)::INTEGER;
            v_ref_id       := 20000 + FLOOR(RANDOM() * 80001)::INTEGER;

            -- Salida del almacen origen
            INSERT INTO inventario.in_movimientos (
                empresa_id, sucursal_id, usuario_reg, fecha_reg, estado_id,
                tipo_movimiento_id, numero_referencia,
                almacen_id, producto_id, cantidad, observacion, lote
            ) VALUES (
                1, v_sucursal_id, 'admin', v_fecha, 'ACT',
                3, v_ref_id,
                v_almacen_id, v_prod_id, v_qty,
                'Transferencia salida hacia almacen ' || v_almacen_dest,
                v_lote
            );
            v_total := v_total + 1;

            -- Entrada al almacen destino (con su propia sucursal)
            INSERT INTO inventario.in_movimientos (
                empresa_id, sucursal_id, usuario_reg, fecha_reg, estado_id,
                tipo_movimiento_id, numero_referencia,
                almacen_id, producto_id, cantidad, observacion, lote
            ) VALUES (
                1, v_suc_dest, 'admin', v_fecha, 'ACT',
                2, v_ref_id,
                v_almacen_dest, v_prod_id, v_qty,
                'Transferencia entrada desde almacen ' || v_almacen_id,
                v_lote
            );
            v_total := v_total + 1;

        -- ── 10% Ajuste de inventario (tipo 4 / tipo 5) ───────────────────
        ELSIF v_roll < 0.85 THEN
            v_qty  := 5 + FLOOR(RANDOM() * 46)::INTEGER;
            v_tipo := CASE WHEN RANDOM() < 0.5 THEN 4 ELSE 5 END;
            INSERT INTO inventario.in_movimientos (
                empresa_id, sucursal_id, usuario_reg, fecha_reg, estado_id,
                tipo_movimiento_id,
                almacen_id, producto_id, cantidad, observacion
            ) VALUES (
                1, v_sucursal_id, 'admin', v_fecha, 'ACT',
                v_tipo,
                v_almacen_id, v_prod_id, v_qty, 'Ajuste de inventario'
            );
            v_total := v_total + 1;

        -- ── 5% Devolucion de cliente (tipo 6) ────────────────────────────
        ELSIF v_roll < 0.90 THEN
            v_qty := 1 + FLOOR(RANDOM() * 10)::INTEGER;
            INSERT INTO inventario.in_movimientos (
                empresa_id, sucursal_id, usuario_reg, fecha_reg, estado_id,
                tipo_movimiento_id, numero_referencia,
                almacen_id, producto_id, cantidad, observacion, lote
            ) VALUES (
                1, v_sucursal_id, 'admin', v_fecha, 'ACT',
                6, v_ref_id,
                v_almacen_id, v_prod_id, v_qty, 'Devolucion de cliente', v_lote
            );
            v_total := v_total + 1;

        -- ── 5% Anulacion (tipo 7) ─────────────────────────────────────────
        ELSIF v_roll < 0.95 THEN
            v_qty := 1 + FLOOR(RANDOM() * 10)::INTEGER;
            INSERT INTO inventario.in_movimientos (
                empresa_id, sucursal_id, usuario_reg, fecha_reg, estado_id,
                tipo_movimiento_id, numero_referencia,
                almacen_id, producto_id, cantidad, observacion
            ) VALUES (
                1, v_sucursal_id, 'admin', v_fecha, 'ACT',
                7, v_ref_id,
                v_almacen_id, v_prod_id, v_qty, 'Entrada por anulacion'
            );
            v_total := v_total + 1;

        -- ── 5% Otros tipos ────────────────────────────────────────────────
        ELSE
            v_qty   := 1 + FLOOR(RANDOM() * 20)::INTEGER;
            v_roll2 := RANDOM();
            v_tipo  := CASE
                WHEN v_roll2 < 0.15 THEN 8
                WHEN v_roll2 < 0.30 THEN 9
                WHEN v_roll2 < 0.45 THEN 11
                WHEN v_roll2 < 0.58 THEN 12
                WHEN v_roll2 < 0.68 THEN 14
                WHEN v_roll2 < 0.78 THEN 17
                WHEN v_roll2 < 0.88 THEN 19
                ELSE                     20
            END;
            v_obs := CASE v_tipo
                WHEN  8 THEN 'Orden de devolucion'
                WHEN  9 THEN 'Descargo por accidente'
                WHEN 11 THEN 'Entrada ajuste masivo'
                WHEN 12 THEN 'Salida ajuste masivo'
                WHEN 14 THEN 'Nota de credito'
                WHEN 17 THEN 'Entrada separacion lotes'
                WHEN 19 THEN 'Residuo de producto'
                WHEN 20 THEN 'Producto expirado'
                ELSE        'Movimiento varios'
            END;
            INSERT INTO inventario.in_movimientos (
                empresa_id, sucursal_id, usuario_reg, fecha_reg, estado_id,
                tipo_movimiento_id,
                almacen_id, producto_id, cantidad, observacion, lote
            ) VALUES (
                1, v_sucursal_id, 'admin', v_fecha, 'ACT',
                v_tipo,
                v_almacen_id, v_prod_id, v_qty, v_obs, v_lote
            );
            v_total := v_total + 1;

        END IF;

    END LOOP;

    RAISE NOTICE 'Seed completado: % movimientos generados.', v_total;

END $$;
