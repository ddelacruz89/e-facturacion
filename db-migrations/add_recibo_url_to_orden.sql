-- URL o path del recibo de entrega (foto/imagen) subido por el conductor
ALTER TABLE despacho.de_orden_despacho
    ADD COLUMN IF NOT EXISTS recibo_url VARCHAR(500);
