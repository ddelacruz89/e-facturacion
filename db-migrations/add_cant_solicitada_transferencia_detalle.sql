-- Agrega columna para registrar la cantidad solicitada originalmente en transferencias.
-- cant = cantidad realmente transferida (puede ser menor si habia stock insuficiente al guardar).
-- cant_solicitada = cantidad que el usuario pidio transferir.
ALTER TABLE inventario.in_transferecias_detalles
    ADD COLUMN IF NOT EXISTS cant_solicitada INTEGER;

-- Retrocompatibilidad: las filas existentes tienen cant_solicitada = cant.
UPDATE inventario.in_transferecias_detalles
SET cant_solicitada = cant
WHERE cant_solicitada IS NULL;
