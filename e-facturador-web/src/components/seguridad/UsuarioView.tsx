import React, { useEffect } from 'react';
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';
import { Row, Form, Button } from 'reactstrap';
import { NumericInput, AlphanumericInput,SelectInput } from '../../customers/CustomerReactStrap';
import ActionBar from '../../customers/ActionBar';
import { getUsuario, saveUsuario } from '../../apis/UsuarioController';
import { SgUsuario } from '../../models/seguridad';


const UsuarioView = () => {
    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<SgUsuario>({
        defaultValues: {
            username: '',
            empresaId: 1,
            password: '',
            cambioPassword: true,
            nombre: '',
        },
    });


    const onSubmit: SubmitHandler<SgUsuario> = (data) => {
        saveUsuario(data)
            .then((response) => {
                setValue('username', response.username);
                setValue('empresaId', response.empresaId);
                setValue('password', response.password);
                setValue('cambioPassword', response.cambioPassword);
                setValue('nombre', response.nombre);
                alert("Usuario guardado correctamente");
            })
            .catch((error) => {
                console.error("Error al guardar el usuario:", error);
                alert("Error al guardar el usuario");
            });
    };

    const onError = (errors: FieldErrors<SgUsuario>) => {
        console.log("Errores de validación:", errors);
    };

    return (
        <main>
            <Form onSubmit={handleSubmit(onSubmit, onError)}>
                <ActionBar title='Usuario'>
                    <Button size='sm' color="primary" type="submit">Guardar</Button>
                    <Button size='sm' type="button">Nuevo</Button>
                </ActionBar>
                <section>
                    <Row>
                        <SelectInput
                            label='Empresa'
                            name="empresaId"
                            control={control}
                            error={errors.empresaId}
                            options={[
                                { value: '1', label: 'Cédula' },
                                { value: '2', label: 'Pasaporte' },
                                // Agrega más opciones según tus datos
                            ]}
                            rules={{
                                required: "Campo requerido",
                            }}
                            size={6}
                        />
                    </Row>
                    <Row>
                        <AlphanumericInput
                            label='Username'
                            size={6}
                            name="username"
                            control={control}
                            error={errors.username}
                            rules={{
                                required: "Campo requerido",
                                minLength: { value: 3, message: "Mínimo 3 caracteres" },
                                maxLength: { value: 50, message: "Máximo 50 caracteres" },
                            }}
                        />
                        {/* <NumericInput
                            label='Empresa ID'
                            size={6}
                            name="empresaId"
                            control={control}
                            error={errors.empresaId}
                            rules={{
                                min: { value: 1, message: "Debe ser mayor que 0" },
                            }}
                        /> */}
                    </Row>

                    <Row>
                        <AlphanumericInput
                            label='Password'
                            size={6}
                            name="password"
                            type="password"
                            control={control}
                            error={errors.password}
                            rules={{
                                required: "Campo requerido",
                                minLength: { value: 6, message: "Mínimo 6 caracteres" },
                            }}
                        />
                        <AlphanumericInput
                            label='Cambio de Password'
                            size={6}
                            name="cambioPassword"
                            control={control}
                            error={errors.cambioPassword}
                        />
                    </Row>

                    <Row>
                        <AlphanumericInput
                            label='Nombre'
                            size={12}
                            name="nombre"
                            control={control}
                            error={errors.nombre}
                            rules={{
                                required: "Campo requerido",
                                minLength: { value: 3, message: "Mínimo 3 caracteres" },
                                maxLength: { value: 200, message: "Máximo 200 caracteres" },
                            }}
                        />
                    </Row>
                </section>
            </Form>
        </main>
    );
};

export default UsuarioView;
