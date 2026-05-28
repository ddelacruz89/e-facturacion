-- Elimina el FK incorrecto creado por Hibernate cuando MgProducto tenía
-- @OneToMany @JoinColumn(name = "producto_unidad_suplidor_id") incorrecto.
-- Ese mapeo hacía que Hibernate generara un FK desde mg_producto_almacen_limite
-- hacia mg_producto.id, cuando la intención correcta es apuntar a
-- mg_producto_unidad_suplidor.id (constraint fkfllti9jpqb2o5jrydp80hoxrw, ya correcto).

ALTER TABLE producto.mg_producto_almacen_limite
    DROP CONSTRAINT IF EXISTS fkj575f0eicp2aw1vjrprq986gs;
