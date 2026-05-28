-- =============================================================================
-- Seed: 1000 productos de prueba con suplidores, unidades y límites de almacén
-- Tablas:
--   producto.mg_producto                       — producto base
--   producto.mg_producto_unidad_suplidor       — unidad / fracción (unidad_id=1)
--   producto.mg_producto_suplidor              — precios por suplidor (±5%)
--   producto.mg_producto_almacen_limite        — límites para almacén 1 y 2
--
-- Supuestos (ajusta si difieren en tu ambiente):
--   empresa_id        = 1
--   itbis_id          = 1   (primer ITBIS activo; cámbialo si corresponde)
--   categoria_id      = 5   (Producto)
--   unidad_fraccion_id = 1  (unidad 1 como fracción)
--   unidad_id         = 1  (unidad 1 como unidad)
--   almacen_id        = 1 y 2  (sucursal 1)
--   Suplidores        se leen dinámicamente de inventario.in_suplidor
--
-- Nombres: 50 tipos × 20 variantes = 1000 nombres únicos
-- Suplidores por producto: 2 a 5 (random)
-- Variación de precio entre suplidores: ±5% del precio base
-- =============================================================================

DO $$
DECLARE
    v_prod_id          INTEGER;
    v_unit_sup_id      INTEGER;
    v_base_price       NUMERIC(16,2);
    v_price_var        NUMERIC(16,2);
    v_sup_count        INTEGER;
    v_sup_ids          INTEGER[];
    v_all_sup_ids      INTEGER[];
    v_prod_name        TEXT;
    v_barcode          TEXT;
    v_tipo_idx         INTEGER;
    v_marca_idx        INTEGER;
    v_seq_prod         INTEGER;   -- base de secuencia para mg_producto
    v_seq_us           INTEGER;   -- base de secuencia para mg_producto_unidad_suplidor
    v_seq_sup          INTEGER;   -- contador para mg_producto_suplidor
    v_seq_lim          INTEGER;   -- contador para mg_producto_almacen_limite
    i                  INTEGER;
    p                  INTEGER;

    -- 50 tipos de producto
    v_tipos TEXT[] := ARRAY[
        'Aceite de Oliva',      'Aceite de Girasol',     'Aceite de Maíz',       'Aceite de Coco',        'Aceite Mineral',
        'Arroz Largo',          'Arroz Redondo',          'Arroz Integral',        'Azúcar Blanca',         'Azúcar Morena',
        'Café Molido',          'Café en Grano',          'Harina de Trigo',       'Harina de Maíz',        'Avena en Hojuelas',
        'Leche Entera',         'Leche Descremada',       'Leche Evaporada',       'Pasta Espagueti',        'Pasta Penne',
        'Jabón de Tocador',     'Jabón Líquido',          'Detergente en Polvo',   'Detergente Líquido',     'Cloro Concentrado',
        'Suavizante de Ropa',   'Limpiavidrios',          'Desengrasante',         'Desinfectante',          'Ambientador',
        'Tornillos Autorroscantes','Tornillos Hexagonales', 'Tuercas Hexagonales',  'Clavos 2 pulgadas',      'Clavos 3 pulgadas',
        'Bisagras de Puerta',   'Cerradura de Seguridad', 'Pintura Látex',         'Pintura al Aceite',      'Sellador Acrílico',
        'Cable Eléctrico 12AWG','Cable Eléctrico 14AWG',  'Breaker Termomagnético','Tomacorriente Doble',    'Interruptor Simple',
        'Tubo PVC 1/2 pulgada', 'Tubo PVC 3/4 pulgada',  'Codo PVC 90°',          'Tee PVC',                'Trampa PVC'
    ];

    -- 20 variantes de línea
    v_marcas TEXT[] := ARRAY[
        'Premium',  'Gold',    'Plus',    'Max',     'Pro',
        'Elite',    'Basic',   'Economy', 'Classic', 'Ultra',
        'Super',    'Master',  'Expert',  'Eco',     'Flex',
        'Fuerte',   'Rápido',  'Limpio',  'Natural', 'Duro'
    ];

