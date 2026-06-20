import * as Yup from "yup";

export const ticketSchema = Yup.object({
    titulo: Yup.string()
        .required("El título es obligatorio")
        .max(200, "Máximo 200 caracteres"),
    descripcion: Yup.string()
        .required("La descripción es obligatoria"),
    prioridadId: Yup.string()
        .required("Selecciona una prioridad"),
    fechaLimite: Yup.string().nullable().optional(),
});

export const comentarioSchema = Yup.object({
    contenido: Yup.string()
        .required("El comentario no puede estar vacío"),
});
