-- Propósito: Segregar alertas por menú de permisos.
-- NULL = alerta global visible para todos.
-- Valor = URL del menú (sg_menu.url) al que pertenece esta alerta;
--         solo la ven usuarios que tienen puedeLeer=true en ese menú.
ALTER TABLE general.sg_notificacion
    ADD COLUMN menu_url_origen VARCHAR(200) NULL;

COMMENT ON COLUMN general.sg_notificacion.menu_url_origen IS
    'URL del menú origen (sg_menu.url). NULL = visible para todos. '
    'Si tiene valor, solo usuarios con permiso de lectura en ese menú la ven.';