BEGIN

    -- -----------------------------------------------------------------------
    -- Offsets de secuencia para no pisar registros existentes
    -- -----------------------------------------------------------------------
    SELECT COALESCE(MAX(secuencia), 0) INTO v_seq_prod
    FROM producto.mg_producto WHERE empresa_id = 1;

    SELECT COALESCE(MAX(secuencia), 0) INTO v_seq_us
    FROM producto.mg_producto_unidad_suplidor WHERE empresa_id = 1;

    SELECT COALESCE(MAX(secuencia), 0) INTO v_seq_sup
    FROM producto.mg_producto_suplidor WHERE empresa_id = 1;

    SELECT COALESCE(MAX(secuencia), 0) INTO v_seq_lim
    FROM producto.mg_producto_almacen_limite WHERE empresa_id = 1;

    -- -----------------------------------------------------------------------
    -- IDs de todos los suplidores activos de la empresa
    -- -----------------------------------------------------------------------
    SELECT ARRAY(
        SELECT id
        FROM inventario.in_suplidor
        WHERE empresa_id = 1 AND activo = true
        ORDER BY id
    ) INTO v_all_sup_ids;

    IF array_length(v_all_sup_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'No hay suplidores activos para empresa_id = 1. Ejecuta seed_100_suplidores.sql primero.';
    END IF;

    -- -----------------------------------------------------------------------
    -- Loop principal: 1000 productos
    -- Nombres: tipo[CEIL(p/20)] × marca[(p-1) % 20 + 1]  → 50×20 = 1000 únicos
    -- -----------------------------------------------------------------------
    FOR p IN 1..1000 LOOP

        v_tipo_idx  := CEIL(p::NUMERIC / 20)::INTEGER;        -- 1..50
        v_marca_idx := ((p - 1) % 20) + 1;                    -- 1..20
        v_prod_name := v_tipos[v_tipo_idx] || ' ' || v_marcas[v_marca_idx];

        -- Precio base: RD$50 – RD$5,000
        v_base_price := ROUND((50.00 + RANDOM() * 4950.00)::NUMERIC, 2);

        -- -------------------------------------------------------------------
        -- 1) mg_producto
        -- -------------------------------------------------------------------
        INSERT INTO producto.mg_producto (
            empresa_id, secuencia, usuario_reg, fecha_reg, activo,
            nombre_producto, descripcion,
            existencia, precio_venta, precio_minimo, precio_costo_avg, precio,
            trabajador, comision,
            itbis_id, categoria_id
        ) VALUES (
            1,
            v_seq_prod + p,
            'admin', NOW(), true,
            v_prod_name,
            v_prod_name || ' — producto de prueba generado automáticamente',
            0,
            ROUND(v_base_price * 1.35, 2),   -- precio_venta  (+35%)
            ROUND(v_base_price * 1.20, 2),   -- precio_minimo (+20%)
            v_base_price,                     -- precio_costo_avg
            v_base_price,                     -- precio
            false,
            0,
            1,   -- itbis_id   (ajustar si el id activo en tu BD es diferente)
            5    -- categoria_id = Producto
        ) RETURNING id INTO v_prod_id;

        -- -------------------------------------------------------------------
        -- 2) mg_producto_unidad_suplidor  (unidad 1 para fracción y unidad)
        -- -------------------------------------------------------------------
        INSERT INTO producto.mg_producto_unidad_suplidor (
            empresa_id, secuencia, usuario_reg, fecha_reg, activo,
            disponible_compra, disponible_venta,
            unidad_fraccion_id, unidad_id,
            cantidad, producto_id
        ) VALUES (
            1,
            v_seq_us + p,
            'admin', NOW(), true,
            true, true,
            1, 1,   -- unidad 1 como fracción y como unidad
            1,
            v_prod_id
        ) RETURNING id INTO v_unit_sup_id;

        -- -------------------------------------------------------------------
        -- 3) mg_producto_suplidor  — 2 a 5 suplidores random por producto
        --    Precio dentro del ±5% del precio base
        -- -------------------------------------------------------------------
        v_sup_count := 2 + FLOOR(RANDOM() * 4)::INTEGER;   -- [2..5]

        SELECT ARRAY(
            SELECT unnest(v_all_sup_ids)
            ORDER BY RANDOM()
            LIMIT v_sup_count
        ) INTO v_sup_ids;

        FOR i IN 1..array_length(v_sup_ids, 1) LOOP
            -- variación aleatoria dentro de ±5%
            v_price_var := ROUND((v_base_price * (0.95 + RANDOM() * 0.10))::NUMERIC, 2);
            v_seq_sup   := v_seq_sup + 1;

            INSERT INTO producto.mg_producto_suplidor (
                empresa_id, secuencia, usuario_reg, fecha_reg, activo,
                precio, itbis_default,
                suplidor_id, estado_id,
                producto_suplidor_id
            ) VALUES (
                1, v_seq_sup,
                'admin', NOW(), true,
                v_price_var,
                true,
                v_sup_ids[i],
                'A',
                v_unit_sup_id
            );
        END LOOP;

        -- -------------------------------------------------------------------
        -- 4) mg_producto_almacen_limite — almacén 1 y almacén 2 (sucursal 1)
        --    Límite: entre 50 y 500 unidades (random)
        -- -------------------------------------------------------------------
        v_seq_lim := v_seq_lim + 1;
        INSERT INTO producto.mg_producto_almacen_limite (
            empresa_id, secuencia, usuario_reg, fecha_reg, activo,
            limite, almacen_id,
            producto_unidad_suplidor_id
        ) VALUES (
            1, v_seq_lim,
            'admin', NOW(), true,
            50 + FLOOR(RANDOM() * 451)::INTEGER,
            1,
            v_unit_sup_id
        );

        v_seq_lim := v_seq_lim + 1;
        INSERT INTO producto.mg_producto_almacen_limite (
            empresa_id, secuencia, usuario_reg, fecha_reg, activo,
            limite, almacen_id,
            producto_unidad_suplidor_id
        ) VALUES (
            1, v_seq_lim,
            'admin', NOW(), true,
            50 + FLOOR(RANDOM() * 451)::INTEGER,
            2,                              -- almacén 2
            v_unit_sup_id
        );

    END LOOP;

    RAISE NOTICE 'Seed completado: 1000 productos | ~3000 registros de suplidor | 2000 límites de almacén.';
END $$;
